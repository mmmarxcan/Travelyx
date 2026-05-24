import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config';

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private apiUrl = `${API_BASE_URL}/places`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<any[]> {
    // Añadimos un timestamp para evitar el error 304 del navegador
    const cacheBuster = `?t=${new Date().getTime()}`;
    return this.http.get<any[]>(this.apiUrl + cacheBuster);
  }

  /** Actualizar datos generales */
  update(id: number, place: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}`, place);
  }

  /** Actualizar el estado de aprobación de un negocio */
  updateStatus(id: number, status: string, isActive: boolean): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/status`, { 
      status, 
      is_active: isActive 
    });
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
