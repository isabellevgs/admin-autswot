#!/usr/bin/env sh
# Diagnóstico de SSL/origin para painel.autswot.com (erro Cloudflare 526).
# Rode na VPS: sh scripts/diagnose-ssl.sh
set -eu

DOMAIN="${DOMAIN:-painel.autswot.com}"
ADMIN_PORT="${ADMIN_PORT:-3002}"
API_PORT="${API_PORT:-3000}"

pass() { echo "  ✅ $*"; }
fail() { echo "  ❌ $*"; }
warn() { echo "  ⚠️  $*"; }
info() { echo "  → $*"; }

echo "========== Diagnóstico SSL — ${DOMAIN} =========="
echo "Data: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo

# 1. Container admin
echo "[1/6] Container admin"
ADMIN=$(docker ps --filter "name=autswot-admin" --format '{{.Names}}' | head -1)
if [ -z "${ADMIN}" ]; then
  ADMIN=$(docker ps --filter "publish=${ADMIN_PORT}" --format '{{.Names}}' | head -1)
fi

if [ -n "${ADMIN}" ]; then
  pass "Container encontrado: ${ADMIN}"
  info "Status: $(docker inspect "${ADMIN}" --format '{{.State.Status}}')"
  info "Portas: $(docker port "${ADMIN}" 2>/dev/null || echo 'nenhuma')"
else
  fail "Nenhum container admin rodando (esperado: autswot-admin ou publish=${ADMIN_PORT})"
  info "Containers com 'admin' no nome:"
  docker ps -a --filter "name=admin" --format '  {{.Names}} — {{.Status}}' || true
fi
echo

# 2. HTTP local (bypass Cloudflare)
echo "[2/6] HTTP local (porta ${ADMIN_PORT} no host)"
if curl -sf --max-time 5 "http://127.0.0.1:${ADMIN_PORT}/" >/dev/null 2>&1; then
  pass "http://127.0.0.1:${ADMIN_PORT}/ responde"
else
  fail "http://127.0.0.1:${ADMIN_PORT}/ não responde — container parado ou porta errada"
fi

if curl -sf --max-time 5 "http://127.0.0.1:${ADMIN_PORT}/api/health" >/dev/null 2>&1; then
  pass "Proxy /api/health responde"
else
  warn "Proxy /api/health falhou — verifique se API está na porta ${API_PORT}"
fi
echo

# 3. Rede coolify
echo "[3/6] Rede Docker coolify"
if docker network inspect coolify >/dev/null 2>&1; then
  pass "Rede coolify existe"
  members=$(docker network inspect coolify --format '{{range .Containers}}{{.Name}} {{end}}' 2>/dev/null || true)
  info "Membros: ${members:-nenhum}"
  if [ -n "${ADMIN}" ] && echo "${members}" | grep -q "${ADMIN}"; then
    pass "${ADMIN} está na rede coolify"
  elif [ -n "${ADMIN}" ]; then
    warn "${ADMIN} NÃO está na rede coolify — rode: sh scripts/setup-coolify-network.sh"
  fi
else
  warn "Rede coolify não existe — rode: sh scripts/setup-coolify-network.sh"
fi
echo

# 4. Certificado origin (Traefik/Coolify)
echo "[4/6] Certificado SSL na origem (porta 443)"
ORIGIN_IP="${ORIGIN_IP:-$(curl -4 -sf --max-time 3 ifconfig.me 2>/dev/null || true)}"
if [ -n "${ORIGIN_IP}" ]; then
  info "IP público da VPS: ${ORIGIN_IP}"
  cert_info=$(echo | openssl s_client -connect "${ORIGIN_IP}:443" -servername "${DOMAIN}" 2>/dev/null \
    | openssl x509 -noout -subject -dates -ext subjectAltName 2>/dev/null || true)
  if [ -n "${cert_info}" ]; then
    pass "Certificado TLS encontrado na origem:"
    echo "${cert_info}" | sed 's/^/    /'
    if echo "${cert_info}" | grep -q "${DOMAIN}\|*.autswot.com"; then
      pass "Certificado cobre ${DOMAIN}"
    else
      fail "Certificado NÃO cobre ${DOMAIN} — configure FQDN no Coolify"
    fi
  else
    fail "Sem certificado TLS válido na origem (${ORIGIN_IP}:443) com SNI ${DOMAIN}"
    info "Causa provável do erro 526: Coolify/Traefik sem cert Let's Encrypt para ${DOMAIN}"
  fi
else
  warn "Não foi possível detectar IP público — defina ORIGIN_IP=xxx.xxx.xxx.xxx"
fi
echo

# 5. Traefik / Coolify proxy
echo "[5/6] Proxy Coolify (Traefik)"
TRAEFIK=$(docker ps --filter "name=traefik" --format '{{.Names}}' | head -1)
if [ -n "${TRAEFIK}" ]; then
  pass "Traefik encontrado: ${TRAEFIK}"
  info "Últimos logs (grep ${DOMAIN}):"
  docker logs "${TRAEFIK}" --tail 100 2>&1 | grep -i "${DOMAIN}\|acme\|certificate\|error" | tail -5 | sed 's/^/    /' || info "    (nenhuma entrada recente)"
else
  warn "Container Traefik não encontrado por nome — Coolify pode usar outro proxy"
fi
echo

# 6. Teste externo via Cloudflare
echo "[6/6] Teste externo (Cloudflare)"
ext_code=$(curl -sS -o /dev/null -w '%{http_code}' --max-time 10 "https://${DOMAIN}/" 2>/dev/null || echo "000")
if [ "${ext_code}" = "200" ]; then
  pass "https://${DOMAIN}/ → HTTP ${ext_code}"
elif [ "${ext_code}" = "526" ]; then
  fail "https://${DOMAIN}/ → HTTP 526 (Invalid SSL certificate — origem)"
  echo
  echo "========== Como corrigir o 526 =========="
  echo "1. Coolify → recurso admin-autswot → Domains:"
  echo "     https://${DOMAIN}"
  echo "2. Porta do container: 80"
  echo "3. Redeploy para gerar certificado Let's Encrypt"
  echo "4. Cloudflare → SSL/TLS → modo 'Full' (ou 'Full strict' se cert origin válido)"
  echo "5. Rode: sh scripts/setup-coolify-network.sh"
else
  warn "https://${DOMAIN}/ → HTTP ${ext_code}"
fi

echo
echo "========== Fim do diagnóstico =========="
