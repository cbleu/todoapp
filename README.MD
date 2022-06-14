# README

## initialisation

```bash
ionic start todoapp blank --type=angular

ionic g service services/auth

ionic g guard guards/auth --implements CanLoad

ionic g page pages/home
ionic g page pages/login
ionic g page pages/lost-password
ionic g page pages/modal-add-todo

ionic g pipe pipes/group-by-date

ionic g directive directives/debounce-click

npm install @capacitor/storage
npm install @auth0/angular-jwt
npm install dayjs

````
