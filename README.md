# Gestión de Prácticas Pascualinas

Sistema web para la gestión de prácticas profesionales, desarrollado con React, Node.js, Express y PostgreSQL en contenedores Docker.

---

## Entorno local

Para levantar el proyecto desde cero y asegurarte de que no queden rastros antiguos de la base de datos:

```bash
# Apagar todos los servicios y eliminar volúmenes
docker compose down -v

# Reconstruir y levantar nuevamente todos los servicios (frontend, backend y base de datos)
docker compose up --build
```