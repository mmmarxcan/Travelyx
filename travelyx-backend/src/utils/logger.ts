import winston from 'winston';
import fs from 'fs';
import path from 'path';

// Asegurar que el directorio de logs exista
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json()
  ),
  transports: [
    // Registro exclusivo para eventos de seguridad
    new winston.transports.File({ 
      filename: path.join(logDir, 'security.log'), 
      level: 'info' 
    }),
    // Consola para debug durante el desarrollo
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

export default logger;
