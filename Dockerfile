# Dockerfile multi-stage para produção otimizada com Bun

# Stage 1: Build
FROM oven/bun:1 AS builder

WORKDIR /app

# Build args
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Copiar arquivos de dependências
COPY package.json bun.lockb* ./

# Instalar dependências
RUN bun install --frozen-lockfile

# Copiar código fonte
COPY . .

# Build da aplicação
RUN bun run build

# Stage 2: Production
FROM nginx:alpine

# Copiar build do stage anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuração customizada do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Script de verificação pós-deploy (logs de DNS + /health da API)
COPY scripts/docker-entrypoint.sh /docker-entrypoint-autswot.sh
RUN chmod +x /docker-entrypoint-autswot.sh

ENV AUTSWOT_SERVICE=autswot-admin
ENV API_UPSTREAM_HOST=host.docker.internal
ENV API_UPSTREAM_PORT=3000

# Expor porta 80
EXPOSE 80

CMD ["/docker-entrypoint-autswot.sh"]
