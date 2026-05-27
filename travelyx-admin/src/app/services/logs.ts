import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config';

@Injectable({
  providedIn: 'root'
})
export class LogsService {
  private apiUrl = `${API_BASE_URL}/logs/security`;

  constructor(private http: HttpClient) {}

  getSecurityLogs(): Observable<{ logs: any[] }> {
    return this.http.get<{ logs: any[] }>(this.apiUrl);
  }
}
