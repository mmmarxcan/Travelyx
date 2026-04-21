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
      'welcome': [
        '¡Hola! Soy Polly. Toca un botón para comenzar.',
        '¡Qué onda! Soy Polly. ¿Listo para explorar Progreso?',
        '¡Hola de nuevo! Si buscas los mejores mariscos, yo te ayudo.',
        '¡Bienvenido! Yo te guiaré por todo el malecón hoy.',
        '¿Sabías que los mejores atardeceres están junto al muelle? ¡Vamos!'
      ],
      'tip': [
        '¡Tip de Polly! No olvides tu bloqueador solar si vas a la playa.',
        '¡Hey! Si vas al malecón, prueba las marquesitas, ¡son deliciosas!',
        'El mar aquí es súper tranquilo, ideal para nadar un rato.',
        'En la zona turística encontrarás recuerdos súper lindos de Progreso.'
      ],
      'hotels': [
        '¡Excelente elección! Déjame buscar los hoteles más cómodos para ti.',
        '¡Hora de descansar! Vamos a encontrar el cuarto perfecto.',
        '¿Buscas dónde dormir? ¡Tengo unas recomendaciones increíbles de hoteles!',
        '¡Vamos a buscarte un hotel padrísimo!'
      ],
      'restaurants': [
        '¡Uf, qué rico! Me encantan los mariscos. Vamos a ver los restaurantes.',
        '¡Se me hace agua la boca! Vamos a buscarte algo delicioso para comer.',
        '¿Con hambre? ¡Perfecto! Progreso tiene comida deliciosa, te muestro.',
        '¡Llegó la hora de la comida! Vamos a ver qué se te antoja hoy.'
      ],
      'tourism': [
        '¡A explorar se ha dicho! Veamos qué lugares interesantes hay por aquí.',
        '¡Saca tu cámara! Vamos a buscar los lugares más bonitos para tomar fotos.',
        '¡Me encanta la aventura! Te mostraré los mejores puntos turísticos.',
        '¡Vamos a turistear! Progreso tiene muchísimos secretos que mostrarte.'
      ],
      'map': [
        '¡Me encanta el mapa! Te mostraré todos los lugares desde arriba.',
        '¡Vamos a volar por la ciudad! Abriendo el mapa interactivo...',
        '¡Mapa listo! Toca cualquier marcador para que te cuente sobre él.',
        '¡Navegación activada! Saca tus dotes de explorador en nuestro mapa.'
      ],
      'poke': [
        '¡Jeje, me haces cosquillas!',
        '¡Ey, esa es mi pancita!',
        '¡Huy! ¡No me empujes!',
        '¡Jajaja, basta!'
      ],
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
      'kioskTooltip': '¡Estás aquí!',
      'qrPromptTitle': '¿Llevas la ruta contigo?',
      'qrPromptDesc': '¡Uy, me encanta ese lugar! Ya te dibujé la ruta en el mapa. ¿Te gustaría que te prepare un código QR mágico para llevarte las instrucciones en tu teléfono?',
      'qrBtnYes': '¡Sí, por favor!',
      'qrBtnNo': 'No, solo quería ver',
      'qrScanTitle': '¡Aquí tienes tu mapa!',
      'qrScanDesc': 'Apunta tu cámara hacia el código. Tienes 30 segunditos antes de que cierre esta ventana.'
    },
    'en': {
      'welcome': [
        'Hello! I am Polly. Tap a button to start.',
        'Hey there! I am Polly. Ready to explore Progreso?',
        'Hi! If you are looking for the best seafood, I can help.',
        'Welcome! I will be your guide along the pier today.',
        'Did you know the best sunsets are by the pier? Let\'s go!'
      ],
      'tip': [
        'Polly tip! Don\'t forget your sunscreen if you hit the beach.',
        'Hey! If you go to the pier, try the marquesitas, they are delicious!',
        'The sea here is super calm, perfect for a swim.',
        'You can find beautiful souvenirs in the tourist area.'
      ],
      'hotels': [
        'Excellent choice! Let me find the most comfortable hotels for you.',
        'Time to rest! Let us find the perfect room.',
        'Looking for a place to sleep? I have some incredible hotel recommendations!',
        'Let us find you an awesome hotel!'
      ],
      'restaurants': [
        'Yummy! I love seafood. Let us see the restaurants.',
        'My mouth is watering! Let us find you something delicious to eat.',
        'Hungry? Perfect! Progreso has amazing food, let me show you.',
        'It is lunch time! Let us see what you are craving today.'
      ],
      'tourism': [
        'Let us explore! Let us see what interesting places are around here.',
        'Get your camera ready! Let us find the most beautiful places to take photos.',
        'I love adventure! I will show you the best tourist spots.',
        'Let us go sightseeing! Progreso has many secrets to show you.'
      ],
      'map': [
        'I love the map! I will show you all the places from above.',
        'Let us fly over the city! Opening the interactive map...',
        'Map is ready! Tap any marker so I can tell you about it.',
        'Navigation activated! Bring out your inner explorer on our map.'
      ],
      'poke': [
        'Hehe, that tickles!',
        'Hey, that is my tummy!',
        'Whoops! Do not push me!',
        'Haha, stop it!'
      ],
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
      'kioskTooltip': 'You are here!',
      'qrPromptTitle': 'Take the route with you?',
      'qrPromptDesc': 'Oh, I love that place! I just drew the route on the map for you. Would you like me to prepare a magic QR code so you can take the directions on your phone?',
      'qrBtnYes': 'Yes, please!',
      'qrBtnNo': 'No, just looking',
      'qrScanTitle': 'Here is your map!',
      'qrScanDesc': 'Point your camera at the code. You have 30 quick seconds before I close this window.'
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
    const value = (this.dictionary as any)[this.currentLang][key];
    if (Array.isArray(value)) {
        return value[Math.floor(Math.random() * value.length)];
    }
    return value || key;
  }
}
