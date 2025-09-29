# E-commerce Full-Stack (React + FastAPI) - Versión Lista para Usar

Este proyecto es una aplicación web de comercio electrónico completa con un frontend construido en **React** y un backend en **Python** con **FastAPI**.

## Pasos para la Instalación y Ejecución

Sigue estas instrucciones al pie de la letra.

### 1. Backend (FastAPI)

```bash
# 1. Navega a la carpeta del backend
cd backend

# 2. Crea y activa un entorno virtual
python -m venv .venv
# .\.venv\Scripts\Activate.ps1 # Windows PowerShell

# 3. Instala las dependencias
pip install -r requirements.txt

# 4. Crea el archivo .env a partir del ejemplo
cp .env.example .env  # En Windows, usa 'copy'

# 5. Edita el archivo .env para generar y añadir tu propia SECRET_KEY
# Abre el archivo .env y pega una nueva clave generada con: openssl rand -hex 32

# 6. Inicia el servidor del backend
uvicorn main:app --reload --port 8000