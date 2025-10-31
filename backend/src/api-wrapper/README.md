# API Wrapper - Especificación de Web API

Este wrapper **valida la especificación completa de entrada/salida** de la API, incluyendo todas las respuestas posibles (éxito y errores), pero NO valida lógica de negocio.

## Estructura

```
api-wrapper/
├── types/          # Especificaciones de input/output para cada endpoint
│   ├── AuthTypes.ts     # Incluye todos los tipos de respuesta (success + errors)
│   ├── UserTypes.ts
│   ├── ZoneTypes.ts
│   ├── SpotTypes.ts
│   └── ReportTypes.ts
├── validators/     # Validadores de estructura (tipos de datos)
│   ├── AuthValidator.ts # Valida TODAS las respuestas (200, 400, 401, 404, 409, 500)
│   ├── UserValidator.ts
│   ├── ZoneValidator.ts
│   ├── SpotValidator.ts
│   └── ReportValidator.ts
└── helpers/
    └── ResponseValidator.ts  # Helper para validar respuestas antes de enviarlas
```

## Propósito

- ✅ **Validar estructura de datos** (tipos, campos requeridos)
- ✅ **Validar TODAS las respuestas** (éxito Y errores)
- ✅ **Documentar contratos de la API** (entrada/salida completa)
- ✅ **Garantizar consistencia** en respuestas exitosas y errores
- ❌ **NO valida lógica de negocio** (ej: email válido, contraseña fuerte)

## Uso en Controladores

### Ejemplo Completo: AuthController

```typescript
import { AuthValidator } from "../api-wrapper/validators/AuthValidator";
import { LoginOutput } from "../api-wrapper/types/AuthTypes";
import { ResponseValidator } from "../api-wrapper/helpers/ResponseValidator";

static async login(req: LoginRequest, res: Response) {
  // 1. Validar estructura de entrada
  const inputValidation = AuthValidator.validateLoginInput({
    username: req.body.email,
    password: req.body.password,
  });
  if (!inputValidation.valid) {
    return res.status(400).json({
      error: "Validation Error",
      description: inputValidation.errors?.join(", ") || "Invalid input"
    });
  }

  // 2. Validar lógica de negocio (tu validador existente)
  const validation = AuthRequest.validateLogin(req.body);
  if (!validation.valid) {
    return res.status(400).json({ errors: validation.errors });
  }

  try {
    // 3. Ejecutar lógica de negocio
    const { user, token } = await this.authService.login({...});

    // 4. Preparar salida según especificación
    const output: LoginOutput = { token };

    // 5. Validar y enviar respuesta (valida automáticamente)
    return ResponseValidator.validateAndSend(
      res,
      200,
      output,
      AuthValidator.validateLoginResponse  // Valida la respuesta completa
    );
  } catch (err) {
    // 6. Validar y enviar errores
    if (errorMessage === "Usuario no encontrado") {
      return ResponseValidator.validateAndSend(
        res,
        404,
        { error: "Not Found", description: errorMessage },
        AuthValidator.validateLoginResponse
      );
    }

    if (errorMessage === "Credenciales inválidas") {
      return ResponseValidator.validateAndSend(
        res,
        401,
        { error: "Unauthorized", description: errorMessage },
        AuthValidator.validateLoginResponse
      );
    }

    return ResponseValidator.validateAndSend(
      res,
      500,
      { error: "Internal Server Error", description: "Error en login" },
      AuthValidator.validateLoginResponse
    );
  }
}
```

### Ventajas del ResponseValidator

- **Validación automática**: Valida TODAS las respuestas (éxito y errores)
- **Logging**: Si una respuesta no cumple la especificación, lo registra en consola
- **No bloquea**: Envía la respuesta aunque no cumpla la especificación (solo advierte)
- **Documentación**: Los tipos documentan TODOS los posibles estados de respuesta

## Especificaciones de Endpoints

### POST /login

**Input:**
```typescript
{
  username: string;  // Solo valida que sea string
  password: string;  // Solo valida que sea string
}
```

**Todas las posibles respuestas:**

```typescript
// 200 - Success
{
  token: string;
}

// 400 - Validation Error (estructura)
{
  error: "Validation Error",
  description: string;
}

// 400 - Validation Error (lógica de negocio)
{
  errors: Record<string, any>;
}

// 401 - Unauthorized (credenciales inválidas)
{
  error: "Unauthorized",
  description: string;
}

// 404 - Not Found (usuario no encontrado)
{
  error: "Not Found",
  description: string;
}

// 500 - Internal Server Error
{
  error: "Internal Server Error",
  description: string;
}
```

El wrapper valida que CUALQUIER respuesta cumpla con uno de estos formatos.

### POST /register

**Input:**
```typescript
{
  username: string;
  email: string;      // Solo valida que sea string, NO formato
  password: string;   // Solo valida que sea string, NO complejidad
  phone?: string;     // Opcional
}
```

**Output (Success):**
```typescript
{
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
    phone?: string;
  }
}
```

## Integración

### Controladores integrados:
- ✅ **AuthController** - login, register, logout (validación completa de todas las respuestas)
- ✅ **UserController** - create, getAll, getById

### Pendientes:
- ⏳ ZoneController
- ⏳ SpotController
- ⏳ ReportController

## Ventajas

1. **Documentación viva** - Los tipos documentan tu API completa
2. **Consistencia** - Todas las respuestas tienen el mismo formato
3. **Detección temprana** - Errores de estructura antes de llegar al cliente
4. **Abstracción** - Puedes cambiar implementación sin romper el contrato
5. **Validación de errores** - Asegura que incluso los errores sigan la especificación

## Notas Importantes

- El wrapper **NO reemplaza** tus validadores de negocio existentes
- Las dos validaciones trabajan juntas:
  - **Wrapper**: Valida estructura (¿es un string? ¿tiene los campos correctos?)
  - **Validador de negocio**: Valida reglas (¿es un email válido? ¿es una contraseña fuerte?)
- La validación de salida es **informativa**, no bloquea respuestas
- **Valida TODO**: Ahora el wrapper valida tanto respuestas exitosas como errores
- Los logs de validación fallida te alertan de inconsistencias en tu API

## Flujo de Validación Completo

1. **Input**: Valida estructura de entrada → `validateLoginInput()`
2. **Business Logic**: Valida reglas de negocio → `AuthRequest.validateLogin()`
3. **Output**: Valida estructura de CUALQUIER respuesta → `validateLoginResponse()`
   - Si es 200: valida que tenga `token`
   - Si es 400: valida que tenga `error/description` o `errors`
   - Si es 401/404/409/500: valida que tenga `error` y `description`
