# 🏄 OlasPP - Plataforma de Reportes de Surf con IA

Sistema completo de generación y gestión de reportes de surf utilizando IA, datos meteorológicos en tiempo real y vectorización para aprendizaje de feedback.

## 🚀 Inicio Rápido

### Requisitos Previos

- **Node.js** v18 o superior
- **npm** v9 o superior
- **Docker** y **Docker Compose**

### Instalación en 3 Pasos

#### 1️⃣ Backend

```bash
cd release
./start-back.sh
./start-frontend.sh

Si no funciona continuar con el siguiente paso.
```

```bash


cd backend

# Configurar variables de entorno
cp .env.example .env
# Edita .env y agrega tu GEMINI_API_KEY

# Ejecutar setup automático
npm run setup


```

El script de setup automáticamente:
- ✅ Instala dependencias
- ✅ Inicia PostgreSQL con PostGIS
- ✅ Ejecuta migraciones
- ✅ Inicia el servidor

**[Ver guía completa de backend](backend/SETUP.md)**

#### 2️⃣ Frontend (Si no funciona el script de release)

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El frontend estará disponible en: `http://localhost:4321`

#### 3️⃣ ¡Listo!

Accede a `http://localhost:4321` y comienza a generar reportes.

---

## 📁 Estructura del Proyecto

```
olaspp3/
├── backend/                 # API Node.js + TypeORM
│   ├── src/
│   │   ├── controllers/    # Controladores de API
│   │   ├── services/       # Lógica de negocio
│   │   ├── entities/       # Modelos de base de datos
│   │   ├── repositories/   # Acceso a datos
│   │   ├── routes/         # Rutas de Express
│   │   ├── migrations/     # Migraciones TypeORM
│   │   └── strategy/       # Providers de IA (Gemini, 
│   ├── scripts/
│   │   └── setup.sh        # Script de instalación 
│   ├── docker-compose.yml  # PostgreSQL + PostGIS
│   ├── SETUP.md           # Guía detallada
│   └── package.json
│
└── frontend/               # Astro + TypeScript
    ├── src/
    │   ├── components/    # Componentes Astro
    │   ├── pages/         # Páginas y rutas
    │   └── layouts/       # Layouts base
    ├── astro.config.mjs   # Configuración Astro
    └── package.json
```

---

## ✨ Características Principales

### 🤖 Generación de Reportes con IA
- **Análisis inteligente** de condiciones de surf
- **Recomendaciones personalizadas** por horario
- **Integración con Gemini AI** y modelos locales (Ollama)
- **Mejor día de la semana** para surfear

### 📊 Sistema de Feedback y Aprendizaje
- **Vectorización** de condiciones meteorológicas
- **Búsqueda por similitud** con pgvector
- **Aprendizaje automático** de reportes anteriores con buen feedback
- **Sistema de calificaciones** (1-5 estrellas)

### 👤 Gestión de Usuarios
- **Registro y login** con JWT
- **Perfil de usuario** con historial de reportes
- **Compartir reportes** con enlaces únicos
- **Reportes asociados** al usuario logueado

### 🌊 Datos en Tiempo Real
- **Integración con Open-Meteo API**
- **Datos de oleaje, viento, mareas**
- **Pronóstico hasta 7 días**
- **14 spots de surf** en Argentina

### 🗺️ Gestión Geoespacial
- **PostgreSQL con PostGIS**
- **Coordenadas de spots**
- **Búsqueda por ubicación**

---

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** + **TypeScript**
- **Express** - Framework web
- **TypeORM** - ORM para PostgreSQL
- **PostgreSQL 16** + **PostGIS** - Base de datos
- **pgvector** - Búsqueda vectorial
- **Gemini AI** - Generación de reportes
- **Ollama** - IA local (opcional)
- **Docker** - Contenerización

### Frontend
- **Astro** - Framework web moderno
- **TypeScript**
- **Tailwind CSS** - Estilos
- **Lucide Icons** - ICons

---

## 📚 Comandos Útiles

### Backend

```bash
# Desarrollo
npm run dev                # Iniciar servidor
npm run build             # Compilar TypeScript
npm start                 # Producción

# Base de Datos
npm run db:start          # Iniciar PostgreSQL
npm run db:stop           # Detener PostgreSQL
npm run db:logs           # Ver logs
npm run db:reset          # Resetear DB (⚠️ elimina datos)

# Migraciones
npm run migration:run     # Ejecutar migraciones
npm run migration:revert  # Revertir última migración
npm run migration:show    # Ver estado

# Setup
npm run setup             # Setup completo
npm run setup:quick       # Setup rápido (si ya tienes deps)
```

### Frontend

```bash
npm run dev               # Desarrollo
npm run build             # Build producción
npm run preview           # Preview build
```

---

## 🔧 Configuración

### Variables de Entorno - Backend

Crea `backend/.env` con:

```env
# API Keys (Obligatorio)
GEMINI_API_KEY=tu_api_key_aqui

# Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=olaspp_password
DB_NAME=olaspp

# Servidor
PORT=3000
NODE_ENV=development

# Ollama (Opcional)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:7b
```

### Variables de Entorno - Frontend

Crea `frontend/.env` con:

```env
PUBLIC_API_URL=http://localhost:3000
```

---

## 📖 Endpoints Principales

### Reportes
- `POST /api/reports/generate` - Generar reporte
- `POST /api/reports/:reportId/feedback` - Enviar feedback
- `GET /api/reports/:reportId/similar` - Reportes similares

### Usuarios
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login
- `GET /api/profile/:userId/reports` - Reportes del usuario

### Spots
- `GET /api/spots` - Listar todos los spots
- `GET /api/spots/:id` - Obtener spot por ID

### Health Check
- `GET /health` - Estado del servidor

---


## 📝 Notas Importantes

### Obtener API Key de Gemini
1. Ve a: https://makersuite.google.com/app/apikey
2. Crea un nuevo proyecto o selecciona uno existente
3. Genera una API key
4. Agrégala a `backend/.env`

### Sistema de Vectorización
El sistema usa **pgvector** para almacenar embeddings de condiciones meteorológicas y encontrar reportes similares. Esto permite que la IA aprenda de feedback anterior.

### Modelos de IA Soportados
- **Gemini** (Google) - Recomendado, requiere API key
- **Ollama** (Local) - Opcional, requiere instalación local

---

## 🐛 Solución de Problemas

### Puerto ya en uso
```bash
# Backend
lsof -i :3000
kill -9 <PID>

# Frontend
lsof -i :4321
kill -9 <PID>
```

### Base de datos no conecta
```bash
# Ver estado de Docker
docker ps

# Ver logs
docker-compose logs -f

# Reiniciar
npm run db:reset
```

### Error de migraciones
```bash
# Ver estado
npm run migration:show

# Revertir y volver a ejecutar
npm run migration:revert
npm run migration:run
```



## 📄 Licencia

Este proyecto es parte de un trabajo práctico para el ISFT 151.

---

 🏄‍♂️🌊
