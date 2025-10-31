# 🏄 OlasPP Backend - Script de Instalación Automática para Windows
# PowerShell Script

# Configurar política de ejecución (ejecutar como administrador si falla)
# Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

$ErrorActionPreference = "Stop"

# Colores para output
function Write-Step {
    param($Message)
    Write-Host "==> " -ForegroundColor Blue -NoNewline
    Write-Host $Message
}

function Write-Success {
    param($Message)
    Write-Host "✓ " -ForegroundColor Green -NoNewline
    Write-Host $Message
}

function Write-Error {
    param($Message)
    Write-Host "✗ " -ForegroundColor Red -NoNewline
    Write-Host $Message
}

function Write-Warning {
    param($Message)
    Write-Host "⚠ " -ForegroundColor Yellow -NoNewline
    Write-Host $Message
}

function Write-Header {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Blue
    Write-Host "  🏄 OlasPP Backend Setup" -ForegroundColor Blue
    Write-Host "========================================" -ForegroundColor Blue
    Write-Host ""
}

# Verificar requisitos
function Check-Requirements {
    Write-Step "Verificando requisitos del sistema..."

    $missingRequirements = $false

    # Verificar Node.js
    try {
        $nodeVersion = node --version
        Write-Success "Node.js $nodeVersion encontrado"
    } catch {
        Write-Error "Node.js no está instalado"
        Write-Warning "Descarga Node.js desde: https://nodejs.org/"
        $missingRequirements = $true
    }

    # Verificar npm
    try {
        $npmVersion = npm --version
        Write-Success "npm v$npmVersion encontrado"
    } catch {
        Write-Error "npm no está instalado"
        $missingRequirements = $true
    }

    # Verificar Docker
    try {
        $dockerVersion = docker --version
        Write-Success "Docker encontrado: $dockerVersion"
    } catch {
        Write-Error "Docker no está instalado"
        Write-Warning "Descarga Docker Desktop desde: https://www.docker.com/products/docker-desktop"
        $missingRequirements = $true
    }

    # Verificar Docker Compose
    try {
        $composeVersion = docker-compose --version
        Write-Success "Docker Compose encontrado: $composeVersion"
    } catch {
        Write-Error "Docker Compose no está instalado"
        $missingRequirements = $true
    }

    if ($missingRequirements) {
        Write-Error "Faltan requisitos necesarios. Por favor instálalos e intenta de nuevo."
        exit 1
    }

    Write-Host ""
}

# Verificar archivo .env
function Check-EnvFile {
    Write-Step "Verificando archivo de configuración .env..."

    if (-not (Test-Path ".env")) {
        Write-Warning "Archivo .env no encontrado"

        if (Test-Path ".env.example") {
            Write-Step "Creando .env desde .env.example..."
            Copy-Item ".env.example" ".env"
            Write-Success "Archivo .env creado"
        } else {
            Write-Error ".env.example no encontrado. No se puede crear .env"
            exit 1
        }
    } else {
        Write-Success "Archivo .env encontrado"
    }

    # Verificar y corregir configuración de base de datos
    Write-Step "Verificando configuración de base de datos..."
    $envContent = Get-Content ".env" -Raw
    $envContent = $envContent -replace 'DB_PORT=5432', 'DB_PORT=5434'
    $envContent = $envContent -replace 'DB_NAME=surfdb', 'DB_NAME=olaspp'
    $envContent = $envContent -replace 'DB_DATABASE=.*', 'DB_NAME=olaspp'
    $envContent = $envContent -replace 'DATABASE_URL=postgresql://[^@]+@[^:]+:\d+/\w+', 'DATABASE_URL=postgresql://postgres:olaspp_password@localhost:5434/olaspp'
    Set-Content ".env" -Value $envContent -NoNewline
    Write-Success "Configuración actualizada (puerto 5434, base de datos olaspp)"

    Write-Host ""
}

# Instalar dependencias
function Install-Dependencies {
    Write-Step "Instalando dependencias de Node.js..."
    npm install
    Write-Success "Dependencias instaladas"
    Write-Host ""
}

# Iniciar base de datos
function Start-Database {
    Write-Step "Iniciando contenedor de PostgreSQL con pgvector..."

    # Verificar si Docker está corriendo
    try {
        docker ps | Out-Null
    } catch {
        Write-Error "Docker no está corriendo. Inicia Docker Desktop e intenta de nuevo."
        exit 1
    }

    # Verificar si el contenedor ya existe
    $containerExists = docker ps -a --format "{{.Names}}" | Select-String -Pattern "olaspp_postgres_vector" -Quiet

    if ($containerExists) {
        Write-Warning "El contenedor ya existe"

        # Verificar si está corriendo
        $containerRunning = docker ps --format "{{.Names}}" | Select-String -Pattern "olaspp_postgres_vector" -Quiet

        if ($containerRunning) {
            Write-Success "El contenedor ya está corriendo"
        } else {
            Write-Step "Iniciando contenedor existente..."
            docker-compose -f ..\docker-compose.vectordb.yml up -d
            Write-Success "Contenedor iniciado"
        }
    } else {
        Write-Step "Creando e iniciando nuevo contenedor..."
        docker-compose -f ..\docker-compose.vectordb.yml up -d
        Write-Success "Contenedor creado e iniciado"
    }

    Write-Host ""
}

# Esperar a que la base de datos esté lista
function Wait-ForDatabase {
    Write-Step "Esperando a que PostgreSQL esté listo..."

    $maxAttempts = 60
    $attempt = 0

    while ($attempt -lt $maxAttempts) {
        try {
            docker exec olaspp_postgres_vector pg_isready -U postgres -d olaspp 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Success "PostgreSQL está listo"
                Write-Host ""
                return $true
            }
        } catch {
            # Continuar esperando
        }

        $attempt++
        Write-Host "." -NoNewline
        Start-Sleep -Seconds 1
    }

    Write-Host ""
    Write-Error "Timeout esperando a PostgreSQL"
    Write-Warning "Verifica los logs con: docker logs olaspp_postgres_vector"
    return $false
}

# Ejecutar migraciones
function Run-Migrations {
    Write-Step "Ejecutando migraciones de base de datos..."

    try {
        npm run migration:run
        Write-Success "Migraciones ejecutadas correctamente"
    } catch {
        Write-Warning "Las migraciones fallaron o ya están aplicadas"
    }

    Write-Host ""
}

# Verificar conexión a la base de datos
function Test-DatabaseConnection {
    Write-Step "Probando conexión a la base de datos..."

    try {
        docker exec olaspp_postgres_vector psql -U postgres -d olaspp -c "SELECT 1" 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Conexión exitosa a la base de datos"
        } else {
            Write-Error "No se pudo conectar a la base de datos"
            return $false
        }
    } catch {
        Write-Error "Error al probar conexión a la base de datos"
        return $false
    }

    Write-Host ""
    return $true
}

# Instalar extensión pgvector
function Install-PgVector {
    Write-Step "Instalando extensión pgvector..."

    try {
        docker exec olaspp_postgres_vector psql -U postgres -d olaspp -c "CREATE EXTENSION IF NOT EXISTS vector;" 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Extensión pgvector instalada"
        } else {
            Write-Warning "pgvector no está disponible"
            Write-Step "Nota: La extensión debe instalarse manualmente o via migrations_vectorization.sql"
        }
    } catch {
        Write-Warning "Error al instalar pgvector"
        Write-Step "Nota: La extensión debe instalarse manualmente o via migrations_vectorization.sql"
    }

    Write-Host ""
    return $true
}

# Mostrar información del setup
function Show-Info {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✓ Setup Completado Exitosamente" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Información del Servidor:"
    Write-Host "  • API URL: http://localhost:3000"
    Write-Host "  • Health Check: http://localhost:3000/health"
    Write-Host "  • Base de Datos: PostgreSQL 16 + PostGIS + pgvector"
    Write-Host "  • Puerto DB: 5434 (externo) -> 5432 (interno)"
    Write-Host ""
    Write-Host "🚀 Próximos Pasos:"
    Write-Host "  1. Inicia el servidor: npm run dev"
    Write-Host "  2. Prueba el health check: Invoke-WebRequest http://localhost:3000/health"
    Write-Host "  3. Explora los endpoints en src/routes/"
    Write-Host ""
    Write-Host "📚 Comandos útiles:"
    Write-Host "  • Ver logs de DB: docker logs olaspp_postgres_vector -f"
    Write-Host "  • Detener DB: docker-compose -f ..\docker-compose.vectordb.yml down"
    Write-Host "  • Reiniciar DB: docker-compose -f ..\docker-compose.vectordb.yml restart"
    Write-Host "  • Ver docs: Get-Content SETUP.md"
    Write-Host ""
}

# Función principal
function Main {
    Write-Header

    Check-Requirements
    Check-EnvFile
    Install-Dependencies
    Start-Database

    if (-not (Wait-ForDatabase)) {
        Write-Error "No se pudo conectar a la base de datos"
        exit 1
    }

    if (-not (Test-DatabaseConnection)) {
        Write-Error "Falló la prueba de conexión"
        exit 1
    }

    Install-PgVector

    Run-Migrations
    Show-Info

    # Preguntar si quiere iniciar el servidor
    $response = Read-Host "¿Quieres iniciar el servidor ahora? (s/n)"
    if ($response -eq "s" -or $response -eq "S" -or $response -eq "y" -or $response -eq "Y") {
        Write-Step "Iniciando servidor..."
        npm run dev
    } else {
        Write-Host ""
        Write-Success "Setup completado. Inicia el servidor con: npm run dev"
    }
}

# Ejecutar script
try {
    Main
} catch {
    Write-Error "Error durante el setup: $_"
    exit 1
}
