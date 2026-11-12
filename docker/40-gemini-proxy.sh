#!/bin/sh
# Inicia el proxy de Gemini en segundo plano. Nginx (que arranca después,
# desde el entrypoint oficial de la imagen) lo publica en /api/gemini.
set -e

node /app/server/proxy.js &
