/**
 * Variáveis de ambiente validadas na inicialização.
 * Se uma variável obrigatória estiver ausente, o servidor falha imediatamente
 * em vez de rodar com segredos vazios.
 */

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Variável de ambiente obrigatória não definida: ${key}`);
  }
  return value;
}

export const ENV = Object.freeze({
  appId: process.env.VITE_APP_ID ?? "",
  // Obrigatório: usado para assinar JWT / cookies de sessão
  cookieSecret: requireEnv("JWT_SECRET"),
  // Obrigatório: string de conexão com o banco
  databaseUrl: requireEnv("DATABASE_URL"),
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  // Cloudinary (opcional se não usar upload de imagens)
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME ?? "",
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY ?? "",
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET ?? "",
});
