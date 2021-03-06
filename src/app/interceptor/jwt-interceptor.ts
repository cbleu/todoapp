import { Injectable } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from './../../environments/environment';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
import { catchError, finalize, switchMap, filter, take } from 'rxjs/operators';
import { ToastController } from '@ionic/angular';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  // Used for queued API calls while refreshing tokens
  tokenSubject: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  isRefreshingToken = false;

  constructor(private authService: AuthService, private toastCtrl: ToastController) {}

  // Intercept every HTTP call
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('JwtInterceptor ~ intercept ~ request', request);
    // console.log('JwtInterceptor ~ intercept ~ next', next);
    // Check if we need additional token logic or not
    if (this.isInBlockedList(request.url)) {
      return next.handle(request);
    } else {
      return next.handle(this.addToken(request)).pipe(
        catchError((err) => {
          if (err instanceof HttpErrorResponse) {
            switch (err.status) {
              case 400:
                return this.handle400Error(err);
              case 401:
                return this.handle401Error(request, next);
              default:
                console.log("error", err);
                return throwError(() => new Error(err.error.message));
            }
          } else {
            // return throwError(err);
            return throwError(() => new Error(err.message));
          }
        })
      );
    }
  }

  // Filter out URLs where you don't want to add the token!
  private isInBlockedList(url: string): Boolean {
    // Example: Filter out our login and logout API call
    if (
      url == `${environment.apiUrl}/auth` ||
      url == `${environment.apiUrl}/auth/logout` ||
      url == `${environment.apiUrl}/users`  // register user
    ) {
      return true;
    } else {
      return false;
    }
  }

  // Add our current access token from the service if present
  private addToken(req: HttpRequest<any>) {
    if (this.authService.currentAccessToken) {
      return req.clone({
        headers: new HttpHeaders({
          Authorization: `Bearer ${this.authService.currentAccessToken}`,
        }),
      });
    } else {
      return req;
    }
  }
  // Indicates our access token is invalid, try to load a new one
  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    console.log('JwtInterceptor ~ handle401Error ~ request', request);
    // console.log('JwtInterceptor ~ handle401Error ~ next', next);
    // Check if another call is already using the refresh logic
    if (!this.isRefreshingToken) {
      // Set to null so other requests will wait
      // until we got a new token!
      this.tokenSubject.next(null);
      this.isRefreshingToken = true;
      this.authService.currentAccessToken = null;

      // First, get a new access token
      return this.authService.getNewAccessToken().pipe(
        switchMap((token: any) => {
          if (token) {
            // Store the new token
            const accessToken = token.accessToken;
            return this.authService.storeAccessToken(accessToken).pipe(
              switchMap((_) => {
                // Use the subject so other calls can continue with the new token
                this.tokenSubject.next(accessToken);

                // Perform the initial request again with the new token
                return next.handle(this.addToken(request));
              })
            );
          } else {
            // No new token or other problem occurred
            return of(null);
          }
        }),
        finalize(() => {
          // Unblock the token reload logic when everything is done
          this.isRefreshingToken = false;
        })
      );
    } else {
      // "Queue" other calls while we load a new token
      return this.tokenSubject.pipe(
        filter((token) => token !== null),
        take(1),
        switchMap((token) => {
          // Perform the request again now that we got a new token!
          return next.handle(this.addToken(request));
        })
      );
    }
  }

  // We are not just authorized, we couldn't refresh token
  // or something else along the caching went wrong!
  private async handle400Error(err) {
    console.log('JwtInterceptor ~ handle400Error ~ err', err);
    // Potentially check the exact error reason for the 400
    // then log out the user automatically
    const toast = await this.toastCtrl.create({
      message: 'Logged out due to authentication mismatch',
      duration: 2000,
    });
    toast.present();
    this.authService.logout();
    return of(null);
  }
}
