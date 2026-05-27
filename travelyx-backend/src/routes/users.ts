import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../db';
import crypto from 'crypto';
import { body, validationResult } from 'express-validator';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware';
import logger from '../utils/logger';

const router = Router();

// Listar todos los dueños (Solo SUPERADMIN)
router.get('/', authenticateToken, requireRole('SUPERADMIN'), async (req, res) => {
  try {
    logger.info(`Acceso a lista de usuarios por Admin: ${(req as any).user.email}`);
    const owners = await prisma.user.findMany({
      where: { role: 'OWNER' },
      select: {
        id: true,
        email: true,
        full_name: true,
        phone: true,
        is_active: true,
        role: true,
        must_change_password: true,
        created_at: true,
        _count: {
          select: { places: true }
        }
      }
    });
    console.log(`GET /api/users - Found ${owners.length} owners.`);
    res.json(owners);
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear un nuevo dueño (Solo SUPERADMIN)
router.post('/', authenticateToken, requireRole('SUPERADMIN'), [
  body('email').isEmail().normalizeEmail(),
  body('full_name').notEmpty().trim().escape(),
  body('phone').optional().trim().escape()
], async (req: Request, res: Response): Promise<any> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, full_name, phone } = req.body;
    logger.info(`Admin ${(req as any).user.email} está intentando crear el usuario: ${email}`);

    // Verificar si ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    // Generar contraseña aleatoria temporal
    const tempPassword = crypto.randomBytes(8).toString('hex'); // Ej: 4a2b9c..
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    console.log('Password hashed successfully.');

    // Crear en la DB
    console.log('Step: Saving to DB');
    const newUser = await prisma.user.create({
      data: {
        email,
        full_name,
        phone,
        password_hash: hashedPassword,
        role: 'OWNER',
        is_active: true,
        must_change_password: true
      }
    });
    console.log('Step: User Saved. ID:', newUser.id);

    // Enviar respuesta inmediatamente
    const responseData = {
      message: 'OK',
      user: {
        id: Number(newUser.id),
        email: newUser.email,
        tempPassword
      }
    };
    
    console.log('Step: Sending response json...');
    return res.status(201).json(responseData);

  } catch (error) {
    console.error('CRITICAL ERROR in POST /api/users:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Error interno total' });
    }
  }
});

// Cambiar estado (Activo/Inactivo) - Solo SUPERADMIN
router.patch('/:id/status', authenticateToken, requireRole('SUPERADMIN'), [
  body('is_active').isBoolean()
], async (req: Request, res: Response): Promise<any> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { is_active } = req.body;
    logger.info(`Admin ${(req as any).user.email} cambió el estado del usuario ID ${id} a ${is_active}`);

    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: { is_active }
    });

    res.json({ message: 'Estado actualizado', is_active: updatedUser.is_active });
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
