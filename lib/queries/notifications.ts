import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type NotifType =
  | "follow"
  | "follow_request"
  | "follow_accepted"
  | "comment_reply"
  | "comment_like"
  | "new_episode"
  | "friend_watched"
  | "friend_commented"
  | "poll_result"
  | "ban"
  | "spoiler_flagged";

export type NotifActor = {
  id: string;
  username: string;
  displayName: string;
  avatar: string | null;
};

export type NotifContent = {
  type: "series" | "movie" | "book";
  id: string | number;
  titleTr: string;
  poster: string | null;
};

export type Notification = {
  id: string;
  type: NotifType;
  message: string;
  isRead: boolean;
  createdAt: string;
  actor: NotifActor | null;
  content: NotifContent | null;
  commentId: string | null;
  season: number | null;
  episode: number | null;
};

/** Bildirim listesi */
export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data } = await api.get("/api/notifications");
      return data as {
        items: Notification[];
        total: number;
        unreadCount: number;
        hasMore: boolean;
      };
    },
  });
}

/** Okundu işaretle — id verilmezse tümü */
export function useMarkRead() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId?: string) => {
      const { data } = await api.patch("/api/notifications", {
        notificationId,
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

/** Bildirim sil — id verilmezse tümü */
export function useDeleteNotification() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId?: string) => {
      const { data } = await api.delete("/api/notifications", {
        data: { notificationId },
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}