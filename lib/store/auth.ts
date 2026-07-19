import { create } from "zustand";
import { api, saveTokens, clearTokens, getAccessToken } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";

export type User = {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatar: string | null;
  onboarded: boolean;
  role: "user" | "moderator" | "admin";
  theme: "dark" | "beige";
  language: "tr" | "en";
};

type AuthState = {
  user: User | null;
  isAuthed: boolean;
  isLoading: boolean;

  login: (emailOrUsername: string, password: string) => Promise<void>;
  register: (payload: {
    email: string;
    username: string;
    displayName: string;
    password: string;
    birthDate?: string;
    gender?: "male" | "female" | "unspecified";
    acceptedTerms: boolean;
    acceptedPrivacy: boolean;
  }) => Promise<{ requiresVerification: boolean; email: string }>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  resendCode: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (
    email: string,
    code: string,
    newPassword: string
  ) => Promise<void>;
  appleLogin: (
    identityToken: string,
    fullName?: { givenName?: string | null; familyName?: string | null } | null
  ) => Promise<void>;
  googleLogin: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  loadSession: () => Promise<void>;
  setUser: (user: User) => void;
};

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isAuthed: false,
  isLoading: true,

  login: async (emailOrUsername, password) => {
    const { data } = await api.post("/api/auth/login", {
      emailOrUsername,
      password,
    });

    await saveTokens(data.accessToken, data.refreshToken);

    // Önceki kullanıcının verisi kalmasın
    queryClient.clear();

    set({ user: data.user, isAuthed: true, isLoading: false });
  },

  register: async (payload) => {
    const { data } = await api.post("/api/auth/register", payload);
    // Token gelmiyor — önce e-posta doğrulanmalı
    return {
      requiresVerification: data.requiresVerification ?? true,
      email: data.email ?? payload.email,
    };
  },
  verifyEmail: async (email, code) => {
    const { data } = await api.post("/api/auth/verify-email", { email, code });
    await saveTokens(data.accessToken, data.refreshToken);
    queryClient.clear();
    set({ user: data.user, isAuthed: true, isLoading: false });
  },
  resendCode: async (email) => {
    await api.post("/api/auth/resend-code", { email });
  },
  forgotPassword: async (email) => {
    await api.post("/api/auth/forgot-password", { email });
  },
  resetPassword: async (email, code, newPassword) => {
    await api.post("/api/auth/reset-password", { email, code, newPassword });
  },
  appleLogin: async (identityToken, fullName) => {
    const { data } = await api.post("/api/auth/apple", {
      identityToken,
      fullName,
    });
    await saveTokens(data.accessToken, data.refreshToken);
    queryClient.clear();
    set({ user: data.user, isAuthed: true, isLoading: false });
  },
  googleLogin: async (idToken) => {
    const { data } = await api.post("/api/auth/google", { idToken });
    await saveTokens(data.accessToken, data.refreshToken);
    queryClient.clear();
    set({ user: data.user, isAuthed: true, isLoading: false });
  },
  logout: async () => {
    await clearTokens();

    // Tüm önbelleği temizle
    queryClient.clear();

    set({ user: null, isAuthed: false, isLoading: false });
  },

  /**
   * Uygulama açılışında oturumu geri yükle.
   * Ağ hatasında oturumu KORUR — sadece 401'de çıkış yapar.
   */
  loadSession: async () => {
    try {
      const token = await getAccessToken();

      if (!token) {
        set({ user: null, isAuthed: false, isLoading: false });
        return;
      }

      const { data } = await api.get("/api/auth/me");

      set({ user: data.user, isAuthed: true, isLoading: false });
    } catch (err: any) {
      // 401 = token geçersiz → çıkış
      if (err?.response?.status === 401) {
        await clearTokens();
        queryClient.clear();
        set({ user: null, isAuthed: false, isLoading: false });
        return;
      }

      // Ağ hatası → oturumu koru, sadece yüklemeyi bitir
      set({ isLoading: false });
    }
  },

  setUser: (user) => set({ user }),
}));