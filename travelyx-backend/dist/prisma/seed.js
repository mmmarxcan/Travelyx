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
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('🌱 Starting database seeding...');
        try {
            // Check if the admin already exists
            const existingAdmin = yield prisma.user.findUnique({
                where: { email: 'admin@travelyx.com' },
            });
            if (existingAdmin) {
                console.log('⚠️  SuperAdmin user already exists. Skipping...');
                return;
            }
            // Encrypt the default password
            const saltRounds = 10;
            const passwordHash = yield bcryptjs_1.default.hash('superadmin123', saltRounds);
            // Create the superadmin user
            const adminUser = yield prisma.user.create({
                data: {
                    email: 'admin@travelyx.com',
                    password_hash: passwordHash,
                    role: 'SUPERADMIN',
                },
            });
            console.log('✅ Successfully seeded SuperAdmin account:');
            console.log(`   Email: ${adminUser.email}`);
            console.log(`   Role:  ${adminUser.role}`);
        }
        catch (error) {
            console.error('❌ Error during database seeding:', error);
            throw error;
        }
        finally {
            yield prisma.$disconnect();
        }
    });
}
main();
