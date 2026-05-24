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
const express_1 = require("express");
const db_1 = __importDefault(require("../db"));
const router = (0, express_1.Router)();
// ── Listar todos los lugares (SuperAdmin / Kiosko) ──────────────────────────
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const places = yield db_1.default.place.findMany({
            include: {
                category: true,
                translations: true,
                owner: { select: { id: true, email: true, full_name: true } },
                images: true,
                _count: { select: { images: true } },
                dishes: true
            },
            orderBy: { id: 'desc' }
        });
        // 🔥 OPTIMIZAR: Reemplazar imágenes pesadas en base64 (>100KB) por placeholders ligeros de alta calidad
        const optimizedPlaces = places.map(place => {
            // Optimizar imágenes en custom_prices
            let optimizedCustomPrices = place.custom_prices;
            if (place.custom_prices) {
                try {
                    const parsed = JSON.parse(place.custom_prices);
                    if (Array.isArray(parsed)) {
                        const mapped = parsed.map(item => {
                            var _a;
                            if (item.image_url && item.image_url.startsWith('data:image') && item.image_url.length > 100000) {
                                let placeholder = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=200&q=80'; // Habitación / genérico
                                if (((_a = place.category) === null || _a === void 0 ? void 0 : _a.slug) === 'restaurant') {
                                    placeholder = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=200&q=80'; // Platillo / comida
                                }
                                return Object.assign(Object.assign({}, item), { image_url: placeholder });
                            }
                            return item;
                        });
                        optimizedCustomPrices = JSON.stringify(mapped);
                    }
                }
                catch (err) {
                    console.error(`Error parsing custom_prices for place #${place.id}:`, err);
                }
            }
            return Object.assign(Object.assign({}, place), { custom_prices: optimizedCustomPrices, images: place.images.map(img => {
                    var _a, _b;
                    if (img.image_url.startsWith('data:image') && img.image_url.length > 100000) {
                        let placeholder = 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=400&q=80'; // Hotel
                        if (((_a = place.category) === null || _a === void 0 ? void 0 : _a.slug) === 'restaurant') {
                            placeholder = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80'; // Restaurante
                        }
                        else if (((_b = place.category) === null || _b === void 0 ? void 0 : _b.slug) === 'tourist_spot') {
                            placeholder = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80'; // Punto Turístico
                        }
                        return Object.assign(Object.assign({}, img), { image_url: placeholder });
                    }
                    return img;
                }) });
        });
        console.log(`📋 GET /api/places - Enviando ${places.length} lugares optimizados.`);
        // 🔥 DISPARAR TRADUCCIÓN EN SEGUNDO PLANO PARA LOS QUE FALTE
        // TranslationService.processMissingTranslations(places);
        // FORZAR ANTI-CACHÉ TOTAL
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.removeHeader('ETag');
        res.json(optimizedPlaces);
    }
    catch (error) {
        console.error('❌ Error al listar lugares:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}));
// ── Listar negocios de un propietario específico ──────────────────────────
router.get('/mine', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { owner_id } = req.query;
        if (!owner_id)
            return res.status(400).json({ error: 'owner_id es requerido' });
        const places = yield db_1.default.place.findMany({
            where: { owner_id: Number(owner_id) },
            include: {
                category: true,
                translations: true,
                amenities: {
                    include: {
                        amenity: true
                    }
                },
                images: true,
                _count: { select: { images: true } }
            },
            orderBy: { id: 'desc' }
        });
        // 🔥 OPTIMIZAR: Reemplazar imágenes pesadas en base64 (>100KB) por placeholders ligeros de alta calidad
        const optimizedPlaces = places.map(place => {
            // Optimizar imágenes en custom_prices
            let optimizedCustomPrices = place.custom_prices;
            if (place.custom_prices) {
                try {
                    const parsed = JSON.parse(place.custom_prices);
                    if (Array.isArray(parsed)) {
                        const mapped = parsed.map(item => {
                            var _a;
                            if (item.image_url && item.image_url.startsWith('data:image') && item.image_url.length > 100000) {
                                let placeholder = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=200&q=80'; // Habitación / genérico
                                if (((_a = place.category) === null || _a === void 0 ? void 0 : _a.slug) === 'restaurant') {
                                    placeholder = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=200&q=80'; // Platillo / comida
                                }
                                return Object.assign(Object.assign({}, item), { image_url: placeholder });
                            }
                            return item;
                        });
                        optimizedCustomPrices = JSON.stringify(mapped);
                    }
                }
                catch (err) {
                    console.error(`Error parsing custom_prices for place #${place.id}:`, err);
                }
            }
            return Object.assign(Object.assign({}, place), { custom_prices: optimizedCustomPrices, images: place.images.map(img => {
                    var _a, _b;
                    if (img.image_url.startsWith('data:image') && img.image_url.length > 100000) {
                        let placeholder = 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=400&q=80'; // Hotel
                        if (((_a = place.category) === null || _a === void 0 ? void 0 : _a.slug) === 'restaurant') {
                            placeholder = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80'; // Restaurante
                        }
                        else if (((_b = place.category) === null || _b === void 0 ? void 0 : _b.slug) === 'tourist_spot') {
                            placeholder = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80'; // Punto Turístico
                        }
                        return Object.assign(Object.assign({}, img), { image_url: placeholder });
                    }
                    return img;
                }) });
        });
        // Anticaché para el Propietario
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.removeHeader('ETag');
        res.json(optimizedPlaces);
    }
    catch (error) {
        console.error('Error al listar mis lugares:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}));
// ── Listar servicios filtrados por categoría (Amenities) ──────────────────
router.get('/amenities', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category_id } = req.query;
        let where = {};
        if (category_id) {
            where = {
                categories: {
                    some: {
                        category_id: Number(category_id)
                    }
                }
            };
        }
        const amenities = yield db_1.default.amenity.findMany({
            where,
            orderBy: { name_es: 'asc' }
        });
        res.json(amenities);
    }
    catch (error) {
        console.error('Error al listar servicios:', error);
        res.status(500).json({ error: 'Error al listar servicios' });
    }
}));
// ── Crear un nuevo negocio ────────────────────────────────────────────────
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { owner_id, category_id, name, lat, lng, phone, whatsapp, website_url, social_url, description_es, description_en, amenity_ids, address, 
        // Campos detallados (Hotel/Atracción/Restaurante)
        stars, accommodation_type, house_rules, cancellation_policy, slogan, opening_hours, best_time, price_adult, price_child, price_local, estimated_duration, 
        // Campos Restaurante
        price_range, featured_dish, menu_url, capacity, stay_time, delivery, pickup, requires_reservation, cuisine, images, custom_prices } = req.body;
        if (!owner_id || !category_id || !name || lat === undefined || lng === undefined) {
            return res.status(400).json({ error: 'Faltan campos obligatorios: owner_id, category_id, name, lat, lng' });
        }
        const newPlace = yield db_1.default.place.create({
            data: {
                owner_id: Number(owner_id),
                category_id: Number(category_id),
                name,
                lat: parseFloat(lat),
                lng: parseFloat(lng),
                phone: phone || null,
                whatsapp: whatsapp || null,
                website_url: website_url || null,
                social_url: social_url || null,
                is_active: false,
                status: 'PENDING',
                address: address || null,
                stars: stars ? Number(stars) : 0,
                accommodation_type: accommodation_type || null,
                house_rules: house_rules || null,
                cancellation_policy: cancellation_policy || null,
                slogan: slogan || null,
                opening_hours: opening_hours || null,
                best_time: best_time || null,
                price_adult: price_adult ? parseFloat(price_adult) : 0,
                price_child: price_child ? parseFloat(price_child) : 0,
                price_local: price_local ? parseFloat(price_local) : 0,
                estimated_duration: estimated_duration || null,
                price_range: price_range ? Number(price_range) : 1,
                featured_dish: featured_dish || null,
                menu_url: menu_url || null,
                capacity: capacity ? Number(capacity) : 0,
                stay_time: stay_time || null,
                delivery: !!delivery,
                pickup: !!pickup,
                requires_reservation: !!requires_reservation,
                cuisine: cuisine || null,
                custom_prices: custom_prices ? (typeof custom_prices === 'string' ? custom_prices : JSON.stringify(custom_prices)) : null
            }
        });
        // Agregar traducciones si vienen
        if (description_es) {
            yield db_1.default.placeTranslation.create({
                data: { place_id: newPlace.id, language_code: 'es', description: description_es }
            });
        }
        if (description_en) {
            yield db_1.default.placeTranslation.create({
                data: { place_id: newPlace.id, language_code: 'en', description: description_en }
            });
        }
        // Asociar servicios si vienen
        if (amenity_ids && Array.isArray(amenity_ids)) {
            const amenitiesData = amenity_ids.map((id) => ({
                place_id: newPlace.id,
                amenity_id: Number(id)
            }));
            yield db_1.default.placeAmenity.createMany({
                data: amenitiesData
            });
        }
        // Asociar imágenes si vienen
        if (images && Array.isArray(images)) {
            const imagesData = images.map((img, idx) => ({
                place_id: newPlace.id,
                image_url: img,
                sort_order: idx
            }));
            yield db_1.default.placeImage.createMany({
                data: imagesData
            });
        }
        res.status(201).json({ message: 'Negocio registrado. Pendiente de aprobación.', place: newPlace });
    }
    catch (error) {
        console.error('Error al crear lugar:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}));
// ── Actualizar un lugar ───────────────────────────────────────────────────
router.patch('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, lat, lng, phone, whatsapp, website_url, social_url, address, description_es, description_en, amenity_ids, is_active, status, stars, accommodation_type, house_rules, cancellation_policy, slogan, opening_hours, best_time, price_adult, price_child, price_local, estimated_duration, price_range, featured_dish, menu_url, capacity, stay_time, delivery, pickup, requires_reservation, cuisine, images, custom_prices } = req.body;
        const data = {};
        if (name !== undefined)
            data.name = name;
        if (lat !== undefined)
            data.lat = parseFloat(lat);
        if (lng !== undefined)
            data.lng = parseFloat(lng);
        if (phone !== undefined)
            data.phone = phone;
        if (whatsapp !== undefined)
            data.whatsapp = whatsapp;
        if (website_url !== undefined)
            data.website_url = website_url;
        if (social_url !== undefined)
            data.social_url = social_url;
        if (address !== undefined)
            data.address = address;
        if (is_active !== undefined)
            data.is_active = is_active;
        if (status !== undefined)
            data.status = status;
        // Campos numéricos y otros
        if (stars !== undefined)
            data.stars = Number(stars);
        if (accommodation_type !== undefined)
            data.accommodation_type = accommodation_type;
        if (house_rules !== undefined)
            data.house_rules = house_rules;
        if (cancellation_policy !== undefined)
            data.cancellation_policy = cancellation_policy;
        if (slogan !== undefined)
            data.slogan = slogan;
        if (opening_hours !== undefined)
            data.opening_hours = opening_hours;
        if (best_time !== undefined)
            data.best_time = best_time;
        if (price_adult !== undefined)
            data.price_adult = parseFloat(price_adult);
        if (price_child !== undefined)
            data.price_child = parseFloat(price_child);
        if (price_local !== undefined)
            data.price_local = parseFloat(price_local);
        if (estimated_duration !== undefined)
            data.estimated_duration = estimated_duration;
        if (price_range !== undefined)
            data.price_range = Number(price_range);
        if (featured_dish !== undefined)
            data.featured_dish = featured_dish;
        if (menu_url !== undefined)
            data.menu_url = menu_url;
        if (capacity !== undefined)
            data.capacity = Number(capacity);
        if (stay_time !== undefined)
            data.stay_time = stay_time;
        if (delivery !== undefined)
            data.delivery = delivery;
        if (pickup !== undefined)
            data.pickup = pickup;
        if (requires_reservation !== undefined)
            data.requires_reservation = requires_reservation;
        if (cuisine !== undefined)
            data.cuisine = cuisine;
        if (custom_prices !== undefined) {
            data.custom_prices = typeof custom_prices === 'string' ? custom_prices : JSON.stringify(custom_prices);
        }
        const updatedPlace = yield db_1.default.place.update({
            where: { id: Number(id) },
            data
        });
        // Actualizar Traducciones
        if (description_es !== undefined) {
            yield db_1.default.placeTranslation.upsert({
                where: { place_id_language_code: { place_id: Number(id), language_code: 'es' } },
                update: { description: description_es },
                create: { place_id: Number(id), language_code: 'es', description: description_es }
            });
        }
        if (description_en !== undefined) {
            yield db_1.default.placeTranslation.upsert({
                where: { place_id_language_code: { place_id: Number(id), language_code: 'en' } },
                update: { description: description_en },
                create: { place_id: Number(id), language_code: 'en', description: description_en }
            });
        }
        // Actualizar Amenidades (Sincronización)
        if (amenity_ids && Array.isArray(amenity_ids)) {
            yield db_1.default.placeAmenity.deleteMany({ where: { place_id: Number(id) } });
            const amenitiesData = amenity_ids.map((aId) => ({
                place_id: Number(id),
                amenity_id: Number(aId)
            }));
            yield db_1.default.placeAmenity.createMany({ data: amenitiesData });
        }
        // Actualizar Imágenes (Sincronización)
        if (images && Array.isArray(images)) {
            yield db_1.default.placeImage.deleteMany({ where: { place_id: Number(id) } });
            const imagesData = images.map((img, idx) => ({
                place_id: Number(id),
                image_url: img,
                sort_order: idx
            }));
            yield db_1.default.placeImage.createMany({ data: imagesData });
        }
        res.json({ message: 'Negocio actualizado', place: updatedPlace });
    }
    catch (error) {
        console.error('Error al actualizar lugar:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}));
// ── Actualizar estado formal (SuperAdmin) ──────────────────────────  
router.patch('/:id/status', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status, is_active } = req.body;
        const updatedPlace = yield db_1.default.place.update({
            where: { id: Number(id) },
            data: Object.assign(Object.assign({}, (status !== undefined && { status })), (is_active !== undefined && { is_active }))
        });
        res.json({ message: 'Estado del lugar actualizado', place: updatedPlace });
    }
    catch (error) {
        console.error('Error al actualizar estado:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}));
// ── Eliminar un lugar ─────────────────────────────────────────────────────
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield db_1.default.place.delete({ where: { id: Number(id) } });
        res.json({ message: 'Lugar eliminado con éxito' });
    }
    catch (error) {
        console.error('Error al eliminar lugar:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}));
exports.default = router;
