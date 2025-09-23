"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
const routes_1 = __importDefault(require("./routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Surf Report API is running',
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        features: [
            'TypeORM with PostgreSQL + PostGIS',
            'Open Meteo Weather Service',
            'AI Strategy Pattern (Gemini)',
            'Advanced Repository Pattern'
        ]
    });
});
// API routes
app.use('/api', routes_1.default);
// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(err.status || 500).json({
        success: false,
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
        timestamp: new Date().toISOString()
    });
});
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString()
    });
});
// Función para inicializar la aplicación
async function startServer() {
    try {
        console.log('🚀 Starting Surf Report API...');
        // Inicializar base de datos
        console.log('📊 Initializing database connection...');
        await (0, database_1.initializeDatabase)();
        // Iniciar servidor
        app.listen(PORT, () => {
            console.log('');
            console.log('🏄‍♂️ ============================================');
            console.log('🏄‍♂️ Surf Report API v2.0 is running!');
            console.log('🏄‍♂️ ============================================');
            console.log(`📍 Server: http://localhost:${PORT}`);
            console.log(`🔍 Health: http://localhost:${PORT}/health`);
            console.log(`📊 API: http://localhost:${PORT}/api`);
            console.log('');
            console.log('🔧 Features:');
            console.log('   • TypeORM with PostgreSQL + PostGIS');
            console.log('   • Open Meteo Weather API Integration');
            console.log('   • AI Report Generation (Gemini)');
            console.log('   • Advanced Repository Pattern');
            console.log('   • Geospatial Spot Management');
            console.log('');
            console.log('📚 API Endpoints:');
            console.log('   • POST /api/reports/generate - Generate surf report');
            console.log('   • GET  /api/reports/recent - Recent reports');
            console.log('   • GET  /api/spots - List all spots');
            console.log('   • GET  /api/zones - List all zones');
            console.log('   • GET  /api/reports/test/services - Test all services');
            console.log('');
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        console.error('');
        console.error('🔧 Common solutions:');
        console.error('   • Check database connection in .env');
        console.error('   • Ensure PostgreSQL with PostGIS is running');
        console.error('   • Verify GEMINI_API_KEY is set');
        console.error('   • Run: npm run db:init');
        console.error('');
        process.exit(1);
    }
}
// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully...');
    process.exit(0);
});
process.on('SIGINT', () => {
    console.log('🛑 SIGINT received, shutting down gracefully...');
    process.exit(0);
});
// Manejo de promesas no capturadas
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});
// Inicializar servidor
if (require.main === module) {
    startServer();
}
exports.default = app;
//# sourceMappingURL=index.js.map