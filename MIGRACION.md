# Guía de Migración y Respaldo de Travelyx

Este documento explica cómo llevarte el proyecto completo (código + base de datos) a otro equipo, para que puedas continuar trabajando sin perder absolutamente ninguna información, imágenes o lugares configurados.

## 1. ¿Qué se hizo?

Se ha creado un respaldo exacto de la base de datos de producción/desarrollo de Travelyx. Este respaldo incluye todo:
- Usuarios, Dueños de Negocios y Super Admins.
- Lugares (Restaurantes, Hoteles, Puntos de Interés) y sus categorías.
- Detalles, descripciones, y traducciones.
- Menús, precios, y coordenadas GPS de cada lugar.

El respaldo se encuentra comprimido en la carpeta `travelyx-backend` bajo el nombre `travelyx_db_backup.zip`.
*Nota: Este archivo NO se sube a GitHub para evitar sobrepasar los límites de tamaño. Lo debes transferir manualmente (ej. por USB, Google Drive, o transferencia directa).*

Se añadieron también dos scripts para facilitar la administración:
- `export-db.bat`: Para hacer futuros respaldos fácilmente con doble clic.
- `import-db.bat`: Para restaurar la base de datos en un nuevo equipo con un solo clic.

---

## 2. Instrucciones para migrar al nuevo equipo

### Paso 1: Pasar los Archivos
1. Asegúrate de hacer Push a GitHub de todos tus últimos cambios de código (esto ya lo hicimos).
2. Copia el archivo `travelyx_db_backup.zip` que está en la carpeta `travelyx-backend`.
3. Pásalo al nuevo equipo usando un USB, disco externo o súbelo a Google Drive.
4. En el nuevo equipo, clona el repositorio desde GitHub (`git clone <url-del-repo>`).
5. Pega el archivo `travelyx_db_backup.zip` dentro de la carpeta `travelyx-backend` del nuevo equipo.

### Paso 2: Preparar el Entorno en el nuevo equipo
Debes tener instalado lo siguiente en el nuevo equipo:
- **Node.js** (versión 18 o superior).
- **PostgreSQL** (versión 16 o superior). Asegúrate de que la contraseña del usuario `postgres` sea `1234578a` (la que usas actualmente) o en su defecto actualiza los archivos `.env` con la nueva contraseña.
- **Git**.

### Paso 3: Instalar Dependencias
Abre una terminal y ejecuta el comando de instalación en las 3 carpetas (backend, admin y kiosco):

```bash
# En el backend
cd travelyx-backend
npm install

# En el frontend kiosco
cd ../proyecto-travelyx
npm install

# En el panel de administración
cd ../travelyx-admin
npm install
```

### Paso 4: Restaurar la Base de Datos
1. Entra a la carpeta `travelyx-backend`.
2. Dale **doble clic** al archivo `import-db.bat`.
   *Esto automáticamente va a crear/sobrescribir la base de datos `travelyx_db`, va a descomprimir tu archivo `.zip` y restaurará todas las tablas y datos que tenías.*

### Paso 5: Ejecutar los Servidores
Una vez completado lo anterior, puedes iniciar los servidores como siempre.

**Iniciar Backend:**
```bash
cd travelyx-backend
npm run dev
```

**Iniciar Panel de Administración:**
```bash
cd travelyx-admin
npm start
```

**Iniciar Kiosco (Frontend):**
```bash
cd proyecto-travelyx
npm run start
# o
ionic serve
```

¡Con esto ya tendrás el sistema Travelyx corriendo en tu nuevo equipo, exactamente en el mismo estado en el que estaba antes de la migración!
