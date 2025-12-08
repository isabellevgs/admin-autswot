# 🚀 Guia de Deploy - Admin Panel AUTSWOT

## Pré-requisitos

- Docker e Docker Compose instalados na VPS
- Bun instalado localmente (para desenvolvimento)

## 📦 Build Local

```bash
# Build da imagem
docker build -t autswot-admin .

# Testar localmente
docker run -p 8081:80 autswot-admin
```

## 🌐 Deploy na VPS

### 1. Configurar variáveis de ambiente

Edite o arquivo `.env.production` com as URLs corretas da sua API:

```env
VITE_API_URL=https://api.seudominio.com
```

### 2. Fazer build com variáveis de produção

```bash
# Carregar variáveis de produção no build
docker build --build-arg VITE_API_URL=https://api.seudominio.com -t autswot-admin .
```

### 3. Subir com Docker Compose

```bash
# Iniciar
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down

# Rebuild e restart
docker-compose up -d --build
```

## 🔄 Deploy Manual na VPS

### Opção 1: Build local + Push

```bash
# 1. Build local
docker build -t autswot-admin .

# 2. Salvar imagem
docker save autswot-admin | gzip > autswot-admin.tar.gz

# 3. Enviar para VPS
scp autswot-admin.tar.gz user@sua-vps:/home/user/

# 4. Na VPS, carregar imagem
docker load < autswot-admin.tar.gz

# 5. Rodar container
docker run -d -p 3002:80 --name autswot-admin autswot-admin
```

### Opção 2: Build direto na VPS

```bash
# 1. Clonar/copiar código para VPS
git clone seu-repo.git
cd seu-repo/admin-autswat

# 2. Build
docker build -t autswot-admin .

# 3. Rodar
docker run -d -p 3002:80 --name autswot-admin autswot-admin
```

## 🔧 Comandos Úteis

```bash
# Ver containers rodando
docker ps

# Ver logs
docker logs -f autswot-admin

# Entrar no container
docker exec -it autswot-admin sh

# Restart
docker restart autswot-admin

# Remover container
docker rm -f autswot-admin

# Limpar imagens antigas
docker image prune -a
```

## 🌍 Nginx Reverse Proxy (Recomendado)

Se você tiver outros serviços na VPS, use nginx como proxy:

```nginx
# /etc/nginx/sites-available/autswot-admin
server {
    listen 80;
    server_name admin.seudominio.com;

    location / {
        proxy_pass http://localhost:3002;  # Porta do container
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Então rode o container na porta 3002:

```bash
docker run -d -p 3002:80 --name autswot-admin autswot-admin
```

## 🔒 SSL com Let's Encrypt

```bash
# Instalar certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d admin.seudominio.com
```

## 📊 Monitoramento

```bash
# CPU e memória
docker stats autswot-admin

# Health check
docker inspect --format='{{.State.Health.Status}}' autswot-admin
```

## 🔄 Atualização (CI/CD)

### Script de deploy simples

```bash
#!/bin/bash
# deploy.sh

echo "🚀 Iniciando deploy do Admin Panel..."

# Pull do código
git pull origin main

# Build nova imagem
docker build -t autswot-admin:latest .

# Parar container antigo
docker stop autswot-admin
docker rm autswot-admin

# Rodar novo container
docker run -d -p 3002:80 --name autswot-admin autswot-admin:latest

# Limpar imagens antigas
docker image prune -f

echo "✅ Deploy do Admin Panel concluído!"
```

## 🐛 Troubleshooting

### Container não inicia

```bash
docker logs autswot-admin
```

### Porta já em uso

```bash
# Verificar o que está usando a porta
sudo lsof -i :3002

# Matar processo
sudo kill -9 PID
```

## 🔗 Rodando Múltiplos Containers

Para rodar junto com o app principal:

```bash
# App principal na porta 3001
cd ../app-autswot
docker-compose up -d

# Admin panel na porta 3002
cd ../admin-autswat
docker-compose up -d

# API na porta 3000
cd ../api-autswot
docker-compose up -d
```

### Configuração Nginx para múltiplos domínios

```nginx
# App principal
server {
    listen 80;
    server_name autswot.com www.autswot.com;

    location / {
        proxy_pass http://localhost:3001;
    }
}

# Admin panel
server {
    listen 80;
    server_name admin.autswot.com;

    location / {
        proxy_pass http://localhost:3002;
    }
}

# API
server {
    listen 80;
    server_name api.autswot.com;

    location / {
        proxy_pass http://localhost:3000;
    }
}
```

## 📋 Portas Utilizadas

- **3000**: API (Backend)
- **3001**: App Principal (Frontend)
- **3002**: Admin Panel (Frontend)
- **8081**: Admin Panel Dev (Docker Dev)

## 🔐 Variáveis de Ambiente por Ambiente

### Desenvolvimento Local

```env
VITE_API_URL=http://localhost:3000
```

### Produção

```env
VITE_API_URL=https://api.autswot.com
```
