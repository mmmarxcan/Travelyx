import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PlacesOwnerService {
  private readonly api = 'http://localhost:3000/api/places';

  constructor(private http: HttpClient) {}

  /** Negocios del propietario autenticado */
  getMyPlaces(ownerId: number): Observable<any[]> {
    // Añadimos cache-buster para evitar el error 304/0 en navegadores con caché agresiva
    const cacheBuster = `&t=${new Date().getTime()}`;
    return this.http.get<any[]>(`${this.api}/mine?owner_id=${ownerId}${cacheBuster}`);
  }

  /** Registrar un nuevo negocio */
  createPlace(data: any): Observable<any> {
    return this.http.post<any>(this.api, data);
  }

  /** Actualizar datos de un negocio propio */
  /** Obtener servicios (amenities) filtrados por categoría */
  getAmenities(categoryId?: number): Observable<any[]> {
    const url = categoryId 
      ? `${this.api}/amenities?category_id=${categoryId}` 
      : `${this.api}/amenities`;
    return this.http.get<any[]>(url);
  }
}
