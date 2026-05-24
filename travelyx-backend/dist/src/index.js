"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ limit: '50mb', extended: true }));
// Header to bypass localhost.run tunnel warning page
app.use((req, res, next) => {
    res.setHeader('bypass-tunnel-reminder', 'true');
    next();
});
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const places_1 = __importDefault(require("./routes/places"));
const path_1 = __importDefault(require("path"));
// Basic Route
app.get('/api', (req, res) => {
    res.json({ message: 'Welcome to the Travelyx API!' });
});
// API Routes
app.use('/api/auth', auth_1.default);
app.use('/api/users', users_1.default);
app.use('/api/places', places_1.default);
// Serve Angular production build
const frontendPath = path_1.default.join(process.cwd(), 'www');
app.use(express_1.default.static(frontendPath));
// Fallback to index.html for Angular client-side routing
app.use((req, res) => {
    res.sendFile(path_1.default.join(frontendPath, 'index.html'));
});
// Start Server - Listen on all interfaces for local network access
app.listen(Number(port), '0.0.0.0', () => {
    console.log(`🚀 Travelyx API running at http://0.0.0.0:${port}`);
    console.log(`📡 Local network: http://192.168.137.1:${port}`);
});
