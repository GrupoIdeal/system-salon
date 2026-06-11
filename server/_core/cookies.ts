import type { CookieOptions, Request } from "express";
import { ENV } from "./env";

export function getSessionCookieOptions(
  _req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  const isProd = ENV.isProduction;

  const domain = (() => {
    if (!isProd) return undefined;
    const frontend = ENV.frontendUrl;
    if (!frontend) return undefined;
    try {
      return new URL(frontend).hostname;
    } catch {
      return undefined;
    }
  })();

  return {
    httpOnly: isProd ? true : false,
    path: "/",
    sameSite: isProd ? "lax" : "lax",
    secure: isProd ? true : false,
    domain,
  };
}
