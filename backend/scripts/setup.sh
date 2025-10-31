#!/bin/bash

# 🏄 OlasPP Backend - Script de Instalación Automática
# Este script configura todo el entorno backend desde cero

set -e  # Salir si hay algún error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones de utilidad
print_step() {
    echo -e "${BLUE}==>${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_header() {
    echo ""
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo -e "${BLUE}  🏄 OlasPP Backend Setup${NC}"
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo ""
}

# Verificar requisitos
check_requirements() {
    print_step "Verificando requisitos del sistema..."

    local missing_requirements=0

    # Verificar Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js $NODE_VERSION encontrado"
    else
        print_error "Node.js no está instalado"
        missing_requirements=1
    fi

    # Verificar npm
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_success "npm v$NPM_VERSION encontrado"
    else
        print_error "npm no está instalado"
        missing_requirements=1
    fi

    # Verificar Docker
    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version | cut -d ' ' -f3 | cut -d ',' -f1)
        print_success "Docker $DOCKER_VERSION encontrado"
    else
        print_error "Docker no está instalado"
        missing_requirements=1
    fi

    # Verificar Docker Compose
    if command -v docker-compose &> /dev/null; then
        COMPOSE_VERSION=$(docker-compose --version | cut -d ' ' -f4 | cut -d ',' -f1)
        print_success "Docker Compose $COMPOSE_VERSION encontrado"
    else
        print_error "Docker Compose no está instalado"
        missing_requirements=1
    fi

    if [ $missing_requirements -eq 1 ]; then
        print_error "Faltan requisitos necesarios. Por favor instálalos e intenta de nuevo."
        exit 1
    fi

    echo ""
}

# Verificar archivo .env
check_env_file() {
    print_step "Verificando archivo de configuración .env..."

    if [ ! -f ".env" ]; then
        print_warning "Archivo .env no encontrado"

        if [ -f ".env.example" ]; then
            print_step "Creando .env desde .env.example..."
            cp .env.example .env
            print_success "Archivo .env creado"
            echo ""
            print_warning "⚠️  IMPORTANTE: Debes configurar las siguientes variables en .env:"
            echo ""
            echo "  1. GEMINI_API_KEY=tu_api_key_aqui"
            echo "     Obtén tu API key en: https://makersuite.google.com/app/apikey"
            echo ""
            echo "  2. DB_PASSWORD=tu_password_seguro"
            echo ""
            read -p "Presiona Enter cuando hayas configurado el archivo .env..."
        else
            print_error ".env.example no encontrado. No se puede crear .env"
            exit 1
        fi
    else
        print_success "Archivo .env encontrado"
    fi

    # Verificar que GEMINI_API_KEY esté configurado
    if grep -q "GEMINI_API_KEY=your_gemini_api_key_here" .env; then
        print_error "GEMINI_API_KEY no está configurado en .env"
        print_warning "Obtén tu API key en: https://makersuite.google.com/app/apikey"
        exit 1
    fi

    print_success "Configuración validada"
    echo ""
}

# Instalar dependencias
install_dependencies() {
    print_step "Instalando dependencias de Node.js..."
    npm install
    print_success "Dependencias instaladas"
    echo ""
}

# Iniciar base de datos
start_database() {
    print_step "Iniciando contenedor de PostgreSQL con pgvector..."

    # Verificar si el contenedor ya existe
    if docker ps -a | grep -q "olaspp_postgres_vector"; then
        print_warning "El contenedor ya existe"

        # Verificar si está corriendo
        if docker ps | grep -q "olaspp_postgres_vector"; then
            print_success "El contenedor ya está corriendo"
        else
            print_step "Iniciando contenedor existente..."
            docker-compose -f ../docker-compose.vectordb.yml up -d
            print_success "Contenedor iniciado"
        fi
    else
        print_step "Creando e iniciando nuevo contenedor..."
        docker-compose -f ../docker-compose.vectordb.yml up -d
        print_success "Contenedor creado e iniciado"
    fi

    echo ""
}

# Esperar a que la base de datos esté lista
wait_for_database() {
    print_step "Esperando a que PostgreSQL esté listo..."

    local max_attempts=60
    local attempt=0

    while [ $attempt -lt $max_attempts ]; do
        if docker exec olaspp_postgres_vector pg_isready -U postgres -d olaspp &> /dev/null; then
            print_success "PostgreSQL está listo"
            echo ""
            return 0
        fi

        attempt=$((attempt + 1))
        echo -n "."
        sleep 1
    done

    echo ""
    print_error "Timeout esperando a PostgreSQL"
    print_warning "Verifica los logs con: docker logs olaspp_postgres_vector"
    return 1
}

# Ejecutar migraciones
run_migrations() {
    print_step "Ejecutando migraciones de base de datos..."

    if npm run migration:run; then
        print_success "Migraciones ejecutadas correctamente"
    else
        print_warning "Las migraciones fallaron o ya están aplicadas"
    fi

    echo ""
}

# Verificar conexión a la base de datos
test_database_connection() {
    print_step "Probando conexión a la base de datos..."

    if docker exec olaspp_postgres_vector psql -U postgres -d olaspp -c "SELECT 1" &> /dev/null; then
        print_success "Conexión exitosa a la base de datos"
    else
        print_error "No se pudo conectar a la base de datos"
        return 1
    fi

    echo ""
}

# Instalar extensión pgvector
install_pgvector() {
    print_step "Instalando extensión pgvector..."

    if docker exec olaspp_postgres_vector psql -U postgres -d olaspp -c "CREATE EXTENSION IF NOT EXISTS vector;" &> /dev/null; then
        print_success "Extensión pgvector instalada"
    else
        print_warning "pgvector no está disponible"
        print_step "Nota: La extensión debe instalarse manualmente o via migrations_vectorization.sql"
    fi

    echo ""
}

# Mostrar información del setup
show_info() {
    echo ""
    echo -e "${GREEN}════════════════════════════════════════${NC}"
    echo -e "${GREEN}  ✓ Setup Completado Exitosamente${NC}"
    echo -e "${GREEN}════════════════════════════════════════${NC}"
    echo ""
    echo "📊 Información del Servidor:"
    echo "  • API URL: http://localhost:3000"
    echo "  • Health Check: http://localhost:3000/health"
    echo "  • Base de Datos: PostgreSQL 16 + PostGIS + pgvector"
    echo "  • Puerto DB: 5434 (externo) -> 5432 (interno)"
    echo ""
    echo "🚀 Próximos Pasos:"
    echo "  1. Inicia el servidor: npm run dev"
    echo "  2. Prueba el health check: curl http://localhost:3000/health"
    echo "  3. Explora los endpoints en src/routes/"
    echo ""
    echo "📚 Comandos útiles:"
    echo "  • Ver logs de DB: docker logs olaspp_postgres_vector -f"
    echo "  • Detener DB: docker-compose -f ../docker-compose.vectordb.yml down"
    echo "  • Reiniciar DB: docker-compose -f ../docker-compose.vectordb.yml restart"
    echo "  • Ver docs: cat SETUP.md"
    echo ""
}

# Función principal
main() {
    print_header

    check_requirements
    check_env_file
    install_dependencies
    start_database
    wait_for_database
    test_database_connection
    install_pgvector
    run_migrations

    show_info

    # Preguntar si quiere iniciar el servidor
    read -p "¿Quieres iniciar el servidor ahora? (s/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[SsYy]$ ]]; then
        print_step "Iniciando servidor..."
        npm run dev
    else
        echo ""
        print_success "Setup completado. Inicia el servidor con: npm run dev"
    fi
}

# Ejecutar script
main
