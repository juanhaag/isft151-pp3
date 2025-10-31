# 🏄 OlasPP Backend - Guía de Instalación

Esta guía te ayudará a configurar el backend de OlasPP desde cero en una máquina nueva con Node.js y Docker instalados.

## 📋 Requisitos Previos

Antes de ejecutar el script de instalación, asegúrate de tener instalado:

- **Node.js** v18 o superior
- **npm** v9 o superior
- **Docker** y **Docker Compose**
- **PostgreSQL con PostGIS** (opcional si usas Docker)

Verifica las instalaciones:
```bash
node --version
npm --version
docker --version
docker-compose --version
```

## ⚙️ Configuración Inicial

### 1. Configurar Variables de Entorno

Crea un archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
```

Edita el archivo `.env` y configura las siguientes variables **OBLIGATORIAS**:

#### 🔑 API Keys (Obligatorio)
```env
# Gemini AI (Obligatorio) - Obtén tu API key en: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=tu_api_key_aqui

# Ollama (Opcional - para usar modelos locales)
OLLAMA_BASE_URL=http://192.168.0.12:11434
OLLAMA_MODEL=qwen2.5:7b
```

#### 🗄️ Base de Datos
```env
# Configuración de PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=olaspp_password
DB_NAME=olaspp
```

#### 🌐 Servidor
```env
PORT=3000
NODE_ENV=development
```

### 2. Ejecutar Script de Instalación

Una vez configurado el `.env`, ejecuta el script de setup:

#### 🐧 Linux / macOS
```bash
npm run setup
```

#### 🪟 Windows

**Opción 1: PowerShell (Recomendado)**
```powershell
npm run setup:windows
```

**Opción 2: Batch Script**
```cmd
npm run setup:win
```

**Opción 3: Directo**
```cmd
scripts\setup.bat
```

Este script automáticamente:
- ✅ Instala todas las dependencias de Node.js
- ✅ Inicia el contenedor de PostgreSQL con PostGIS
- ✅ Espera a que la base de datos esté lista
- ✅ Ejecuta todas las migraciones de TypeORM
- ✅ Inicia el servidor backend

## 🚀 Comandos Disponibles

### Desarrollo
```bash
# Iniciar servidor en modo desarrollo
npm run dev

# Iniciar solo la base de datos
npm run db:start

# Ejecutar migraciones
npm run migration:run

# Detener base de datos
npm run db:stop
```

### Setup Completo
```bash
# Setup completo desde cero (recomendado primera vez)
npm run setup

# Setup rápido (si ya tienes dependencias)
npm run setup:quick
```

### Base de Datos
```bash
# Crear una nueva migración
npm run migration:create -- src/migrations/NombreMigracion

# Revertir última migración
npm run migration:revert

# Ver estado de migraciones
npm run migration:show
```

## 🐳 Configuración de Docker

El proyecto incluye un `docker-compose.yml` que configura:

- **PostgreSQL 16** con extensión **PostGIS** para datos geoespaciales
- **Puerto**: 5432 (configurable en `.env`)
- **Volumen persistente**: `./pgdata` (los datos se mantienen entre reinicios)

### Servicios Docker

```bash
# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down

# Eliminar todo (incluyendo volúmenes)
docker-compose down -v
```

## 🔧 Solución de Problemas

### Error: "Cannot connect to database"
1. Verifica que Docker esté corriendo: `docker ps`
2. Verifica que el puerto 5432 no esté en uso: `lsof -i :5432`
3. Revisa los logs: `docker-compose logs postgres`

### Error: "GEMINI_API_KEY is not defined"
1. Obtén tu API key en: https://makersuite.google.com/app/apikey
2. Agrégala al archivo `.env`
3. Reinicia el servidor

### Error: "Port 3000 already in use"
1. Cambia el puerto en `.env`: `PORT=3001`
2. O detén el proceso que usa el puerto: `lsof -i :3000` y `kill -9 <PID>`

### Resetear Base de Datos
Si necesitas empezar de cero:
```bash
npm run db:reset
```
**⚠️ ADVERTENCIA**: Esto eliminará todos los datos.

## 📚 Estructura del Proyecto

```
backend/
├── src/
│   ├── config/         # Configuración (DB, env)
│   ├── controllers/    # Controladores de API
│   ├── entities/       # Modelos TypeORM
│   ├── repositories/   # Repositorios de datos
│   ├── routes/         # Rutas de Express
│   ├── services/       # Lógica de negocio
│   ├── middlewares/    # Middlewares
│   ├── migrations/     # Migraciones de DB
│   └── index.ts        # Punto de entrada
├── docker-compose.yml  # Configuración Docker
├── .env.example        # Template de variables
└── package.json        # Dependencias
```

## 🔗 Endpoints Principales

Una vez iniciado, el servidor estará disponible en `http://localhost:3000`

### Health Check
```bash
curl http://localhost:3000/health
```

### Generar Reporte
```bash
curl -X POST http://localhost:3000/api/reports/generate \
  -H "Content-Type: application/json" \
  -d '{
    "spotId": "mdp_puerto_cardiel",
    "targetDate": "2025-11-01",
    "forecastDays": 7
  }'
```

### Listar Spots
```bash
curl http://localhost:3000/api/spots
```

## 📞 Soporte

Si encuentras problemas durante la instalación:

1. Revisa los logs del servidor
2. Verifica que todas las variables de entorno estén configuradas
3. Asegúrate de que Docker esté corriendo
4. Consulta la sección de "Solución de Problemas" arriba

## 🎯 Próximos Pasos

Después de la instalación exitosa:

1. ✅ Prueba el endpoint `/health` para verificar que el servidor funciona
2. ✅ Prueba generar un reporte con el endpoint `/api/reports/generate`
3. ✅ Explora los spots disponibles en `/api/spots`
4. ✅ Configura el frontend en el directorio `../frontend`

---

¡Listo para surfear con datos! 🏄‍♂️🌊
