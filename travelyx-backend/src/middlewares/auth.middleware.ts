import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'secreto_super_seguro_travelyx_123';

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
    role: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato: Bearer TOKEN

  if (!token) {
    logger.warn(`Intento de acceso sin token a la ruta: ${req.originalUrl} desde IP: ${req.ip}`);
    return res.status(401).json({ error: 'Token de acceso no proporcionado' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      logger.warn(`Intento de acceso con token inválido/expirado a la ruta: ${req.originalUrl} desde IP: ${req.ip}`);
      return res.status(403).json({ error: 'Token inválido o expirado' });
    }
    
    req.user = user as AuthRequest['user'];
    next();
  });
};

export const requireRole = (requiredRole: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    if (req.user.role !== requiredRole) {
      logger.warn(`Acceso denegado. Usuario ${req.user.email} intentó acceder a ruta requerida para ${requiredRole}`);
      return res.status(403).json({ error: 'No tienes permisos para realizar esta acción' });
    }

    next();
  };
};
