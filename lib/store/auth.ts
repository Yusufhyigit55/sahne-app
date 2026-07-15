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
  }) => Promise<void>;
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