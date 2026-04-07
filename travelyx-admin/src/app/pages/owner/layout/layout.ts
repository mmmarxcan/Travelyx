import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-owner-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class OwnerLayout implements OnInit {
  ownerName = '';
  ownerEmail = '';

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.ownerName  = this.auth.getFullName() || 'Propietario';
    this.ownerEmail = this.auth.getEmail();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
