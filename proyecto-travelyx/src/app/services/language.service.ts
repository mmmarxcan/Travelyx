import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLangSubject = new BehaviorSubject<'es' | 'en'>('es');
  public currentLang$ = this.currentLangSubject.asObservable();

  public dictionary = {
    'es': {
      'welcome': '¡Hola! Soy Polly. Toca un botón para comenzar.',
      'welcome_1': '¡Qué onda! Soy Polly. ¿Listo para explorar Progreso?',
      'welcome_2': '¡Hola de nuevo! Si buscas los mejores mariscos, yo te ayudo.',
      'welcome_3': '¡Bienvenido! Yo te guiaré por todo el malecón hoy.',
      'welcome_4': '¿Sabías que los mejores atardeceres están junto al muelle? ¡Vamos!',
      'tip_1': '¡Tip de Polly! No olvides tu bloqueador solar si vas a la playa.',
      'tip_2': '¡Hey! Si vas al malecón, prueba las marquesitas, ¡son deliciosas!',
      'hotels': '¡Excelente elección! Buscando los mejores hoteles...',
      'restaurants': '¡Hmm, qué rico! Veamos dónde comer mariscos.',
      'tourism': '¡Vamos a la costa! Preparando ruta turística.',
      'map': 'Abriendo el mapa interactivo de Progreso...',
      'poke': '¡Jeje, me haces cosquillas!',
      'langChanged': '¡Entendido! Ahora hablaremos en Español.',
      'btnHotels': 'Hoteles',
      'btnRestaurants': 'Restaurantes',
      'btnTourism': 'Zonas Turísticas',
      'btnMap': 'Mapa interactivo',
      'btnBack': 'Volver',
      'subtitle': 'Progreso, Yucatán',
      'progreso': 'Progreso, Yucatán',
      'touristZone': 'Zona Turística',
      'mapInstruction': 'Selecciona un marcador en el mapa para descubrir más información.',
      'kioskTooltip': '¡Estás aquí!'
    },
    'en': {
      'welcome': 'Hello! I am Polly. Tap a button to start.',
      'welcome_1': 'Hey there! I am Polly. Ready to explore Progreso?',
      'welcome_2': 'Hi! If you are looking for the best seafood, I can help.',
      'welcome_3': 'Welcome! I will be your guide along the pier today.',
      'welcome_4': 'Did you know the best sunsets are by the pier? Let\'s go!',
      'tip_1': 'Polly tip! Don\'t forget your sunscreen if you hit the beach.',
      'tip_2': 'Hey! If you go to the pier, try the marquesitas, they are delicious!',
      'hotels': 'Great choice! Finding the best hotels...',
      'restaurants': 'Yummy! Let\'s see where to eat seafood.',
      'tourism': 'Let\'s hit the beach! Preparing tourist route.',
      'map': 'Opening the Progreso interactive map...',
      'poke': 'Hehe, that tickles!',
      'langChanged': 'Got it! We will speak in English now.',
      'btnHotels': 'Hotels',
      'btnRestaurants': 'Restaurants',
      'btnTourism': 'Tourist Areas',
      'btnMap': 'Interactive Map',
      'btnBack': 'Back',
      'subtitle': 'Progreso, Yucatan',
      'progreso': 'Progreso, Yucatan',
      'touristZone': 'Tourist Area',
      'mapInstruction': 'Select a marker on the map to discover more information.',
      'kioskTooltip': 'You are here!'
    }
  };

  constructor() {}

  get currentLang() {
    return this.currentLangSubject.value;
  }

  setLanguage(lang: 'es' | 'en') {
    if (this.currentLang !== lang) {
      this.currentLangSubject.next(lang);
    }
  }

  translate(key: string): string {
    return (this.dictionary as any)[this.currentLang][key] || key;
  }
}
