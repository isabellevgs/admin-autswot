#!/usr/bin/env sh
# Conecta app, admin e API na rede Docker compartilhada "coolify".
# A API recebe alias DNS "autswot-api" (hostname usado pelo nginx).
# Rode na VPS após deploy (ou adicione como post-deploy no Coolify).
set -eu

NETWORK="coolify"

log() {
  echo "[coolify-network $(date -u +%Y-%m-%dT%H:%M:%SZ)] $*"
}

log "========== Setup rede coolify =========="

if ! docker network inspect "${NETWORK}" >/dev/null 2>&1; then
  docker network create "${NETWORK}"
  log "Rede ${NETWORK} criada."
else
  log "Rede ${NETWORK} já existe."
fi

connect() {
  container="$1"
  alias="${2:-}"

  if ! docker ps -a --format '{{.Names}}' | grep -qx "${container}"; then
    log "${container}: não encontrado (ignorado)."
    return 0
  fi

  if [ -n "${alias}" ]; then
    if docker network connect --alias "${alias}" "${NETWORK}" "${container}" 2>/dev/null; then
      log "${container}: conectado com alias ${alias}."
    else
      log "${container}: já estava na rede (alias ${alias})."
    fi
  else
    if docker network connect "${NETWORK}" "${container}" 2>/dev/null; then
      log "${container}: conectado."
    else
      log "${container}: já estava na rede."
    fi
  fi
}

API_CONTAINER=$(docker ps --filter "name=autswot-api" --format '{{.Names}}' | head -1)
if [ -z "${API_CONTAINER}" ]; then
  API_CONTAINER=$(docker ps --filter "publish=3000" --format '{{.Names}}' | head -1)
fi

APP_CONTAINER=$(docker ps --filter "name=autswot-app" --format '{{.Names}}' | head -1)
if [ -z "${APP_CONTAINER}" ]; then
  APP_CONTAINER=$(docker ps --filter "publish=3001" --format '{{.Names}}' | head -1)
fi

ADMIN_CONTAINER=$(docker ps --filter "name=autswot-admin" --format '{{.Names}}' | head -1)
if [ -z "${ADMIN_CONTAINER}" ]; then
  ADMIN_CONTAINER=$(docker ps --filter "publish=3002" --format '{{.Names}}' | head -1)
fi

log "Containers detectados: API=${API_CONTAINER:-nenhum} App=${APP_CONTAINER:-nenhum} Admin=${ADMIN_CONTAINER:-nenhum}"

log "Conectando containers..."
[ -n "${API_CONTAINER}" ]    && connect "${API_CONTAINER}"    "autswot-api"
[ -n "${APP_CONTAINER}" ]    && connect "${APP_CONTAINER}"
[ -n "${ADMIN_CONTAINER}" ]  && connect "${ADMIN_CONTAINER}"

log "Membros da rede ${NETWORK}: $(docker network inspect "${NETWORK}" --format '{{range .Containers}}{{.Name}} {{end}}')"

if [ -n "${ADMIN_CONTAINER}" ]; then
  if docker exec "${ADMIN_CONTAINER}" wget -qO- --timeout=5 http://host.docker.internal:3000/health >/tmp/admin-health.out 2>/tmp/admin-health.err; then
    log "HTTP /health via host.docker.internal (from admin): OK → $(tr -d '\n' </tmp/admin-health.out)"
    log "========== Setup concluído com sucesso =========="
  else
    err=$(tr -d '\n' </tmp/admin-health.err 2>/dev/null | head -c 200)
    log "HTTP /health via host.docker.internal (from admin): FALHOU → ${err:-sem detalhe}"
    log "Proxy /api/* retornará 502 até a API estar acessível na porta 3000 do host"
    exit 1
  fi
else
  log "Admin não encontrado; setup parcial concluído."
fi
