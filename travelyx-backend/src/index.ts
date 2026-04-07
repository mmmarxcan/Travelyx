import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

import authRoutes from './routes/auth';
import usersRoutes from './routes/users';
import placesRoutes from './routes/places';

// Basic Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Travelyx API!' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/places', placesRoutes);



// Start Server
app.listen(port, () => {
  console.log(`🚀 Travelyx API running at http://localhost:${port}`);
});
