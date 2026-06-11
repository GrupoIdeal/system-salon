import * as SecureStore from "expo-secure-store";
import { STORAGE_KEYS } from "./constants";

export async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(STORAGE_KEYS.SESSION_TOKEN);
  } catch {
    return null;
  }
}

export async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(STORAGE_KEYS.SESSION_TOKEN, token);
}

export async function removeToken(): Promise<void> {
  await SecureStore.deleteItemAsync(STORAGE_KEYS.SESSION_TOKEN);
}

export async function getItem<T = string>(key: string): Promise<T | null> {
  try {
    const value = await SecureStore.getItemAsync(key);
    if (value === null) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  } catch {
    return null;
  }
}

export async function setItem(key: string, value: string): Promise<void> {
  await SecureStore.setItemAsync(key, value);
}

export async function removeItem(key: string): Promise<void> {
  await SecureStore.deleteItemAsync(key);
}

export async function clearAll(): Promise<void> {
  await Promise.all(
    Object.values(STORAGE_KEYS).map((key) =>
      SecureStore.deleteItemAsync(key).catch(() => {})
    )
  );
}
