// lib/queries/admin.ts : Moderatör paneli için şikayet listeleme, moderasyon kararı ve ban yönetimi hook'ları.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const BAN_REASONS = [
  { key: "unmarked_spoiler", label: "İşaretlenmemiş spoiler" },
  { key: "harassment", label: "Taciz" },
  { key: "spam", label: "Spam" },
  { key: "inappropriate", label: "Uygunsuz içerik" },
  { key: "targeting", label: "Hedef gösterme" },
] as const;

export const REASON_LABELS: Record<string, string> = Object.fromEntries(
  BAN_REASONS.map((r) => [r.key, r.label])
);

export type ReportItem = {
  id: string;
  reason: string;
  note: string | null;
  status: string;
  createdAt: string;
  reporter: { id: string; username: string };
  comment: {
    id: string;
    body: string;
    isSpoiler: boolean;
    spoilerPending: boolean;
    createdAt: string;
    author: {
      id: string;
      username: string;
      displayName: string;
      previousBans: number;
    };
  } | null;
};

export type BanItem = {
  id: string;
  user: { id: string; username: string; displayName: string };
  reason: string;
  banCount: number;
  durationDays: number | null;
  expiresAt: string | null;
  isExpired: boolean;
  moderator: string;
  createdAt: string;
};

/** Bekleyen şikayetleri getirir. */
export function useReports(status = "pending") {
  return useQuery({
    queryKey: ["adminReports", status],
    queryFn: async () => {
      const { data } = await api.get(`/api/admin/reports?status=${status}`);
      return data.reports as ReportItem[];
    },
  });
}

/** Moderasyon kararı: mark_spoiler | delete | dismiss */
export function useModerate() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (vars: {
      commentId: string;
      action: "mark_spoiler" | "delete" | "dismiss";
      reason?: string;
      applyPenalty?: boolean;
    }) => {
      const { commentId, ...body } = vars;
      const { data } = await api.post(`/api/admin/comment/${commentId}`, body);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminReports"] });
      qc.invalidateQueries({ queryKey: ["adminBans"] });
    },
  });
}

/** Aktif ban'ları getirir. */
export function useBans() {
  return useQuery({
    queryKey: ["adminBans"],
    queryFn: async () => {
      const { data } = await api.get("/api/admin/ban");
      return data.bans as BanItem[];
    },
  });
}

/** Ban'ı kaldırır. */
export function useLiftBan() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (banId: string) => {
      const { data } = await api.delete("/api/admin/ban", { data: { banId } });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminBans"] });
    },
  });
}