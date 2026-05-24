"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = __importDefault(require("../db"));
const crypto_1 = __importDefault(require("crypto"));
const router = (0, express_1.Router)();
// Listar todos los dueños (OWNER)
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const owners = yield db_1.default.user.findMany({
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
    }
    catch (error) {
        console.error('Error al listar usuarios:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}));
// Crear un nuevo dueño (OWNER)
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, full_name, phone } = req.body;
        console.log('POST /api/users - Creating user:', { email, full_name });
        if (!email) {
            return res.status(400).json({ error: 'El email es obligatorio' });
        }
        // Verificar si ya existe
        const existingUser = yield db_1.default.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            return res.status(400).json({ error: 'El usuario ya existe' });
        }
        // Generar contraseña aleatoria temporal
        const tempPassword = crypto_1.default.randomBytes(8).toString('hex'); // Ej: 4a2b9c..
        console.log('Hashing password...');
        const hashedPassword = yield bcryptjs_1.default.hash(tempPassword, 10);
        console.log('Password hashed successfully.');
        // Crear en la DB
        console.log('Step: Saving to DB');
        const newUser = yield db_1.default.user.create({
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
    }
    catch (error) {
        console.error('CRITICAL ERROR in POST /api/users:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Error interno total' });
        }
    }
}));
// Cambiar estado (Activo/Inactivo)
router.patch('/:id/status', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { is_active } = req.body;
        console.log(`[BACKEND] Updating status for user ID: ${id} to is_active: ${is_active}`);
        const updatedUser = yield db_1.default.user.update({
            where: { id: Number(id) },
            data: { is_active }
        });
        res.json({ message: 'Estado actualizado', is_active: updatedUser.is_active });
    }
    catch (error) {
        console.error('Error al cambiar estado:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}));
exports.default = router;
