#!/usr/bin/env bash
set -euo pipefail

# restore-and-seed-local.sh
# Levanta un Postgres en Docker, restaura el dump incluido en el repo
# y ejecuta `npm run seed:cases` apuntando a la DB restaurada.
# USO: desde la raíz del repo: `bash scripts/restore-and-seed-local.sh`

CONTAINER_NAME=klinik-postgres-local
DUMP_FILE=klinik_backup_2025-11-16-002012.dump
PG_USER=postgres
PG_PASSWORD=postgres
PG_PORT=5432
PG_DB=postgres

echo "==> Verificando que Docker esté disponible..."
if ! command -v docker >/dev/null 2>&1; then
  echo "ERROR: Docker no está instalado o no está en PATH. Instálalo antes de continuar." >&2
  exit 1
fi

if [ ! -f "$DUMP_FILE" ]; then
  echo "ERROR: No se encontró el dump '$DUMP_FILE' en la raíz del repo." >&2
  exit 1
fi

if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "Contenedor $CONTAINER_NAME ya existe. Deteniéndolo y eliminándolo..."
  docker rm -f "$CONTAINER_NAME"
fi

echo "==> Iniciando contenedor Postgres ($CONTAINER_NAME)..."
docker run -d --name "$CONTAINER_NAME" -e POSTGRES_PASSWORD="$PG_PASSWORD" -p ${PG_PORT}:5432 postgres:15

echo "==> Esperando a que Postgres esté listo..."
timeout=60
elapsed=0
until docker exec "$CONTAINER_NAME" pg_isready -U "$PG_USER" >/dev/null 2>&1; do
  sleep 1
  elapsed=$((elapsed+1))
  if [ $elapsed -gt $timeout ]; then
    echo "ERROR: timeout esperando a Postgres en el contenedor." >&2
    docker logs "$CONTAINER_NAME" --tail 100 || true
    exit 1
  fi
done

echo "==> Copiando dump al contenedor..."
docker cp "$DUMP_FILE" "$CONTAINER_NAME":/tmp/backup.dump

echo "==> Restaurando dump dentro del contenedor (pg_restore)..."
# Intentar restaurar directamente en la BD 'postgres'. Si el dump contiene CREATE DATABASE, usar -C.
set +e
docker exec -u "$PG_USER" "$CONTAINER_NAME" pg_restore -d "$PG_DB" /tmp/backup.dump
RET=$?
set -e
if [ $RET -ne 0 ]; then
  echo "Intento con -C (el dump puede contener CREATE DATABASE)..."
  docker exec -u "$PG_USER" "$CONTAINER_NAME" pg_restore -C -d "$PG_DB" /tmp/backup.dump
fi

echo "==> Restauración finalizada. Conexión de ejemplo: postgresql://$PG_USER:$PG_PASSWORD@localhost:$PG_PORT/$PG_DB"

echo "==> Ejecutando seed contra la DB local restaurada..."
export DATABASE_URL="postgresql://$PG_USER:$PG_PASSWORD@localhost:$PG_PORT/$PG_DB"

# Ejecutar el seed usando npm script. Usamos npx dotenv solo si querés cargar .env.local; aquí forzamos DATABASE_URL.
echo "Running: DATABASE_URL=... npm run seed:cases"
DATABASE_URL="$DATABASE_URL" npm run seed:cases || {
  echo "ERROR: El seed falló. Revisa la salida anterior." >&2
  exit 1
}

echo "==> Seed finalizado. Verifica con: DATABASE_URL=\"$DATABASE_URL\" node -r dotenv/config scripts/list-cases.js"

echo "==> Listo. Contenedor Postgres: $CONTAINER_NAME (puerto $PG_PORT). Para detenerlo: docker rm -f $CONTAINER_NAME"

chmod +x "$0" 2>/dev/null || true
