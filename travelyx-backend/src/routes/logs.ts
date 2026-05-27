import { Router } from 'express';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware';
import fs from 'fs';
import path from 'path';

const router = Router();

// Consulta de información protegida (Solo SUPERADMIN)
router.get('/security', authenticateToken, requireRole('SUPERADMIN'), (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  try {
    const logPath = path.join(process.cwd(), 'logs', 'security.log');
    
    if (!fs.existsSync(logPath)) {
      return res.json({ message: 'No hay eventos de seguridad registrados aún.', logs: [] });
    }

    // Leemos el archivo y parseamos cada línea (que es un JSON gracias a Winston)
    const logContent = fs.readFileSync(logPath, 'utf-8');
    const logs = logContent.split('\n')
      .filter(line => line.trim() !== '')
      .map(line => JSON.parse(line))
      .reverse(); // Mostrar los más recientes primero

    res.json({ logs });
  } catch (error) {
    console.error('Error leyendo logs de seguridad:', error);
    res.status(500).json({ error: 'Error al leer los logs de seguridad' });
  }
});

export default router;
