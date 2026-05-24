"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranslationService = void 0;
const db_1 = __importDefault(require("../db"));
/**
 * Service to handle background translations
 */
class TranslationService {
    /**
     * Translates text using MyMemory API (Reliable public API)
     */
    static translateText(text, targetLang) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                console.log(`🌐 Background Translation: Translating to ${targetLang}...`);
                const sourceLang = targetLang === 'es' ? 'en' : 'es';
                const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
                const response = yield fetch(url);
                if (!response.ok) {
                    throw new Error(`Status ${response.status}`);
                }
                const data = yield response.json();
                if ((_a = data.responseData) === null || _a === void 0 ? void 0 : _a.translatedText) {
                    return data.responseData.translatedText;
                }
                throw new Error('Empty translation response');
            }
            catch (error) {
                console.error('❌ Translation API failed. Using fallback mock.');
                // FALLBACK MOCK: Append prefix for testing purposes
                return `[Auto-${targetLang.toUpperCase()}] ${text}`;
            }
        });
    }
    /**
     * Checks for missing translations and triggers background processing
     */
    static processMissingTranslations(places) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            for (const place of places) {
                // Si falta español (poco probable ya que suele ser el origen)
                const hasEs = (_a = place.translations) === null || _a === void 0 ? void 0 : _a.some((t) => t.language_code === 'es');
                const hasEn = (_b = place.translations) === null || _b === void 0 ? void 0 : _b.some((t) => t.language_code === 'en');
                if (!hasEn && hasEs) {
                    const sourceText = place.translations.find((t) => t.language_code === 'es').description;
                    this.runInBackground(place.id, sourceText, 'en');
                }
                else if (!hasEs && hasEn) {
                    const sourceText = place.translations.find((t) => t.language_code === 'en').description;
                    this.runInBackground(place.id, sourceText, 'es');
                }
            }
        });
    }
    static runInBackground(placeId, text, targetLang) {
        return __awaiter(this, void 0, void 0, function* () {
            // 🔥 NO usamos await aquí para que sea realmente en SEGUNDO PLANO
            this.translateText(text, targetLang).then((translatedText) => __awaiter(this, void 0, void 0, function* () {
                if (translatedText === text)
                    return; // Nada nuevo
                console.log(`💾 Persisting translation for Place #${placeId} [${targetLang}]`);
                yield db_1.default.placeTranslation.upsert({
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
            })).catch(err => {
                console.error(`❌ Background Thread Fail: ${err.message}`);
            });
        });
    }
}
exports.TranslationService = TranslationService;
