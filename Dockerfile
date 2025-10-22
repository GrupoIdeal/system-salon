FROM node:20-alpine as builder

# Definindo diretório de trabalho
WORKDIR /app

# Instalando o pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copiando os arquivos de configuração de dependências
COPY package.json pnpm-lock.yaml ./

# Instalando as dependências
RUN pnpm install --frozen-lockfile

# Copiando o restante do código fonte
COPY . .

# Construindo a aplicação
RUN pnpm build

# Criando a imagem final de produção
FROM node:20-alpine as runner

# Definindo diretório de trabalho
WORKDIR /app

# Instalando o pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copiando os arquivos necessários para a produção
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./drizzle

# Instalando apenas as dependências de produção
RUN pnpm install --prod --frozen-lockfile

# Expondo a porta (ajuste conforme necessário)
EXPOSE 3000

# Definindo as variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3000

# Comando para iniciar a aplicação
CMD ["node", "dist/index.js"]
