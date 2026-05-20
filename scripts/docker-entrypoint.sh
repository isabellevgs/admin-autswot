#!/bin/sh
# Verifica conectividade com a API antes de iniciar o nginx.
# Logs vão para stdout — visíveis no Coolify após deploy.
# Sempre inicia o nginx, mesmo se a API estiver indisponível.

SERVICE="${AUTSWOT_SERVICE:-autswot-admin}"
API_HOST="${API_UPSTREAM_HOST:-host.docker.internal}"
API_PORT="${API_UPSTREAM_PORT:-3000}"
MAX_ATTEMPTS="${API_CHECK_RETRIES:-2}"
RETRY_DELAY="${API_CHECK_DELAY:-2}"

log() {
  echo "[${SERVICE} deploy-check $(date -u +%Y-%m-%dT%H:%M:%SZ)] $*"
}

check_api() {
  if wget -qO- --timeout=3 --tries=1 \
    "http://${API_HOST}:${API_PORT}/health" \
    >/tmp/autswot-health.out 2>/tmp/autswot-health.err; then
    log "API: OK → $(tr -d '\n' </tmp/autswot-health.out)"
    return 0
  fi

  err=$(tr -d '\n' </tmp/autswot-health.err 2>/dev/null | head -c 200)

  # 429 = API acessível, rate limit ativo (não é falha de rede)
  if echo "${err}" | grep -q "429"; then
    log "API: OK (429 rate limit — API acessível, rede ok)"
    return 0
  fi

  log "API: falhou → ${err:-sem detalhe}"
  return 1
}

log "========== Verificação pós-deploy =========="
log "Container: $(hostname)"
log "API upstream: http://${API_HOST}:${API_PORT}"

if ! grep -q "host.docker.internal" /etc/hosts 2>/dev/null; then
  gateway=$(ip route show default 2>/dev/null | awk '{print $3}' | head -1)
  if [ -n "${gateway}" ]; then
    echo "${gateway} host.docker.internal" >> /etc/hosts
    log "host.docker.internal → ${gateway} (gateway Docker)"
  fi
fi

api_ok=0
attempt=1

while [ "${attempt}" -le "${MAX_ATTEMPTS}" ]; do
  log "Tentativa ${attempt}/${MAX_ATTEMPTS}: GET http://${API_HOST}:${API_PORT}/health ..."
  if check_api; then
    api_ok=1
    break
  fi
  attempt=$((attempt + 1))
  [ "${attempt}" -le "${MAX_ATTEMPTS}" ] && sleep "${RETRY_DELAY}"
done

if [ "${api_ok}" -eq 0 ]; then
  log "API: FALHOU após ${MAX_ATTEMPTS} tentativas"
  log "Verifique: docker ps --filter publish=3000 && docker logs autswot-api --tail 30"
  log "Proxy /api/* retornará 502 até a API estar acessível"
else
  log "Verificação concluída com sucesso"
fi

log "========== Iniciando nginx =========="
exec nginx -g "daemon off;"
