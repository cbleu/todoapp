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
      remember: [true],
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
        console.log('LoginPage ~ Login Failed', res.message);
        await loading.dismiss();
        const alert = await this.alertController.create({
          header: 'La connexion a échoué',
          message: res.message,
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
        console.log('LoginPage ~ Signup Failed', res.message);
        await loading.dismiss();
        const alert = await this.alertController.create({
          header: "L'enregistrement a échoué",
          message: res.message,
          buttons: ['OK'],
        });
        await alert.present();
      }
    );
  }
  onCheckRemeber(event) {
    console.log('LoginPage ~ onCheckRemeber ~ event', event.detail.checked, this.credentials.value.remember);
    if (event.detail.checked) {
      // TODO Gérer la sauvegarde ou pas du jeton
    }

  }
}
