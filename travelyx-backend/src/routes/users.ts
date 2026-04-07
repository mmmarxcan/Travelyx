import { Router } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../db';
import crypto from 'crypto';

const router = Router();

// Listar todos los dueños (OWNER)
router.get('/', async (req, res) => {
  try {
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

// Crear un nuevo dueño (OWNER)
router.post('/', async (req, res) => {
  try {
    const { email, full_name, phone } = req.body;
    console.log('POST /api/users - Creating user:', { email, full_name });

    if (!email) {
      return res.status(400).json({ error: 'El email es obligatorio' });
    }

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

// Cambiar estado (Activo/Inactivo)
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    console.log(`[BACKEND] Updating status for user ID: ${id} to is_active: ${is_active}`);

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
