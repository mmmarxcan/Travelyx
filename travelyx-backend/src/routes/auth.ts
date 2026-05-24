import 'dotenv/config';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from '../db';

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

router.post('/login', async (req, res) => {
  // Prevenir caché de la respuesta de login
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Faltan credenciales' });
    }

    // Sanitización básica: Trim y limpieza
    email = email.trim().toLowerCase();
    password = password.trim();

    // Buscar el usuario en la base de datos
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Comprobar si la cuenta está bloqueada
    if (user.locked_until && user.locked_until > new Date()) {
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
        return res.status(403).json({ 
          error: 'Cuenta bloqueada por 30 minutos. Intente más tarde.', 
          code: 'ACCOUNT_LOCKED',
          locked_until: updateData.locked_until 
        });
      }

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

router.post('/change-password', async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Faltan datos' });
    }

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

