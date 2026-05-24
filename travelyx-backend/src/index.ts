import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Header to bypass localhost.run tunnel warning page
app.use((req, res, next) => {
  res.setHeader('bypass-tunnel-reminder', 'true');
  next();
});

import authRoutes from './routes/auth';
import usersRoutes from './routes/users';
import placesRoutes from './routes/places';
import path from 'path';

// Basic Route
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to the Travelyx API!' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/places', placesRoutes);

// Serve Angular production build
const frontendPath = path.join(process.cwd(), 'www');
app.use(express.static(frontendPath));

// Fallback to index.html for Angular client-side routing
app.use((req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});



// Start Server - Listen on all interfaces for local network access
app.listen(Number(port), '0.0.0.0', () => {
  console.log(`🚀 Travelyx API running at http://0.0.0.0:${port}`);
  console.log(`📡 Local network: http://192.168.137.1:${port}`);
});
