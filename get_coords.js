const https = require('https');
const options = { headers: { 'User-Agent': 'TravelyxAgent/1.0' } };

const places = [
  'Museo del Meteorito Progreso',
  'Parque de la Paz Progreso',
  'Calle 80 Progreso Yucatan',
  'Calle 60 Progreso Yucatan',
  'Parque Independencia Progreso',
  'Estatua Juan Miguel Castro Progreso'
];

places.forEach(p => {
  https.get('https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(p), options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        if (json.length > 0) {
          console.log(p + ' -> Lat: ' + json[0].lat + ', Lng: ' + json[0].lon);
        } else {
          console.log(p + ' -> NOT FOUND');
        }
      } catch (e) {
         console.log(p + ' -> ERROR parsing json');
      }
    });
  });
});
