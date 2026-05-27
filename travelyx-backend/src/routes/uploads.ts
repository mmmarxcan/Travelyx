import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware';
import { uploadMiddleware } from '../middlewares/upload.middleware';
import logger from '../utils/logger';

const router = Router();

// Endpoint de subida segura, requiere autenticación
router.post('/image', authenticateToken, uploadMiddleware.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se envió ninguna imagen válida' });
    }

    logger.info(`Archivo seguro subido por ${(req as any).user.email}: ${req.file.filename}`);

    // Retornamos la URL relativa para poder ser consumida por el frontend
    res.json({
      message: 'Imagen subida exitosamente',
      url: `/uploads/images/${req.file.filename}`
    });
  } catch (error) {
    logger.error(`Error en subida de archivo por ${(req as any).user?.email}:`, error);
    res.status(500).json({ error: 'Error al procesar el archivo' });
  }
});

export default router;
