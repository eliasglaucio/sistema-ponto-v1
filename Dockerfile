# ============================================
# Estágio 1: Estágio de Instalação de Dependências
# ============================================

# IMPORTANTE: Manutenção da versão do Node.js
# Este Dockerfile usa Node.js 24.13.0-slim, que era a versão LTS mais recente no momento da escrita.
# Para garantir segurança e compatibilidade, atualize regularmente o ARG NODE_VERSION para a versão LTS mais recente.
ARG NODE_VERSION=24.13.0-slim

FROM node:${NODE_VERSION} AS dependencies

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos relacionados ao package primeiro para aproveitar o mecanismo de cache do Docker
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* ./

# Instala as dependências do projeto com lockfile congelado para builds reproduzíveis
RUN --mount=type=cache,target=/root/.npm \
    --mount=type=cache,target=/usr/local/share/.cache/yarn \
    --mount=type=cache,target=/root/.local/share/pnpm/store \
  if [ -f package-lock.json ]; then \
    npm ci --no-audit --no-fund; \
  elif [ -f yarn.lock ]; then \
    corepack enable yarn && yarn install --frozen-lockfile --production=false; \
  elif [ -f pnpm-lock.yaml ]; then \
    corepack enable pnpm && pnpm install --frozen-lockfile; \
  else \
    echo "Nenhum arquivo de lock encontrado." && exit 1; \
  fi

# ============================================
# Estágio 2: Build da aplicação Next.js no modo standalone
# ============================================

FROM node:${NODE_VERSION} AS builder

# Define o diretório de trabalho
WORKDIR /app

# Copia as dependências do projeto a partir do estágio dependencies
COPY --from=dependencies /app/node_modules ./node_modules

# Copia o código-fonte da aplicação
COPY . .

ENV NODE_ENV=production

# O Next.js coleta dados telemétricos anônimos sobre o uso geral.
# Saiba mais aqui: https://nextjs.org/telemetry
# Descomente a linha abaixo caso queira desabilitar a telemetria durante o build.
ENV NEXT_TELEMETRY_DISABLED=1

# Executa o build da aplicação Next.js
# Se quiser acelerar os rebuilds do Docker, você pode armazenar em cache os artefatos do build
# adicionando: --mount=type=cache,target=/app/.next/cache
# Isso armazena em cache o diretório .next/cache entre os builds, mas também impede
# que .next/cache/fetch-cache seja incluído na imagem final, significando que
# respostas de fetch em cache do build não estarão disponíveis em tempo de execução.
RUN if [ -f package-lock.json ]; then \
    npm run build; \
  elif [ -f yarn.lock ]; then \
    corepack enable yarn && yarn build; \
  elif [ -f pnpm-lock.yaml ]; then \
    corepack enable pnpm && pnpm build; \
  else \
    echo "Nenhum arquivo de lock encontrado." && exit 1; \
  fi

# ============================================
# Estágio 3: Execução da aplicação Next.js
# ============================================

FROM node:${NODE_VERSION} AS runner

# Define o diretório de trabalho
WORKDIR /app

# Define variáveis de ambiente de produção
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# O Next.js coleta dados telemétricos anônimos sobre o uso geral.
# Saiba mais aqui: https://nextjs.org/telemetry
# Descomente a linha abaixo caso queira desabilitar a telemetria durante a execução.
ENV NEXT_TELEMETRY_DISABLED=1

# Copia os assets de produção
COPY --from=builder --chown=node:node /app/public ./public

# Define a permissão correta para o cache de pré-renderização
RUN mkdir .next
RUN chown node:node .next

# Aproveita automaticamente os traces de saída para reduzir o tamanho da imagem
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

# Se você quiser persistir o cache de fetch gerado durante o build para que
# respostas em cache estejam disponíveis imediatamente na inicialização, descomente esta linha:
# COPY --from=builder --chown=node:node /app/.next/cache ./.next/cache

# Muda para usuário não-root para boas práticas de segurança
USER node

# Expõe a porta 3000 para permitir tráfego HTTP
EXPOSE 3000

# Inicia o servidor standalone do Next.js
CMD ["node", "server.js"]