#!/bin/bash

# Obtenemos el directorio donde se encuentra ESTE script
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

# Titulo
echo "======================================"
echo "  Starting OlasPP Frontend (PREVIEW)  "
echo "======================================"

echo "-> Navegando al directorio del frontend..."
# Navega al directorio del script, sube un nivel, y entra a 'frontend'
cd "$SCRIPT_DIR/../frontend"

echo "-> Instalando dependencias (npm i)..."

if ! npm i; then
    echo "\n[ERROR] Hubo un problema al instalar dependencias."
    echo "Presiona Enter para cerrar esta terminal."
    read
    exit 1
fi

echo "-> Creando el build de producción (npm run build)..."

if ! npm run build; then
    echo "\n[ERROR] Hubo un problema al crear el build."
    echo "Presiona Enter para cerrar esta terminal."
    read
    exit 1
fi

echo "-> Iniciando el servidor de preview (npm run preview)..."
echo "NOTA: Este modo NO se recarga automáticamente con los cambios."
echo "Debes volver a ejecutar este script para ver nuevos cambios."

# 3. Previsualizar
npm run preview

echo "\nEl servidor de Preview se ha detenido."
echo "Presiona Enter para cerrar estaal."
read
