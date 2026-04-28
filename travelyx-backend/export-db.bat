@echo off
set PGPASSWORD=1234578a

echo Exportando base de datos completa de Travelyx...
"C:\Program Files\PostgreSQL\18\bin\pg_dump.exe" -U postgres -h localhost -p 5432 -d travelyx_db --inserts --clean --if-exists -f travelyx_db_dump.sql

if %ERRORLEVEL% EQU 0 (
    echo Base de datos exportada exitosamente a travelyx_db_dump.sql
    echo Comprimiendo el archivo para que sea mas facil compartirlo...
    powershell -Command "Compress-Archive -Path travelyx_db_dump.sql -DestinationPath travelyx_db_backup.zip -Force"
    echo Proceso completado. El archivo travelyx_db_backup.zip contiene todos tus datos.
) else (
    echo Hubo un error al exportar la base de datos.
)
pause
