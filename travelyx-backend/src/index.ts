import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { globalSanitizer } from './middlewares/sanitize.middleware';
import path from 'path';

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
// Aplicar cabeceras de seguridad estrictas, pero permitiendo cross-origin para la API
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
// Configurar CORS para restringir dominios (ahora abierto localmente)
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(globalSanitizer);
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Header to bypass localhost.run tunnel warning page
app.use((req, res, next) => {
  res.setHeader('bypass-tunnel-reminder', 'true');
  next();
});

import authRoutes from './routes/auth';
import usersRoutes from './routes/users';
import placesRoutes from './routes/places';
import logsRoutes from './routes/logs';
import uploadsRoutes from './routes/uploads';
import path from 'path';

// Basic Route
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to the Travelyx API!' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/places', placesRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/uploads', uploadsRoutes);

// Restricción de acceso a directorios:
// Servir estáticos de subidas SIN PERMITIR EJECUCIÓN (setHeaders elimina mime types peligrosos)
const uploadsPath = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsPath, {
  setHeaders: (res, filePath) => {
    // Evitar que el navegador trate de adivinar el content type y ejecute un script disfrazado
    res.setHeader('X-Content-Type-Options', 'nosniff');
  }
}));

// Serve Angular production build
const frontendPath = path.join(process.cwd(), 'www');
app.use(express.static(frontendPath));

// Fallback to index.html for Angular client-side routing
app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/uploads')) {
    return next();
  }
  res.sendFile(path.join(frontendPath, 'index.html'));
});



// Start Server - Listen on all interfaces for local network access
app.listen(Number(port), '0.0.0.0', () => {
  console.log(`🚀 Travelyx API running at http://0.0.0.0:${port}`);
  console.log(`📡 Local network: http://192.168.137.1:${port}`);
});
