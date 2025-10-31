# 🪟 OlasPP Backend - Guía de Instalación para Windows

## 🚀 Instalación Rápida

### Requisitos
- Node.js v18+ ([Descargar](https://nodejs.org/))
- Docker Desktop ([Descargar](https://www.docker.com/products/docker-desktop))

### Pasos

1. **Configurar `.env`**
```cmd
copy .env.example .env
notepad .env
```
Agregar tu `GEMINI_API_KEY` (obtenerla en: https://makersuite.google.com/app/apikey)

2. **Ejecutar Setup**

**Opción A: Batch Script (Más Compatible)**
```cmd
npm run setup:win
```

**Opción B: PowerShell (Recomendado)**
```powershell
npm run setup:windows
```

**Opción C: Directo**
```cmd
scripts\setup.bat
```

3. **¡Listo!** El servidor estará en `http://localhost:3000`

---

## 📝 ¿Qué Hace el Script?

1. ✅ Verifica que Node.js, npm y Docker estén instalados
2. ✅ Crea archivo `.env` si no existe
3. ✅ Valida que `GEMINI_API_KEY` esté configurado
4. ✅ Instala dependencias de Node.js (`npm install`)
5. ✅ Inicia contenedor de PostgreSQL con Docker
6. ✅ Espera a que la base de datos esté lista
7. ✅ Ejecuta migraciones de base de datos
8. ✅ Pregunta si quieres iniciar el servidor

---

## 🔧 Comandos Disponibles

### Setup
```cmd
npm run setup:win          # Setup completo (Batch)
npm run setup:windows      # Setup completo (PowerShell)
npm run setup:quick        # Setup rápido (si ya tienes deps)
```

### Desarrollo
```cmd
npm run dev               # Iniciar servidor
npm run build             # Compilar TypeScript
npm start                 # Iniciar en producción
```

### Base de Datos
```cmd
npm run db:start          # Iniciar PostgreSQL
npm run db:stop           # Detener PostgreSQL
npm run db:logs           # Ver logs
npm run db:reset          # Resetear DB (⚠️ elimina datos)
```

### Migraciones
```cmd
npm run migration:run     # Ejecutar migraciones
npm run migration:revert  # Revertir última
npm run migration:show    # Ver estado
```

---

## ⚠️ Solución de Problemas

### "Docker no está corriendo"
1. Abre **Docker Desktop**
2. Espera a que inicie completamente
3. Vuelve a ejecutar el script

### "PowerShell: Execution Policy Error"
Ejecuta PowerShell como Administrador:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### "Puerto 3000 ya en uso"
```cmd
# Ver qué proceso usa el puerto
netstat -ano | findstr :3000

# Matar el proceso (reemplaza <PID>)
taskkill /PID <PID> /F
```

### "Puerto 5432 ya en uso" (PostgreSQL)
```cmd
# Ver procesos en el puerto
netstat -ano | findstr :5432

# Detener contenedor de Docker
docker-compose down

# O cambiar puerto en .env
DB_PORT=5433
```

### "GEMINI_API_KEY no configurado"
1. Ve a: https://makersuite.google.com/app/apikey
2. Crea o copia tu API key
3. Edita `.env`:
```
GEMINI_API_KEY=tu_api_key_aqui
```

---

## 📂 Archivos del Proyecto

```
backend/
├── scripts/
│   ├── setup.sh          # Script para Linux/macOS
│   ├── setup.ps1         # Script para Windows PowerShell
│   └── setup.bat         # Script para Windows Batch
├── src/                  # Código fuente
├── .env.example          # Template de configuración
├── docker-compose.yml    # Configuración Docker
├── SETUP.md             # Guía completa
└── package.json         # Dependencias
```

---

## 🌐 URLs Importantes

- **API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health
- **Gemini API Key**: https://makersuite.google.com/app/apikey
- **Docker Desktop**: https://www.docker.com/products/docker-desktop
- **Node.js**: https://nodejs.org/

---

## 📞 Siguiente Paso

Una vez completada la instalación:

```cmd
npm run dev
```

Luego prueba:
```cmd
curl http://localhost:3000/health
```

O abre en tu navegador: http://localhost:3000/health

---

¡Listo para surfear con datos! 🏄‍♂️🌊
