import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../../services/users';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users implements OnInit {
  users: any[] = [];
  isModalOpen = false;
  newUserEmail = '';
  newUserName = '';
  newUserPhone = '';
  isCreating = false;
  currentTempPassword = '';

  constructor(
    private usersService: UsersService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.usersService.getAll().subscribe({
      next: (data) => {
        this.users = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar usuarios:', err)
    });
  }

  trackById(index: number, item: any): number {
    return item.id;
  }

  openCreateModal(): void {
    this.isModalOpen = true;
    this.newUserEmail = '';
    this.newUserName = '';
    this.newUserPhone = '';
    this.currentTempPassword = '';
    this.isCreating = false;
  }

  // Solo se llama cuando el usuario presiona "Cerrar y Continuar" o "Cancelar"
  closeCreateModal(): void {
    this.isModalOpen = false;
    this.currentTempPassword = '';
    this.isCreating = false;
    this.loadUsers(); // Refresca la lista al cerrar
  }

  createUser(): void {
    if (!this.newUserEmail || !this.newUserName) return;
    this.isCreating = true;

    const userData = {
      email: this.newUserEmail,
      full_name: this.newUserName,
      phone: this.newUserPhone
    };

    this.usersService.create(userData).subscribe({
      next: (res) => {
        this.isCreating = false;
        if (res?.user?.tempPassword) {
          // Mostrar la pantalla de éxito DENTRO del modal (no cerrar aún)
          this.currentTempPassword = res.user.tempPassword;
          this.cdr.detectChanges();
        } else {
          // Si no viene password, cerramos directamente
          this.closeCreateModal();
        }
      },
      error: (err) => {
        this.isCreating = false;
        alert('Error al crear: ' + (err.error?.error || 'Error de conexión con el servidor'));
      }
    });
  }

  toggleStatus(user: any): void {
    const newStatus = !user.is_active;

    this.usersService.updateStatus(user.id, newStatus).subscribe({
      next: (res) => {
        const index = this.users.findIndex(u => u.id === user.id);
        if (index !== -1) {
          this.users[index].is_active = res.is_active;
          this.cdr.detectChanges();
        }
      },
      error: () => alert('Error al cambiar estado')
    });
  }

  resetPassword(user: any): void {
    alert(`Se ha solicitado un nuevo correo de recuperación para ${user.email}`);
  }
}
