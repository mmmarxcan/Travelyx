import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogsService } from '../../../services/logs';

@Component({
  selector: 'app-security-logs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './security-logs.html',
  styleUrls: ['./security-logs.css']
})
export class SecurityLogs implements OnInit {
  logs: any[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(private logsService: LogsService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.fetchLogs();
  }

  fetchLogs() {
    this.isLoading = true;
    this.cdr.detectChanges();
    this.logsService.getSecurityLogs().subscribe({
      next: (res) => {
        if (res && res.logs) {
          this.logs = res.logs;
        } else {
          this.logs = [];
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching logs', err);
        this.errorMessage = 'No se pudieron cargar los logs. Verifique su conexión y permisos.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getBadgeClass(level: string): string {
    switch(level?.toLowerCase()) {
      case 'error': return 'badge-danger';
      case 'warn': return 'badge-warning';
      case 'info': return 'badge-info';
      default: return 'badge-secondary';
    }
  }
}
