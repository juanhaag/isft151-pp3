@echo off
REM 🏄 OlasPP Backend - Script de Instalación para Windows
REM Batch Script (compatible con todas las versiones de Windows)

setlocal enabledelayedexpansion

echo.
echo ========================================
echo   🏄 OlasPP Backend Setup
echo ========================================
echo.

REM Verificar Node.js
echo [*] Verificando Node.js...
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [X] Node.js no está instalado
    echo     Descarga Node.js desde: https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node --version') do set NODE_VERSION=%%v
echo [OK] Node.js %NODE_VERSION% encontrado

REM Verificar npm
echo [*] Verificando npm...
where npm >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [X] npm no está instalado
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('npm --version') do set NPM_VERSION=%%v
echo [OK] npm v%NPM_VERSION% encontrado

REM Verificar Docker
echo [*] Verificando Docker...
where docker >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [X] Docker no está instalado
    echo     Descarga Docker Desktop desde: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)
echo [OK] Docker encontrado

REM Verificar Docker Compose
echo [*] Verificando Docker Compose...
where docker-compose >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [X] Docker Compose no está instalado
    pause
    exit /b 1
)
echo [OK] Docker Compose encontrado
echo.

REM Verificar archivo .env
echo [*] Verificando archivo .env...
if not exist ".env" (
    echo [!] Archivo .env no encontrado
    if exist ".env.example" (
        echo [*] Creando .env desde .env.example...
        copy .env.example .env >nul
        echo [OK] Archivo .env creado
        echo.
        echo ========================================
        echo   IMPORTANTE: Configurar .env
        echo ========================================
        echo.
        echo   Debes configurar las siguientes variables en .env:
        echo.
        echo   1. GEMINI_API_KEY=tu_api_key_aqui
        echo      Obten tu API key en: https://makersuite.google.com/app/apikey
        echo.
        echo   2. DB_PASSWORD=tu_password_seguro
        echo.
        echo   Abriendo .env para editar...
        echo.
        start notepad.exe .env
        pause
    ) else (
        echo [X] .env.example no encontrado
        pause
        exit /b 1
    )
) else (
    echo [OK] Archivo .env encontrado
)
echo.

REM Instalar dependencias
echo [*] Instalando dependencias de Node.js...
call npm install
if %ERRORLEVEL% neq 0 (
    echo [X] Error al instalar dependencias
    pause
    exit /b 1
)
echo [OK] Dependencias instaladas
echo.

REM Verificar si Docker está corriendo
echo [*] Verificando que Docker esté corriendo...
docker ps >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [X] Docker no está corriendo
    echo     Por favor inicia Docker Desktop e intenta de nuevo
    pause
    exit /b 1
)
echo [OK] Docker está corriendo
echo.

REM Iniciar base de datos
echo [*] Iniciando contenedor de PostgreSQL con pgvector...
docker ps -a | findstr "olaspp_postgres_vector" >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [!] El contenedor ya existe
    docker ps | findstr "olaspp_postgres_vector" >nul 2>&1
    if %ERRORLEVEL% equ 0 (
        echo [OK] El contenedor ya está corriendo
    ) else (
        echo [*] Iniciando contenedor existente...
        docker-compose -f ..\docker-compose.vectordb.yml up -d
        echo [OK] Contenedor iniciado
    )
) else (
    echo [*] Creando e iniciando nuevo contenedor...
    docker-compose -f ..\docker-compose.vectordb.yml up -d
    if %ERRORLEVEL% neq 0 (
        echo [X] Error al iniciar contenedor
        pause
        exit /b 1
    )
    echo [OK] Contenedor creado e iniciado
)
echo.

REM Esperar a que PostgreSQL esté listo
echo [*] Esperando a que PostgreSQL esté listo...
set /a attempts=0
set /a max_attempts=60

:wait_loop
if %attempts% geq %max_attempts% (
    echo.
    echo [X] Timeout esperando a PostgreSQL
    echo [!] Verifica los logs con: docker logs olaspp_postgres_vector
    pause
    exit /b 1
)

docker exec olaspp_postgres_vector pg_isready -U postgres -d olaspp >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [OK] PostgreSQL está listo
    goto :postgres_ready
)

set /a attempts+=1
echo|set /p="."
timeout /t 1 /nobreak >nul
goto :wait_loop

:postgres_ready
echo.

REM Probar conexión
echo [*] Probando conexión a la base de datos...
docker exec olaspp_postgres_vector psql -U postgres -d olaspp -c "SELECT 1" >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [X] No se pudo conectar a la base de datos
    pause
    exit /b 1
)
echo [OK] Conexión exitosa
echo.

REM Ejecutar migraciones
echo [*] Ejecutando migraciones de base de datos...
call npm run migration:run
if %ERRORLEVEL% neq 0 (
    echo [!] Las migraciones fallaron o ya están aplicadas
) else (
    echo [OK] Migraciones ejecutadas
)
echo.

REM Mostrar información
echo.
echo ========================================
echo   ✓ Setup Completado Exitosamente
echo ========================================
echo.
echo 📊 Información del Servidor:
echo   • API URL: http://localhost:3000
echo   • Health Check: http://localhost:3000/health
echo   • Base de Datos: PostgreSQL 16 + PostGIS + pgvector
echo   • Puerto DB: 5434 (externo) -> 5432 (interno)
echo.
echo 🚀 Próximos Pasos:
echo   1. Inicia el servidor: npm run dev
echo   2. Prueba el health check en: http://localhost:3000/health
echo   3. Explora los endpoints en src/routes/
echo.
echo 📚 Comandos útiles:
echo   • Ver logs de DB: docker logs olaspp_postgres_vector -f
echo   • Detener DB: docker-compose -f ..\docker-compose.vectordb.yml down
echo   • Reiniciar DB: docker-compose -f ..\docker-compose.vectordb.yml restart
echo   • Ver docs: type SETUP.md
echo.

REM Preguntar si quiere iniciar el servidor
set /p start_server="¿Quieres iniciar el servidor ahora? (s/n): "
if /i "%start_server%"=="s" (
    echo.
    echo [*] Iniciando servidor...
    call npm run dev
) else (
    echo.
    echo [OK] Setup completado. Inicia el servidor con: npm run dev
    pause
)

endlocal
