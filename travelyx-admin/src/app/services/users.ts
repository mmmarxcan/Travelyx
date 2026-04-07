import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiUrl = 'http://localhost:3000/api/users';

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
