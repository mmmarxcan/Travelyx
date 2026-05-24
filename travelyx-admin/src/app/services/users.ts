import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiUrl = `${API_BASE_URL}/users`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  create(user: { email: string, full_name?: string, phone?: string }): Observable<any> {
    return this.http.post<any>(this.apiUrl, user);
  }

  updateStatus(id: number, is_active: boolean): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/status`, { is_active });
  }

}
