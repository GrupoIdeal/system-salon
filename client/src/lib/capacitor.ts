export function isNativePlatform(): boolean {
  return false;
}

export function getApiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_URL as string | undefined;
  if (configured) return configured;
  return "";
}
