import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  credentials: FormGroup;

  validation_messages = {
    username: [
      { type: 'required', message: "L'email est obligatiore." },
      { type: 'pattern', message: 'Entrez un email valide.' },
    ],
    password: [
      { type: 'required', message: 'Ce champ est obligatoire.' },
      { type: 'minlength', message: 'Ce champ doit avoir 6 caractères.' },
    ],
  };

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private authService: AuthService
  ) {}

  // Easy access for form fields
  get username() {
    return this.credentials.get('username');
  }

  get password() {
    return this.credentials.get('password');
  }

  ngOnInit() {
    this.credentials = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
    });
  }

  async login() {
    const loading = await this.loadingController.create();
    await loading.present();

    this.authService.login(this.credentials.value).subscribe(
      async (_) => {
        await loading.dismiss();
        this.router.navigateByUrl('/home', { replaceUrl: true });
      },
      async (res) => {
        await loading.dismiss();
        const alert = await this.alertController.create({
          header: 'Login failed',
          message: res.error.msg,
          buttons: ['OK'],
        });
        await alert.present();
      }
    );
  }

  async signUp() {
    const loading = await this.loadingController.create();
    await loading.present();

    this.authService.signUp(this.credentials.value).subscribe(
      async (_) => {
        await loading.dismiss();
        this.login();
      },
      async (res) => {
        console.log('LoginPage ~ res', res);
        await loading.dismiss();
        const alert = await this.alertController.create({
          header: 'Signup failed',
          message: res.error.msg,
          buttons: ['OK'],
        });
        await alert.present();
      }
    );
  }
}
