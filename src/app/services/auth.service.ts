import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@capacitor/storage';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { tap, switchMap } from 'rxjs';
import { environment } from 'src/environments/environment';

const ACCESS_TOKEN_KEY = 'test-access-token';
const REFRESH_TOKEN_KEY = 'test-refresh-token';

interface todoItem {
  createdAt?: string;
  deleted?: boolean;
  done?: boolean;
  id?: string;
  label?: string;
  updatedAt?: string;
  user?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Init with null to filter out the first value in a guard!
  isAuthenticated: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  currentAccessToken = null;
  url = environment.apiUrl;

  public todoEvent$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public todoList$: BehaviorSubject<any> = new BehaviorSubject(null);

  constructor(private http: HttpClient, private router: Router) {
    this.loadToken();
  }

  // Load accessToken on startup
  async loadToken() {
    const token = await Storage.get({ key: ACCESS_TOKEN_KEY });
    if (token && token.value) {
      this.currentAccessToken = token.value;
      this.isAuthenticated.next(true);
    } else {
      this.isAuthenticated.next(false);
    }
  }

  // Create new user
  signUp(credentials: { username; password }): Observable<any> {
    console.log('AuthService ~ signUp ~ credentials', credentials);
    return this.http.post(`${this.url}/users`, credentials);
  }

  // Sign in a user and store access and refres token
  login(credentials: { username; password }): Observable<any> {
    console.log('AuthService ~ login ~ credentials', credentials);
    return this.http.post(`${this.url}/auth/signin`, credentials).pipe(
      switchMap((tokens: { accessToken; refreshToken }) => {
        console.log('AuthService ~ switchMap ~ tokens', tokens);
        this.currentAccessToken = tokens.accessToken;
        const storeAccess = Storage.set({
          key: ACCESS_TOKEN_KEY,
          value: tokens.accessToken,
        });
        const storeRefresh = Storage.set({
          key: REFRESH_TOKEN_KEY,
          value: tokens.refreshToken,
        });
        return from(Promise.all([storeAccess, storeRefresh]));
      }),
      tap((_) => {
        this.isAuthenticated.next(true);
      })
    );
  }

  // Potentially perform a logout operation inside your API
  // or simply remove all local tokens and navigate to login
  logout() {
    return this.http
      .post(`${this.url}/auth/logout`, {})
      .pipe(
        switchMap(() => {
          this.currentAccessToken = null;
          // Remove all stored tokens
          const deleteAccess = Storage.remove({ key: ACCESS_TOKEN_KEY });
          const deleteRefresh = Storage.remove({ key: REFRESH_TOKEN_KEY });
          return from(Promise.all([deleteAccess, deleteRefresh]));
        }),
        tap((_) => {
          this.isAuthenticated.next(false);
          this.router.navigateByUrl('/login', { replaceUrl: true });
        })
      )
      .subscribe();
  }

  // Load the refresh token from storage
  // then attach it as the header for one specific API call
  getNewAccessToken() {
    const refreshToken = from(Storage.get({ key: REFRESH_TOKEN_KEY }));
    return refreshToken.pipe(
      switchMap((token) => {
        if (token && token.value) {
          const httpOptions = {
            headers: new HttpHeaders({
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token.value}`,
            }),
          };
          console.log('AuthService ~ switchMap ~ httpOptions', httpOptions);
          return this.http.get(`${this.url}/auth/refresh-token`, httpOptions);
        } else {
          // No stored refresh token
          return of(null);
        }
      })
    );
  }

  // Store a new access token
  storeAccessToken(accessToken) {
    console.log('AuthService ~ storeAccessToken ~ accessToken', accessToken);
    this.currentAccessToken = accessToken;
    return from(Storage.set({ key: ACCESS_TOKEN_KEY, value: accessToken }));
  }

  getMe() {
    return this.http.get(`${this.url}/me`);
  }

  getTodos() {
    return this.http.get(`${this.url}/todos`).pipe(tap((res) => {
      this.todoList$.next(res);
      // console.log('AuthService ~ getTodos tap ~ this.todoList$', this.todoList$.value);
    }));
  }

  // Create new todo
  // postTodo(todo: { label }): Observable<any> {
  postTodo(todo: todoItem): Observable<any> {
    console.log('AuthService ~ postTodo ~ todo', todo);
    return this.http.post(`${this.url}/todo`, todo).pipe(tap((res) => {
      console.log('AuthService ~ postTodo tap ~ res', res);
      this.todoEvent$.next(true);
      // this.todoList$.value.rows.push(todo);
      // this.todoList$.next(res);
      }));
  }

  // Update  todo
  putTodo(todo: todoItem, id): Observable<any> {
    console.log('AuthService ~ putTodo ~ todo', todo, id);
    return this.http.put(`${this.url}/todo/:${id}`, todo).pipe(tap((res) => {
      console.log('AuthService ~ putTodo tap ~ res', res);
      this.todoEvent$.next(true);
      }));
  }

  // Delete todo
  deleteTodo(id): Observable<any> {
    return this.http.delete(`${this.url}/todo/:${id}`).pipe(tap((res) => {
      console.log('AuthService ~ deleteTodo tap ~ res', res);
      this.todoEvent$.next(true);
      }));
  }
}
