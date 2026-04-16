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

## 💾 Migración de la Base de Datos

Si necesitas mover el sistema a otra computadora y conservar los datos, hemos generado un archivo de respaldo.

### Para Importar (en la computadora nueva):
1. Asegúrate de tener instalado PostgreSQL en la nueva computadora.
2. Asegúrate de que la nueva contraseña de PostgreSQL coincida con el backend, o actualiza el archivo `.env` en `travelyx-backend`.
3. Crea una base de datos vacía llamada `travelyx_db` en la nueva computadora. Si usas la terminal de Windows con rutas estándar:
   ```bash
   "C:\Program Files\PostgreSQL\18\bin\createdb.exe" -U postgres travelyx_db
   ```
4. Importa los datos usando el archivo `travelyx_db_dump.sql` (asegúrate de copiar la carpeta Travelyx completa con este archivo a la nueva PC, abre la terminal donde está el archivo y ejecuta):
   ```bash
   "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d travelyx_db -f travelyx_db_dump.sql
   ```
*(Te pedirá tu contraseña de PostgreSQL durante estos procesos).*

---

## 🛠️ Notas de Mantenimiento

- **Base de Datos:** El sistema usa PostgreSQL. Asegúrate de que el servicio de PostgreSQL esté corriendo en tu computadora.
- **Variables de Entorno:** Si necesitas cambiar la conexión a la base de datos, edita el archivo `.env` en la carpeta `travelyx-backend`.
- **Errores de Conexión:** Si las aplicaciones muestran "Error desconocido", verifica que la terminal del **Backend** no se haya cerrado o mostrado algún error de base de datos.

---

*Documento generado automáticamente por Antigravity AI - 2026*
