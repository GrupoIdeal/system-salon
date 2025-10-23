import type { CookieOptions, Request } from "express";

export function getSessionCookieOptions(
  _req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  // Em desenvolvimento, usamos configurações menos restritivas para facilitar o debug
  return {
    httpOnly: false, // Permitir acesso via JavaScript em desenvolvimento
    path: "/",
    sameSite: "lax",
    secure: false, // Definido como false para desenvolvimento em localhost
  };
}
