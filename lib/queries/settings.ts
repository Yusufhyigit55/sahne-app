import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, clearTokens } from "@/lib/api";

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