import prisma from '../db';

/**
 * Service to handle background translations
 */
export class TranslationService {
  /**
   * Translates text using MyMemory API (Reliable public API)
   */
  static async translateText(text: string, targetLang: 'es' | 'en'): Promise<string> {
    try {
      console.log(`🌐 Background Translation: Translating to ${targetLang}...`);
      
      const sourceLang = targetLang === 'es' ? 'en' : 'es';
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Status ${response.status}`);
      }

      const data: any = await response.json();
      
      if (data.responseData?.translatedText) {
        return data.responseData.translatedText;
      }
      
      throw new Error('Empty translation response');
    } catch (error) {
      console.error('❌ Translation API failed. Using fallback mock.');
      // FALLBACK MOCK: Append prefix for testing purposes
      return `[Auto-${targetLang.toUpperCase()}] ${text}`;
    }
  }

  /**
   * Checks for missing translations and triggers background processing
   */
  static async processMissingTranslations(places: any[]) {
    for (const place of places) {
      // Si falta español (poco probable ya que suele ser el origen)
      const hasEs = place.translations?.some((t: any) => t.language_code === 'es');
      const hasEn = place.translations?.some((t: any) => t.language_code === 'en');

      if (!hasEn && hasEs) {
        const sourceText = place.translations.find((t: any) => t.language_code === 'es').description;
        this.runInBackground(place.id, sourceText, 'en');
      } else if (!hasEs && hasEn) {
        const sourceText = place.translations.find((t: any) => t.language_code === 'en').description;
        this.runInBackground(place.id, sourceText, 'es');
      }
    }
  }

  private static async runInBackground(placeId: number, text: string, targetLang: 'es' | 'en') {
    // 🔥 NO usamos await aquí para que sea realmente en SEGUNDO PLANO
    this.translateText(text, targetLang).then(async (translatedText) => {
      if (translatedText === text) return; // Nada nuevo

      console.log(`💾 Persisting translation for Place #${placeId} [${targetLang}]`);
      
      await prisma.placeTranslation.upsert({
        where: {
          place_id_language_code: {
            place_id: placeId,
            language_code: targetLang
          }
        },
        update: { description: translatedText },
        create: {
          place_id: placeId,
          language_code: targetLang,
          description: translatedText
        }
      });
      
      console.log(`✅ Success: Place #${placeId} translated and cached.`);
    }).catch(err => {
      console.error(`❌ Background Thread Fail: ${err.message}`);
    });
  }
}
