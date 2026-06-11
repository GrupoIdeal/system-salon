import { getToken } from "./storage";

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export function getBaseUrl(): string {
  const { API_URL } = require("./constants");
  return API_URL;
}
