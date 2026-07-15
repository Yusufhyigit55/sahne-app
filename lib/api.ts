import axios from "axios";
import * as SecureStore from "expo-secure-store";

// Geliştirme: Mac'in yerel IP'si. Yayında Vercel adresi olacak.
const BASE_URL = "http://192.168.1.44:3000";

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

const ACCESS_KEY = "sahne_access_token";
const REFRESH_KEY = "sahne_refresh_token";

export async function saveTokens(access: string, refresh: string) {
  await SecureStore.setItemAsync(ACCESS_KEY, access);
  await SecureStore.setItemAsync(REFRESH_KEY, refresh);
}

export async function getAccessToken() {
  return SecureStore.getItemAsync(ACCESS_KEY);
}

export async function clearTokens() {
  await SecureStore.deleteItemAsync(ACCESS_KEY);
  await SecureStore.deleteItemAsync(REFRESH_KEY);
}

// Her isteğe token ekle
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(ACCESS_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 gelirse token'ı yenile ve isteği tekrarla
let refreshing = false;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry && !refreshing) {
      original._retry = true;
      refreshing = true;

      try {
        const refreshToken = await SecureStore.getItemAsync(REFRESH_KEY);
        if (!refreshToken) throw new Error("no refresh token");

        const { data } = await axios.post(`${BASE_URL}/api/auth/refresh`, {
          refreshToken,
        });

        await saveTokens(data.accessToken, data.refreshToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        refreshing = false;

        return api(original);
      } catch {
        refreshing = false;
        await clearTokens();
      }
    }

    return Promise.reject(error);
  }
);

/** Hata mesajını okunabilir hale getirir. */
export function apiError(err: any): string {
  return (
    err?.response?.data?.error ??
    err?.message ??
    "Bir şeyler ters gitti"
  );
}