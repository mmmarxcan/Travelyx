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
require("dotenv/config");
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = __importDefault(require("../db"));
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || 'secreto_super_seguro_travelyx_123';
// TEMPORARY SEED ENDPOINT - REMOVE AFTER USE
router.get('/seed-admin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const passwordHash = yield bcryptjs_1.default.hash('superadmin123', 10);
        yield db_1.default.user.upsert({
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
    }
    catch (error) {
        res.status(500).send('❌ Error: ' + error);
    }
}));
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const user = yield db_1.default.user.findUnique({
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
        const isPasswordValid = yield bcryptjs_1.default.compare(password, user.password_hash);
        if (!isPasswordValid) {
            // Incrementar intentos fallidos
            const newAttempts = user.failed_attempts + 1;
            let updateData = { failed_attempts: newAttempts };
            if (newAttempts >= 3) {
                // Bloquear por 30 minutos
                const lockoutDate = new Date();
                lockoutDate.setMinutes(lockoutDate.getMinutes() + 30);
                updateData.locked_until = lockoutDate;
            }
            yield db_1.default.user.update({
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
            yield db_1.default.user.update({
                where: { id: user.id },
                data: { failed_attempts: 0, locked_until: null }
            });
        }
        // Generar Token JWT
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
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
    }
    catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}));
router.post('/change-password', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, oldPassword, newPassword } = req.body;
        if (!email || !oldPassword || !newPassword) {
            return res.status(400).json({ error: 'Faltan datos' });
        }
        const user = yield db_1.default.user.findUnique({
            where: { email }
        });
        if (!user || !(yield bcryptjs_1.default.compare(oldPassword, user.password_hash))) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        const hashedNewPassword = yield bcryptjs_1.default.hash(newPassword, 10);
        yield db_1.default.user.update({
            where: { email },
            data: {
                password_hash: hashedNewPassword,
                must_change_password: false
            }
        });
        res.json({ message: 'Contraseña actualizada con éxito' });
    }
    catch (error) {
        console.error('Error al cambiar contraseña:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}));
exports.default = router;
