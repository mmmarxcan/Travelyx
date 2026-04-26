const fs = require('fs');
const path = require('path');

const KIOSK_LNG = -89.6580;
const KIOSK_LAT = 21.2882;

async function generateRoutes() {
  console.log('Obteniendo lugares del backend local...');
  try {
    const res = await fetch('http://localhost:3000/api/places');
    const places = await res.json();
    console.log(`Se encontraron ${places.length} lugares.`);

    const routesMap = {};

    for (let i = 0; i < places.length; i++) {
      const place = places[i];
      console.log(`Calculando ruta para: ${place.name} (${i + 1}/${places.length})`);
      
      const url = `http://router.project-osrm.org/route/v1/driving/${KIOSK_LNG},${KIOSK_LAT};${place.lng},${place.lat}?overview=full&geometries=geojson`;
      
      try {
        const routeRes = await fetch(url);
        const routeData = await routeRes.json();
        
        if (routeData.code === 'Ok' && routeData.routes && routeData.routes.length > 0) {
          // OSRM devuelve [lng, lat], guardamos exactamente lo que nos da
          routesMap[place.id] = routeData.routes[0].geometry.coordinates;
        } else {
          console.warn(`No se pudo obtener ruta para ${place.name}`);
        }
      } catch (err) {
        console.error(`Error en API OSRM para ${place.name}:`, err.message);
      }
      
      // Pequeña pausa para no saturar la API de OSRM
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const outputPath = path.join(__dirname, '../proyecto-travelyx/src/assets/routes.json');
    fs.writeFileSync(outputPath, JSON.stringify(routesMap, null, 2));
    console.log(`¡Éxito! Rutas guardadas en: ${outputPath}`);

  } catch (error) {
    console.error('Error general:', error);
  }
}

generateRoutes();
