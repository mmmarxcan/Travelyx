import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, map } from 'rxjs';

export interface Place {
  id: string;
  name: string;
  type: 'hotel' | 'restaurant' | 'tourism';
  lat: number;
  lng: number;
  icon: string;
  description: {
    es: string;
    en: string;
  };
  // Campos para filtros
  stars?: number;
  price_range?: number;
  accommodation_type?: string;
  cuisine?: string;
  delivery?: boolean;
  requires_reservation?: boolean;
  price_adult?: number;
  estimated_duration?: string;
  image?: string;
  dishes?: Dish[];
}

export interface Dish {
  id: number;
  name_es: string;
  name_en?: string;
  description_es?: string;
  description_en?: string;
  price: number;
  image_url?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private apiUrl = `${environment.apiUrl}/places`;

  constructor(private http: HttpClient) { }

  getPlaces(): Observable<Place[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(backendPlaces => backendPlaces.map(p => this.mapToPlace(p)))
    );
  }

  private mapToPlace(p: any): Place {
    const type = this.mapType(p.category?.slug);
    
    // Buscar descripciones y primera imagen
    const descEs = p.translations?.find((t: any) => t.language_code === 'es')?.description || p.description || '';
    const descEn = p.translations?.find((t: any) => t.language_code === 'en')?.description || '';
    const mainImage = p.images && p.images.length > 0 ? p.images[0].image_url : null;

    return {
      id: p.id.toString(),
      name: p.name,
      type: type,
      lat: p.lat,
      lng: p.lng,
      icon: p.icon || this.getDefaultIcon(type),
      description: {
        es: descEs || 'Sin descripción disponible.',
        en: descEn || descEs || 'No description available.' 
      },
      // Campos extendidos
      stars: p.stars,
      price_range: p.price_range,
      accommodation_type: p.accommodation_type,
      cuisine: p.cuisine,
      delivery: p.delivery,
      requires_reservation: p.requires_reservation,
      price_adult: p.price_adult,
      estimated_duration: p.estimated_duration,
      image: mainImage,
      dishes: p.dishes
    };
  }

  private mapType(slug: string): 'hotel' | 'restaurant' | 'tourism' {
    if (slug === 'tourist_spot') return 'tourism';
    if (slug === 'restaurant') return 'restaurant';
    return 'hotel';
  }

  private getDefaultIcon(type: string): string {
    switch (type) {
      case 'hotel': return '🏨';
      case 'restaurant': return '🍴';
      case 'tourism': return '📍';
      default: return '🚩';
    }
  }
}
