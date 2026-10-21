import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AlertComponent } from './shared/components/ui/alert/alert.component';
import { AlertService } from './core/services/alert.service';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    AlertComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'Angular Ecommerce Dashboard | TailAdmin';
  alertService = inject(AlertService);
  authService = inject(AuthService);

  ngOnInit(): void {
    const savedDir = localStorage.getItem('dir');
    if (savedDir === 'rtl') {
      document.documentElement.setAttribute('dir', 'rtl');
    }
  }
}
