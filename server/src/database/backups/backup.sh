#!/bin/bash

CONTAINER=db
BACKUP_PATH=./server/src/database/backups/ultimo_backup.sql

echo "Generando backup desde el contenedor $CONTAINER..."

if docker ps --format '{{.Names}}' | grep -q "^$CONTAINER$"; then
  docker exec $CONTAINER pg_dump -U postgres -d practicasPascualinas > "$BACKUP_PATH"
  echo "Backup guardado en $BACKUP_PATH"
else
  echo "❌ Error: el contenedor '$CONTAINER' no está corriendo."
  echo "⚠️ No se generó el backup. Se conserva el archivo anterior."
fi
