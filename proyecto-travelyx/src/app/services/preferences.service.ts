import { Injectable } from '@angular/core';

export interface HotelPreferences {
  budget: number | null;   // 1=Económico, 2=Intermedio, 3=Premium
  stars: number | null;    // 0=Any, 1-5
  type: string | null;     // 'Hotel Familiar', 'Hotel de Playa', etc.
}

export interface RestaurantPreferences {
  priceRange: number | null;
  cuisine: string | null;
  features: string[];
}

export interface TourismPreferences {
  type: string | null;
  price: string | null;    // 'free' | 'paid'
}

@Injectable({ providedIn: 'root' })
export class PreferencesService {
  private _hotel: HotelPreferences = { budget: null, stars: null, type: null };
  private _restaurant: RestaurantPreferences = { priceRange: null, cuisine: null, features: [] };
  private _tourism: TourismPreferences = { type: null, price: null };

  setHotelPreferences(prefs: HotelPreferences) {
    this._hotel = prefs;
  }

  getHotelPreferences(): HotelPreferences {
    return this._hotel;
  }

  setRestaurantPreferences(prefs: RestaurantPreferences) {
    this._restaurant = prefs;
  }

  getRestaurantPreferences(): RestaurantPreferences {
    return this._restaurant;
  }

  setTourismPreferences(prefs: TourismPreferences) {
    this._tourism = prefs;
  }

  getTourismPreferences(): TourismPreferences {
    return this._tourism;
  }

  clearAll() {
    this._hotel = { budget: null, stars: null, type: null };
    this._restaurant = { priceRange: null, cuisine: null, features: [] };
    this._tourism = { type: null, price: null };
  }
}
