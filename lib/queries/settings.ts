import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, clearTokens, getAccessToken } from "@/lib/api";

export type NotifPrefs = {
  push: boolean;
  email: boolean;
  newEpisode: boolean;
  follows: boolean;
  commentReplies: boolean;
  likes: boolean;
  friendActivity: boolean;
};

export type Settings = {
  username: string;
  displayName: string;
  bio: string;
  location: string;
  avatar: string | null;
  theme: "dark" | "beige";
  language: "tr" | "en";
  isPrivate: boolean;
  activityHidden: boolean;
  statsPublic: boolean;
  notifPrefs: NotifPrefs;
  canChangeUsername: boolean;
  usernameChangeDate: string | null;
};

/** Ayarları getir */
export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data } = await api.get("/api/settings");
      return data.settings as Settings;
    },
  });
}

/** Ayarları güncelle */
export function useUpdateSettings() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (patch: Partial<Settings>) => {
      const { data } = await api.patch("/api/settings", patch);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings"] });
      qc.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

/** Hesabı sil */
export function useDeleteAccount() {
  return useMutation({
    mutationFn: async (password: string) => {
      const { data } = await api.delete("/api/auth/delete-account", {
        data: { password },
      });
      return data;
    },
    onSuccess: async () => {
      await clearTokens();
    },
  });
}

/** Engellenen / sessize alınan kullanıcılar */
export function useBlockedUsers(type: "block" | "mute") {
  return useQuery({
    queryKey: ["blockedUsers", type],
    queryFn: async () => {
      const { data } = await api.get(`/api/social/block?type=${type}`);
      return data.users as {
        id: string;
        username: string;
        displayName: string;
        avatar: string | null;
        blockedAt: string;
      }[];
    },
  });
}
// ---- VERİ AKTARIMI (export / import) ----

export type ImportSource = "letterboxd" | "trakt" | "tracks";

export type ImportReport = {
  added: number;
  skipped: number;
  failed: number;
  total: number;
  skippedItems: { title: string; year?: number | null; reason: string }[];
};

/**
 * Kullanıcının tüm verisini JSON string olarak indirir.
 * axios yerine fetch kullanıyoruz çünkü endpoint dosya (attachment) döndürüyor
 * ve ham metni almak istiyoruz.
 */
export function useExportData() {
  return useMutation({
    mutationFn: async (): Promise<{ json: string; filename: string }> => {
      const token = await getAccessToken();
      const res = await fetch(
        "https://sahne-api.vercel.app/api/user/export",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) {
        throw new Error("Dışa aktarma başarısız");
      }
      const json = await res.text();
      const filename = `tracks-verilerim-${new Date()
        .toISOString()
        .slice(0, 10)}.json`;
      return { json, filename };
    },
  });
}

/** Dosya içeriğini ve kaynağı gönderip içe aktarır. */
export function useImportData() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (args: {
      source: ImportSource;
      data: string;
    }): Promise<ImportReport> => {
      const { data } = await api.post("/api/user/import", args);
      return data.report as ImportReport;
    },
    onSuccess: () => {
      // İçe aktarma sonrası kütüphane/istatistikler değişmiş olabilir
      qc.invalidateQueries({ queryKey: ["library"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      qc.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}