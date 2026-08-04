import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationHostComponent } from './shared/components/notification-host/notification-host.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NotificationHostComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'tickefy';
}
