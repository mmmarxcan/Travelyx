@echo off
set PGPASSWORD=1234578a

echo Preparando importacion de la base de datos...

if not exist "travelyx_db_dump.sql" (
    if exist "travelyx_db_backup.zip" (
        echo Extrayendo travelyx_db_backup.zip...
        powershell -Command "Expand-Archive -Path travelyx_db_backup.zip -DestinationPath . -Force"
    ) else (
        echo ERROR: No se encontro el archivo travelyx_db_dump.sql ni travelyx_db_backup.zip.
        echo Asegurate de haber copiado estos archivos al mismo equipo antes de importar.
        pause
        exit /b 1
    )
)

echo.
echo ADVERTENCIA: Esta accion sobreescribira los datos actuales en tu base de datos de Postgres local.
echo Si estas seguro de continuar, presiona cualquier tecla. De lo contrario, cierra esta ventana.
pause

echo Importando datos...
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h localhost -p 5432 -d travelyx_db -f travelyx_db_dump.sql

if %ERRORLEVEL% EQU 0 (
    echo Base de datos importada exitosamente. El repositorio ahora tiene todos los datos originales.
) else (
    echo Hubo un error al importar la base de datos.
)
pause
