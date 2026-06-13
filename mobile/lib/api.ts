import { getToken } from "./storage";
import { API_URL } from "./constants";

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export function getBaseUrl(): string {
  return API_URL;
}
