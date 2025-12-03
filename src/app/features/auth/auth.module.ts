import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthRoutingModule } from './auth-routing.module';
import { LoginPageComponent } from './components/login-page/login-page.component';

@NgModule({
  declarations: [],
  imports: [CommonModule, ReactiveFormsModule, AuthRoutingModule, LoginPageComponent],
})
export class AuthModule {}
