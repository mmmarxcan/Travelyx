import { Router } from 'express';
import prisma from '../db';
import { TranslationService } from '../services/translation';

const router = Router();

// ── Listar todos los lugares (SuperAdmin / Kiosko) ──────────────────────────
router.get('/', async (req, res) => {
  try {
    const places = await prisma.place.findMany({
      include: {
        category: true,
        translations: true,
        owner: { select: { id: true, email: true, full_name: true } },
        _count: { select: { images: true } }
      },
      orderBy: { id: 'desc' }
    });
    console.log(`📋 GET /api/places - Enviando ${places.length} lugares.`);
    
    // 🔥 DISPARAR TRADUCCIÓN EN SEGUNDO PLANO PARA LOS QUE FALTE
    TranslationService.processMissingTranslations(places);

    // FORZAR ANTI-CACHÉ TOTAL
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.removeHeader('ETag');
    
    res.json(places);
  } catch (error) {
    console.error('❌ Error al listar lugares:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ── Listar negocios de un propietario específico ──────────────────────────
router.get('/mine', async (req, res) => {
  try {
    const { owner_id } = req.query;
    if (!owner_id) return res.status(400).json({ error: 'owner_id es requerido' });

    const places = await prisma.place.findMany({
      where: { owner_id: Number(owner_id) },
      include: {
        category: true,
        _count: { select: { images: true } }
      },
      orderBy: { id: 'desc' }
    });
    
    // Anticaché para el Propietario
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.removeHeader('ETag');

    res.json(places);
  } catch (error) {
    console.error('Error al listar mis lugares:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ── Listar servicios filtrados por categoría (Amenities) ──────────────────
router.get('/amenities', async (req, res) => {
  try {
    const { category_id } = req.query;

    let where: any = {};
    if (category_id) {
      where = {
        categories: {
          some: {
            category_id: Number(category_id)
          }
        }
      };
    }

    const amenities = await prisma.amenity.findMany({
      where,
      orderBy: { name_es: 'asc' }
    });
    res.json(amenities);
  } catch (error) {
    console.error('Error al listar servicios:', error);
    res.status(500).json({ error: 'Error al listar servicios' });
  }
});

// ── Crear un nuevo negocio ────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const {
      owner_id,
      category_id,
      name,
      lat,
      lng,
      phone,
      whatsapp,
      website_url,
      social_url,
      description_es,
      description_en,
      amenity_ids,
      address,
      // Campos detallados (Hotel/Atracción/Restaurante)
      stars,
      accommodation_type,
      house_rules,
      cancellation_policy,
      slogan,
      opening_hours,
      best_time,
      price_adult,
      price_child,
      price_local,
      estimated_duration,
      // Campos Restaurante
      price_range,
      featured_dish,
      menu_url,
      capacity,
      stay_time,
      delivery,
      pickup,
      requires_reservation,
      cuisine
    } = req.body;

    if (!owner_id || !category_id || !name || lat === undefined || lng === undefined) {
      return res.status(400).json({ error: 'Faltan campos obligatorios: owner_id, category_id, name, lat, lng' });
    }

    const newPlace = await prisma.place.create({
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
        cuisine: cuisine || null
      }
    });

    // Agregar traducciones si vienen
    if (description_es) {
      await prisma.placeTranslation.create({
        data: { place_id: newPlace.id, language_code: 'es', description: description_es }
      });
    }
    if (description_en) {
      await prisma.placeTranslation.create({
        data: { place_id: newPlace.id, language_code: 'en', description: description_en }
      });
    }

    // Asociar servicios si vienen
    if (amenity_ids && Array.isArray(amenity_ids)) {
      const amenitiesData = amenity_ids.map((id: number) => ({
        place_id: newPlace.id,
        amenity_id: Number(id)
      }));
      await prisma.placeAmenity.createMany({
        data: amenitiesData
      });
    }

    res.status(201).json({ message: 'Negocio registrado. Pendiente de aprobación.', place: newPlace });
  } catch (error) {
    console.error('Error al crear lugar:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ── Actualizar un lugar ───────────────────────────────────────────────────
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, lat, lng, phone, whatsapp, website_url, social_url, address, description, 
      is_active, status, stars, accommodation_type, house_rules, cancellation_policy,
      slogan, opening_hours, best_time, price_adult, price_child, price_local,
      estimated_duration, price_range, featured_dish, menu_url, capacity, stay_time,
      delivery, pickup, requires_reservation, cuisine
    } = req.body;

    const data: any = {};
    if (name !== undefined) data.name = name;
    if (lat !== undefined) data.lat = parseFloat(lat);
    if (lng !== undefined) data.lng = parseFloat(lng);
    if (phone !== undefined) data.phone = phone;
    if (whatsapp !== undefined) data.whatsapp = whatsapp;
    if (website_url !== undefined) data.website_url = website_url;
    if (social_url !== undefined) data.social_url = social_url;
    if (address !== undefined) data.address = address;
    if (description !== undefined) data.description = description;
    if (is_active !== undefined) data.is_active = is_active;
    if (status !== undefined) data.status = status;
    
    // Campos numéricos y otros
    if (stars !== undefined) data.stars = Number(stars);
    if (accommodation_type !== undefined) data.accommodation_type = accommodation_type;
    if (house_rules !== undefined) data.house_rules = house_rules;
    if (cancellation_policy !== undefined) data.cancellation_policy = cancellation_policy;
    if (slogan !== undefined) data.slogan = slogan;
    if (opening_hours !== undefined) data.opening_hours = opening_hours;
    if (best_time !== undefined) data.best_time = best_time;
    if (price_adult !== undefined) data.price_adult = parseFloat(price_adult);
    if (price_child !== undefined) data.price_child = parseFloat(price_child);
    if (price_local !== undefined) data.price_local = parseFloat(price_local);
    if (estimated_duration !== undefined) data.estimated_duration = estimated_duration;
    if (price_range !== undefined) data.price_range = Number(price_range);
    if (featured_dish !== undefined) data.featured_dish = featured_dish;
    if (menu_url !== undefined) data.menu_url = menu_url;
    if (capacity !== undefined) data.capacity = Number(capacity);
    if (stay_time !== undefined) data.stay_time = stay_time;
    if (delivery !== undefined) data.delivery = delivery;
    if (pickup !== undefined) data.pickup = pickup;
    if (requires_reservation !== undefined) data.requires_reservation = requires_reservation;
    if (cuisine !== undefined) data.cuisine = cuisine;

    const updatedPlace = await prisma.place.update({
      where: { id: Number(id) },
      data
    });

    res.json({ message: 'Negocio actualizado', place: updatedPlace });
  } catch (error) {
    console.error('Error al actualizar lugar:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ── Actualizar estado formal (SuperAdmin) ──────────────────────────  
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, is_active } = req.body;

    const updatedPlace = await prisma.place.update({
      where: { id: Number(id) },
      data: { 
        ...(status !== undefined && { status }),
        ...(is_active !== undefined && { is_active })
      }
    });

    res.json({ message: 'Estado del lugar actualizado', place: updatedPlace });
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ── Eliminar un lugar ─────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.place.delete({ where: { id: Number(id) } });
    res.json({ message: 'Lugar eliminado con éxito' });
  } catch (error) {
    console.error('Error al eliminar lugar:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
