import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter, publicRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { ENV } from "./env";
import { createLogger } from "./logger";

const logger = createLogger("core");

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Helmet para segurança de headers HTTP
  app.use(
    helmet({
      contentSecurityPolicy: ENV.isProduction ? undefined : false,
      crossOriginEmbedderPolicy: false,
    })
  );

  // Rate limiting para rotas públicas
  const publicLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Limite de 100 requisições por IP
    message: "Muitas requisições deste IP, tente novamente mais tarde",
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Rate limiting específico para autenticação (mais restritivo)
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10, // 10 tentativas por 15 min por IP
    message: "Muitas tentativas de autenticação, tente novamente em 15 minutos",
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
  });

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "10mb" })); // Reduzido de 50mb para 10mb
  app.use(express.urlencoded({ limit: "10mb", extended: true }));
  // Health check endpoint (independente de tRPC)
  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

  // Middleware CORS reutilizável para ambos os endpoints tRPC
  const allowedOrigins = ENV.isProduction
    ? [ENV.frontendUrl].filter(Boolean)
    : [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8081",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8081",
      ];

  function corsMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
    const origin = req.headers.origin;
    if (origin) {
      if (!ENV.isProduction) {
        res.header("Access-Control-Allow-Origin", origin);
      } else if (allowedOrigins.includes(origin)) {
        res.header("Access-Control-Allow-Origin", origin);
      }
      res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Length, X-Requested-With");
      res.header("Access-Control-Allow-Credentials", "true");
    }
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
    } else {
      next();
    }
  }

  // tRPC API protegida
  app.use(
    "/api/trpc",
    corsMiddleware,
    (req, _res, next) => {
      // Aplicar rate limiter mais restritivo para rotas de autenticação
      const url = req.url || "";
      const path = new URL(url, "http://localhost").pathname;
      if (path.endsWith("auth.login") || path.endsWith("auth.register")) {
        return authLimiter(req, _res, next);
      }
      return next();
    },
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // tRPC API pública com CORS + rate limiting
  app.use(
    "/api/public",
    corsMiddleware,
    publicLimiter,
    createExpressMiddleware({
      router: publicRouter,
      createContext: createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000"); // process.env.PORT é exceção — vem do Docker
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort && !ENV.isProduction) {
    logger.warn(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    if (!ENV.isProduction) {
      logger.info(`Servidor em execução: http://localhost:${port}/`);
    }
  });
}

startServer().catch(err => logger.error("startup failed", err));
