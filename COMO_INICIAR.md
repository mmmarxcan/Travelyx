# Guía de Inicio - Proyecto Travelyx

Este documento explica cómo iniciar los tres componentes principales del sistema Travelyx: el **Servidor (Backend)**, el **Panel de Administración** y el **Kiosko Digital**.

## 🚀 Pasos para Iniciar el Sistema

Es importante seguir este orden para asegurar que el sistema funcione correctamente.

### 1. Iniciar el Servidor (Backend)
El backend es el corazón del sistema y debe estar encendido para que las aplicaciones puedan mostrar datos.

1. Abre una terminal.
2. Navega a la carpeta: `c:\Users\mmmarxcan\Desktop\Travelyx\travelyx-backend`
3. Ejecuta el comando:
   ```bash
   npm run dev
   ```
4. Verás el mensaje: `🚀 Travelyx API running at http://localhost:3000`

---

### 2. Iniciar el Panel de Administración (Admin Portal)
Aquí es donde registras a los propietarios y gestionas los lugares.

1. Abre una nueva terminal.
2. Navega a la carpeta: `c:\Users\mmmarxcan\Desktop\Travelyx\travelyx-admin`
3. Ejecuta el comando:
   ```bash
   npm start
   ```
4. La aplicación estará disponible en: `http://localhost:4300`

---

### 3. Iniciar el Kiosko Digital (Kiosk App)
Esta es la aplicación que verán los turistas.

1. Abre una nueva terminal.
2. Navega a la carpeta: `c:\Users\mmmarxcan\Desktop\Travelyx\proyecto-travelyx`
3. Ejecuta el comando:
   ```bash
   npm start
   ```
   *(También puedes usar `ionic serve` si tienes Ionic CLI instalado)*.
4. La aplicación estará disponible usualmente en: `http://localhost:8100`

---

## 🛠️ Notas de Mantenimiento

- **Base de Datos:** El sistema usa PostgreSQL. Asegúrate de que el servicio de PostgreSQL esté corriendo en tu computadora.
- **Variables de Entorno:** Si necesitas cambiar la conexión a la base de datos, edita el archivo `.env` en la carpeta `travelyx-backend`.
- **Errores de Conexión:** Si las aplicaciones muestran "Error desconocido", verifica que la terminal del **Backend** no se haya cerrado o mostrado algún error de base de datos.

---

*Documento generado automáticamente por Antigravity AI - 2026*
