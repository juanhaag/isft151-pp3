# 🤖 Configuración de Ollama para Reportes de Surf

Este documento explica cómo configurar y usar Ollama como proveedor de IA local para generar reportes de surf.

## 📋 Requisitos Previos

- Ollama instalado en tu sistema
- Al menos 8GB de RAM disponible
- Espacio en disco para el modelo (~4GB para qwen2.5:7b)

## 🚀 Instalación de Ollama

### Linux
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### macOS
```bash
brew install ollama
```

### Windows
Descarga el instalador desde: https://ollama.com/download

## 📦 Descargar el Modelo

Descarga el modelo Qwen 2.5 (7B parámetros):

```bash
ollama pull qwen2.5:7b
```

**Modelos alternativos recomendados:**
```bash
# Más rápido pero menos preciso (3B)
ollama pull qwen2.5:3b

# Más preciso pero más lento (14B)
ollama pull qwen2.5:14b

# Modelo general alternativo
ollama pull llama3.1:8b
```

## ⚙️ Configuración

### 1. Iniciar Ollama

```bash
# Inicia el servidor de Ollama
ollama serve
```

Por defecto corre en `http://localhost:11434`

### 2. Configurar Variables de Entorno

Agrega a tu archivo `.env`:

```env
# Proveedor de IA (gemini u ollama)
AI_PROVIDER=ollama

# Configuración de Ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:7b
```

### 3. Verificar Instalación

Ejecuta el script de prueba:

```bash
npm run test:ollama
```

Deberías ver:
```
✅ Ollama está corriendo
✅ Modelo qwen2.5:7b está disponible
📝 REPORTE GENERADO: ...
```

## 🎯 Uso

### Opción 1: Configurar como Proveedor por Defecto

En `.env`:
```env
AI_PROVIDER=ollama
```

Luego genera reportes normalmente:
```bash
POST /api/reports/generate
{
  "spotId": "mdp_playa_grande"
}
```

### Opción 2: Especificar en cada Request

```bash
POST /api/reports/generate
{
  "spotId": "mdp_playa_grande",
  "aiProvider": "ollama"
}
```

## 🔧 Configuración Avanzada

### Cambiar Modelo en Runtime

```typescript
import { OllamaProvider } from './strategy/OllamaProvider';

const provider = new OllamaProvider({
  apiKey: '', // No necesario para Ollama
  baseUrl: 'http://localhost:11434',
  model: 'llama3.1:8b' // Usa modelo alternativo
});
```

### Ajustar Parámetros del Modelo

En `OllamaProvider.ts`, modifica las opciones:

```typescript
options: {
  temperature: 0.7,  // 0.0 = determinístico, 1.0 = creativo
  top_p: 0.9,        // Muestreo nucleus
  top_k: 40,         // Top-k sampling
}
```

### Usar Ollama Remoto

Si Ollama está en otro servidor:

```env
OLLAMA_BASE_URL=http://192.168.1.100:11434
```

## 📊 Comparación de Modelos

| Modelo | Tamaño | RAM | Velocidad | Calidad | Recomendado para |
|--------|--------|-----|-----------|---------|------------------|
| qwen2.5:3b | ~2GB | 4GB | ⚡⚡⚡ | ⭐⭐ | Pruebas rápidas |
| qwen2.5:7b | ~4GB | 8GB | ⚡⚡ | ⭐⭐⭐ | **Producción** |
| qwen2.5:14b | ~8GB | 16GB | ⚡ | ⭐⭐⭐⭐ | Alta calidad |
| llama3.1:8b | ~5GB | 8GB | ⚡⚡ | ⭐⭐⭐ | Alternativa |

## 🐛 Troubleshooting

### Error: "ECONNREFUSED"
```
❌ No se pudo conectar con Ollama
```

**Solución:**
```bash
# Verifica que Ollama esté corriendo
ollama serve

# O en background
nohup ollama serve > /dev/null 2>&1 &
```

### Error: "Model not found"
```
❌ Modelo qwen2.5:7b no encontrado
```

**Solución:**
```bash
ollama pull qwen2.5:7b
```

### Listar Modelos Instalados
```bash
ollama list
```

### Eliminar un Modelo
```bash
ollama rm qwen2.5:7b
```

### Ver Logs de Ollama
```bash
# Linux/Mac
journalctl -u ollama -f

# O en la consola donde ejecutaste ollama serve
```

## 🔄 Comparación: Ollama vs Gemini

| Característica | Ollama | Gemini |
|----------------|---------|--------|
| **Costo** | ✅ Gratis | ⚠️ Pago por uso |
| **Privacidad** | ✅ 100% local | ❌ Cloud |
| **Velocidad** | ⚡ Media (depende de HW) | ⚡⚡ Rápido |
| **Calidad** | ⭐⭐⭐ Buena | ⭐⭐⭐⭐ Excelente |
| **Requisitos** | 🖥️ 8GB RAM | 🌐 Internet + API Key |
| **Disponibilidad** | ✅ Offline | ❌ Requiere conexión |

## 💡 Recomendaciones

1. **Para Desarrollo**: Usa Ollama (gratis, offline)
2. **Para Producción**: Gemini (mejor calidad) o Ollama con modelo grande
3. **Sin Internet**: Solo Ollama funciona
4. **Hardware Limitado**: Usa `qwen2.5:3b` o Gemini
5. **Máxima Calidad**: Usa `qwen2.5:14b` o Gemini

## 📚 Recursos

- [Ollama Documentation](https://github.com/ollama/ollama)
- [Qwen Models](https://ollama.com/library/qwen2.5)
- [Model Library](https://ollama.com/library)

## 🎨 Ejemplo Completo

```typescript
// backend/src/scripts/testOllama.ts
import { OllamaProvider } from './strategy/OllamaProvider';

const provider = new OllamaProvider({
  apiKey: '',
  baseUrl: 'http://localhost:11434',
  model: 'qwen2.5:7b'
});

// Verificar conexión
const isReady = await provider.testConnection();

// Generar reporte
const report = await provider.generateReport({
  weatherData: {...},
  localidadNombre: 'Playa Grande',
  spot: {...}
});

console.log(report);
```

---

**¿Necesitas ayuda?** Abre un issue o consulta la documentación de Ollama.
