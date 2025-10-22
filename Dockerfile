FROM node:20-alpine AS builder

# Definindo diretório de trabalho
WORKDIR /app

# Instalando o pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copiando os arquivos de configuração de dependências e patches
COPY package.json pnpm-lock.yaml ./
COPY patches/ ./patches/

# Instalando as dependências
RUN pnpm install --frozen-lockfile

# Copiando o restante do código fonte
COPY . .

# Construindo a aplicação
RUN pnpm build

# Criando a imagem final de produção
FROM node:20-alpine AS runner

# Definindo diretório de trabalho
WORKDIR /app

# Instalando o pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copiando os arquivos necessários para a produção
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
COPY --from=builder /app/patches ./patches
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/vite.config.ts ./

# Instalando dependências de produção mais as necessárias para execução
RUN pnpm install --prod --frozen-lockfile && \
    pnpm add @tailwindcss/vite vite vite-plugin-manus-runtime @vitejs/plugin-react

# Expondo a porta (ajuste conforme necessário)
EXPOSE 3000

# Definindo as variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3000

# Criar script de verificação de dependências
RUN echo '#!/bin/sh\nnode -e "console.log(\`Verificando dependências...\`); Promise.all([import(\"vite\"), import(\"@tailwindcss/vite\")]).then(() => { console.log(\`Dependências verificadas com sucesso!\`); process.exit(0); }).catch(err => { console.error(\`Erro ao carregar dependências:\`, err); process.exit(1); });" > /app/check-deps.js'

# Comando para verificar dependências e iniciar a aplicação
CMD node /app/check-deps.js && node dist/index.js
