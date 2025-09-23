# Surf Report API v2.0

API avanzada para generar reportes de surf utilizando APIs externas (Open Meteo) e inteligencia artificial (Gemini, extensible a otros proveedores).

## Características

- **TypeORM** con PostgreSQL y PostGIS para datos geoespaciales
- **Arquitectura modular** con patrones de diseño avanzados (Repository, Strategy, Factory)
- **Servicio dedicado Open Meteo** con configuración por variables de entorno
- **Múltiples proveedores de IA** configurables (actualmente Gemini)
- **Consultas geoespaciales** para spots cercanos con PostGIS
- **TypeScript estricto** para máxima type safety
- **Datos JSONB** para condiciones de zonas flexibles
- **Logging avanzado** y manejo de errores
- **Validación robusta** de entrada de datos

## Estructura del Proyecto

```
src/
├── config/          # Configuración TypeORM y base de datos
├── controllers/     # Controladores REST API con validación
├── entities/        # Entidades TypeORM (Zone, Spot, Report)
├── repositories/    # Patrón Repository con TypeORM
├── routes/          # Definición de rutas expresas
├── services/        # Servicios (Report, OpenMeteo)
├── strategy/        # Patrón Strategy para proveedores de IA
├── scripts/         # Scripts de inicialización y seeding
└── types/           # Tipos TypeScript compartidos
```

## Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd backend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Editar `.env` con tus valores:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/surfdb
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```

4. **Configurar PostgreSQL**
- Instalar PostgreSQL con extensión PostGIS
- Crear base de datos `surfdb`

5. **Inicializar base de datos**
```bash
npm run db:init
```

## Scripts Disponibles

- `npm run dev` - Ejecutar en modo desarrollo con hot reload
- `npm run build` - Compilar TypeScript para producción
- `npm start` - Ejecutar aplicación compilada
- `npm run typecheck` - Verificar tipos TypeScript
- `npm run db:sync` - Sincronizar esquema TypeORM (desarrollo)
- `npm run db:seed` - Poblar datos de ejemplo
- `npm run db:init` - Sincronizar esquema y poblar datos

## API Endpoints

### Health Check
```
GET /health
```

### Zonas
```
GET    /api/zones           # Listar todas las zonas
GET    /api/zones/:id       # Obtener zona por ID
POST   /api/zones           # Crear nueva zona
PUT    /api/zones/:id       # Actualizar zona
```

### Spots
```
GET    /api/spots           # Listar todos los spots
GET    /api/spots/:id       # Obtener spot por ID
GET    /api/spots/zone/:zoneId  # Spots por zona
POST   /api/spots           # Crear nuevo spot
```

### Reportes
```
POST   /api/reports/generate           # Generar nuevo reporte
GET    /api/reports/recent             # Reportes recientes
GET    /api/reports/stats              # Estadísticas de reportes
GET    /api/reports/good-conditions    # Reportes con buenas condiciones
GET    /api/reports/search             # Buscar reportes por contenido
GET    /api/reports/zone/:zoneId       # Reportes por zona
GET    /api/reports/spot/:spotId       # Reportes por spot
GET    /api/reports/:id                # Obtener reporte por ID
GET    /api/reports/weather/forecast/:spotId  # Pronóstico meteorológico
GET    /api/reports/test/services      # Probar conectividad de servicios
```

## Ejemplos de Uso

### Generar Reporte de Surf

```bash
curl -X POST http://localhost:3000/api/reports/generate \
  -H "Content-Type: application/json" \
  -d '{
    "spotId": "1",
    "userPreferences": "olas grandes para longboard",
    "forecastDays": 7
  }'
```

### Crear Nueva Zona

```bash
curl -X POST http://localhost:3000/api/zones \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Costa Norte",
    "best_conditions": {
      "swell_direction": ["N", "NE", "E"],
      "wind_direction": ["S", "SW", "W"],
      "tide": ["Mid to High"],
      "swell_size": "1.5m+"
    }
  }'
```

### Crear Nuevo Spot

```bash
curl -X POST http://localhost:3000/api/spots \
  -H "Content-Type: application/json" \
  -d '{
    "place_id": "2",
    "lat": "-34.6037",
    "lon": "-58.3816",
    "display_name": "Playa Grande, Mar del Plata",
    "zona": "Costa Norte",
    "zona_id": 2
  }'
```

## Estructura de Datos (TypeORM Entities)

### Zone Entity
```typescript
@Entity('zones')
export class Zone {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'jsonb' })
  best_conditions: BestConditions;

  @Column({ type: 'jsonb', nullable: true })
  bad_conditions?: BestConditions;

  @OneToMany(() => Spot, spot => spot.zone)
  spots: Spot[];
}
```

### Spot Entity
```typescript
@Entity('spots')
export class Spot {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  place_id: string;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326
  })
  location: string;

  @ManyToOne(() => Zone, zone => zone.spots)
  zone: Zone;

  @OneToMany(() => Report, report => report.spot)
  reports: Report[];
}
```

### Report Entity
```typescript
@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'jsonb' })
  weather_data: WeatherData;

  @ManyToOne(() => Spot, spot => spot.reports)
  spot: Spot;
}
```

## Patrones de Diseño Implementados

### Repository Pattern con TypeORM
Abstrae el acceso a datos con interfaces bien definidas:
- `IZoneRepository`, `ISpotRepository`, `IReportRepository`
- Implementaciones con TypeORM Repository
- Métodos avanzados (búsqueda geoespacial, filtros JSONB)

### Strategy Pattern para IA
Permite intercambiar proveedores de IA:
- `IAIProvider` interface
- `GeminiProvider` implementación
- `AIProviderFactory` para crear instancias
- Configuración por variables de entorno

### Service Layer
Servicios especializados con responsabilidades claras:
- `OpenMeteoService` - Integración APIs meteorológicas
- `ReportService` - Lógica de negocio principal
- Configuración centralizada y manejo de errores

## Extensibilidad

### Agregar Nuevo Proveedor de IA

1. Implementar `IAIProvider`:
```typescript
export class OpenAIProvider implements IAIProvider {
  async generateReport(request: ReportRequest): Promise<string> {
    // Implementación con OpenAI API
  }
}
```

2. Agregar al factory:
```typescript
case AIProviderType.OPENAI:
  return new OpenAIProvider(config);
```

### Agregar Nuevos Campos a Zones

Las condiciones se almacenan como JSONB, permitiendo flexibilidad:
```json
{
  "swell_direction": ["S", "SW"],
  "wind_direction": ["NE", "E"],
  "tide": ["Mid", "High"],
  "swell_size": "1m+",
  "new_field": "custom_value"
}
```

## Tecnologías Utilizadas

- **Node.js + TypeScript** - Runtime y lenguaje con tipos estrictos
- **Express.js** - Framework web con middlewares
- **TypeORM** - ORM avanzado con soporte geoespacial
- **PostgreSQL + PostGIS** - Base de datos geoespacial
- **Reflect Metadata** - Decoradores TypeORM
- **Axios** - Cliente HTTP configurado para APIs externas
- **Open Meteo API** - Servicio meteorológico profesional
- **Google Gemini API** - Generación de reportes con IA

## Nuevas Características v2.0

### Variables de Entorno para Open Meteo
```env
OPEN_METEO_MARINE_URL=https://marine-api.open-meteo.com/v1/marine
OPEN_METEO_FORECAST_URL=https://api.open-meteo.com/v1/forecast
```

### Consultas Geoespaciales
```typescript
// Buscar spots cercanos
const nearbySpots = await spotRepository.findNearby(lat, lon, radiusKm);

// Actualizar ubicación de spot
await spotRepository.updateLocation(spotId, newLat, newLon);
```

### Búsquedas Avanzadas con JSONB
```typescript
// Buscar zonas con condiciones específicas
const zones = await zoneRepository.findZonesWithGoodConditions({
  swell_direction: ['S', 'SW'],
  wind_direction: ['NE', 'E']
});
```

### Validación Robusta
- Validación de entrada en controladores
- Límites configurables para consultas
- Manejo de errores específicos por tipo
- Respuestas estructuradas con metadatos

## Contribuir

1. Fork el proyecto
2. Crear branch para feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit cambios (`git commit -am 'Agregar nueva característica'`)
4. Push al branch (`git push origin feature/nueva-caracteristica`)
5. Crear Pull Request

## Licencia

MIT License