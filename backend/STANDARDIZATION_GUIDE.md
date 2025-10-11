# Guía de Estandarización de API

## 🎯 Objetivo
Estandarizar el contrato de request/response para asegurar que:
- **Entrada**: Solo JSON (Content-Type: application/json)
- **Salida**: Siempre JSON con estructura consistente

---

## 📥 1. Configuración en index.ts

```typescript
import { jsonOnlyMiddleware } from './middlewares/jsonOnly';

// Middlewares globales (en orden)
app.use(cors());
app.use(express.json({ limit: '10mb' }));           // Parse JSON
app.use(express.urlencoded({ extended: true }));     // Parse URL-encoded
app.use(jsonOnlyMiddleware);                         // ← AGREGAR: Validar JSON only

// Logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});
```

---

## 📤 2. Estructura de Respuestas Estandarizada

### Todas las respuestas siguen este formato:

```typescript
{
  "success": boolean,      // true si todo OK, false si error
  "message": string,       // Mensaje descriptivo (opcional)
  "data": any,            // Datos de respuesta (solo en success)
  "error": string,        // Mensaje de error (solo en error)
  "errors": object,       // Errores de validación (opcional)
  "timestamp": string     // ISO 8601 timestamp
}
```

---

## ✅ 3. Ejemplos de Respuestas

### Éxito (200)
```json
{
  "success": true,
  "message": "Usuario obtenido exitosamente",
  "data": {
    "id": 1,
    "username": "juan",
    "email": "juan@example.com"
  },
  "timestamp": "2025-10-03T19:30:00.000Z"
}
```

### Creado (201)
```json
{
  "success": true,
  "message": "Usuario creado exitosamente",
  "data": {
    "id": 1,
    "username": "juan",
    "email": "juan@example.com"
  },
  "timestamp": "2025-10-03T19:30:00.000Z"
}
```

### Error de Validación (400)
```json
{
  "success": false,
  "message": "Errores de validación",
  "error": "Errores de validación",
  "errors": {
    "email": ["El email es requerido", "Formato de email inválido"],
    "password": ["La contraseña debe tener al menos 8 caracteres"]
  },
  "timestamp": "2025-10-03T19:30:00.000Z"
}
```

### No Autorizado (401)
```json
{
  "success": false,
  "message": "Credenciales inválidas",
  "error": "Credenciales inválidas",
  "timestamp": "2025-10-03T19:30:00.000Z"
}
```

### No Encontrado (404)
```json
{
  "success": false,
  "message": "Usuario no encontrado",
  "error": "Usuario no encontrado",
  "timestamp": "2025-10-03T19:30:00.000Z"
}
```

### Conflicto (409)
```json
{
  "success": false,
  "message": "El email ya existe",
  "error": "El email ya existe",
  "timestamp": "2025-10-03T19:30:00.000Z"
}
```

### Error del Servidor (500)
```json
{
  "success": false,
  "message": "Error interno del servidor",
  "error": "Error interno del servidor",
  "timestamp": "2025-10-03T19:30:00.000Z"
}
```

---

## 🛠️ 4. Uso en Controllers

### Antes (sin estandarización)
```typescript
// ❌ Formato inconsistente
return res.status(201).json({
  message: 'Usuario creado',
  user: newUser
});

// ❌ Otro formato diferente
return res.status(400).json({ error: 'Email already exists.' });

// ❌ Otro más
return res.json({ success: true });
```

### Después (con ApiResponse)
```typescript
// ✅ Formato consistente
import { ApiResponse } from '../utils/ApiResponse';

// Éxito
return ApiResponse.success(res, { user: newUser }, "Usuario obtenido");

// Creado
return ApiResponse.created(res, { user: newUser }, "Usuario creado");

// Error de validación
return ApiResponse.validationError(res, validation.errors);

// No autorizado
return ApiResponse.unauthorized(res, "Credenciales inválidas");

// No encontrado
return ApiResponse.notFound(res, "Usuario no encontrado");

// Conflicto
return ApiResponse.conflict(res, "El email ya existe");

// Error del servidor
return ApiResponse.serverError(res, "Error al crear usuario", err);
```

---

## 📋 5. Métodos Disponibles en ApiResponse

| Método | Status Code | Uso |
|--------|-------------|-----|
| `success(res, data, message)` | 200 | Operación exitosa |
| `created(res, data, message)` | 201 | Recurso creado |
| `noContent(res)` | 204 | Sin contenido (delete exitoso) |
| `validationError(res, errors, message)` | 400 | Errores de validación |
| `unauthorized(res, message)` | 401 | No autenticado |
| `forbidden(res, message)` | 403 | No autorizado |
| `notFound(res, message)` | 404 | Recurso no encontrado |
| `conflict(res, message)` | 409 | Conflicto (duplicado) |
| `serverError(res, message, error)` | 500 | Error del servidor |

---

## 🔒 6. Validación de Content-Type

El middleware `jsonOnlyMiddleware` asegura:

1. **Requests POST/PUT/PATCH** deben tener `Content-Type: application/json`
2. **Todas las responses** tienen `Content-Type: application/json`

### Ejemplo de rechazo:
```bash
# Request con Content-Type incorrecto
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: text/plain" \
  -d "username=test"

# Response (415 Unsupported Media Type)
{
  "success": false,
  "message": "Content-Type debe ser application/json",
  "error": "Unsupported Media Type",
  "timestamp": "2025-10-03T19:30:00.000Z"
}
```

---

## 🎓 7. Migración Gradual

Puedes migrar tus controllers gradualmente:

1. **No necesitas cambiar todo de golpe**
2. Empieza por un controller (ej. AuthController)
3. Usa `ApiResponse` en los nuevos endpoints
4. Refactoriza los antiguos cuando tengas tiempo

---

## 📝 8. TypeScript Types para el Frontend

```typescript
// Compartir con el frontend
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
  timestamp: string;
}

// Uso en frontend
const response: ApiResponse<{ user: User }> = await fetch('/api/auth/login');
if (response.success) {
  console.log(response.data.user);
} else {
  console.error(response.error);
}
```

---

## ✅ Beneficios

1. **Predecibilidad**: El frontend siempre sabe qué esperar
2. **Debugging**: Fácil identificar errores con `success: false`
3. **Documentación**: Estructura clara y auto-documentada
4. **Type Safety**: TypeScript puede tipar las respuestas
5. **Consistencia**: Todos los endpoints responden igual
6. **Standards**: Sigue convenciones REST estándar

---

## 🚀 Próximos Pasos

1. Agregar `jsonOnlyMiddleware` en `index.ts`
2. Importar `ApiResponse` en tus controllers
3. Refactorizar un controller como ejemplo
4. Aplicar gradualmente al resto del proyecto
