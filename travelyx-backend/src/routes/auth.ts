import 'dotenv/config';
import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from '../db';
import { body, validationResult } from 'express-validator';
import logger from '../utils/logger';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secreto_super_seguro_travelyx_123';

// TEMPORARY SEED ENDPOINT - REMOVE AFTER USE
router.get('/seed-admin', async (req, res) => {
  try {
    const passwordHash = await bcrypt.hash('superadmin123', 10);
    await prisma.user.upsert({
      where: { email: 'admin@travelyx.com' },
      update: { must_change_password: false, role: 'SUPERADMIN' },
      create: {
        email: 'admin@travelyx.com',
        password_hash: passwordHash,
        role: 'SUPERADMIN',
        must_change_password: false
      }
    });
    res.send('✅ Admin upserted successfully');
  } catch (error) {
    res.status(500).send('❌ Error: ' + error);
  }
});

router.post('/login', [
  body('email').isEmail().withMessage('Debe ser un correo válido').normalizeEmail(),
  body('password').notEmpty().withMessage('La contraseña es obligatoria').trim()
], async (req: Request, res: Response): Promise<any> => {
  // Prevenir caché de la respuesta de login
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn(`Intento de login con formato inválido desde IP: ${req.ip}`);
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Buscar el usuario en la base de datos
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      logger.warn(`Fallo de autenticación: Usuario no encontrado (${email}) desde IP: ${req.ip}`);
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Comprobar si la cuenta está bloqueada
    if (user.locked_until && user.locked_until > new Date()) {
      logger.warn(`Fallo de autenticación: Cuenta bloqueada (${email}) intentó acceder desde IP: ${req.ip}`);
      return res.status(403).json({ 
        error: 'Cuenta bloqueada por múltiples intentos fallidos', 
        code: 'ACCOUNT_LOCKED',
        locked_until: user.locked_until 
      });
    }

    // Validar la contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      // Incrementar intentos fallidos
      const newAttempts = user.failed_attempts + 1;
      let updateData: any = { failed_attempts: newAttempts };
      
      if (newAttempts >= 3) {
        // Bloquear por 30 minutos
        const lockoutDate = new Date();
        lockoutDate.setMinutes(lockoutDate.getMinutes() + 30);
        updateData.locked_until = lockoutDate;
      }
      
      await prisma.user.update({
        where: { id: user.id },
        data: updateData
      });

      if (newAttempts >= 3) {
        logger.warn(`Seguridad: Cuenta bloqueada temporalmente por fuerza bruta (${email})`);
        return res.status(403).json({ 
          error: 'Cuenta bloqueada por 30 minutos. Intente más tarde.', 
          code: 'ACCOUNT_LOCKED',
          locked_until: updateData.locked_until 
        });
      }

      logger.warn(`Fallo de autenticación: Contraseña incorrecta (${email}) desde IP: ${req.ip}. Intentos: ${newAttempts}`);
      return res.status(401).json({ error: `Credenciales inválidas. Te quedan ${3 - newAttempts} intentos.` });
    }

    // Contraseña correcta: Resetear intentos y bloqueos
    if (user.failed_attempts > 0 || user.locked_until) {
      await prisma.user.update({
        where: { id: user.id },
        data: { failed_attempts: 0, locked_until: null }
      });
    }

    // Generar Token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    logger.info(`Login exitoso: Usuario ${user.email} autenticado desde IP: ${req.ip}`);

    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        must_change_password: user.must_change_password
      }
    });

  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ==========================================
// RUTA DE PRUEBAS: Quitar bloqueo temporal
// ==========================================
router.post('/reset-lockout', async (req: Request, res: Response): Promise<any> => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Proporcione un email para desbloquear' });
  }

  try {
    await prisma.user.updateMany({
      where: { email },
      data: {
        failed_attempts: 0,
        locked_until: null
      }
    });
    res.json({ message: 'Bloqueo eliminado exitosamente (Modo Pruebas)' });
  } catch (error) {
    res.status(500).json({ error: 'Error al intentar quitar el bloqueo' });
  }
});

// Cambiar contraseña (Requiere saber la anterior)
router.post('/change-password', [
  body('email').isEmail().normalizeEmail(),
  body('oldPassword').notEmpty(),
  body('newPassword').isLength({ min: 8 }).withMessage('La nueva contraseña debe tener al menos 8 caracteres')
], async (req: Request, res: Response): Promise<any> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, oldPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !(await bcrypt.compare(oldPassword, user.password_hash))) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email },
      data: {
        password_hash: hashedNewPassword,
        must_change_password: false
      }
    });

    res.json({ message: 'Contraseña actualizada con éxito' });

  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;

