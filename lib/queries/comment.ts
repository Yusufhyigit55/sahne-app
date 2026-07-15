import {
  useMutation,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { api } from "@/lib/api";

export type CommentUser = {
  id: string;
  username: string;
  displayName: string;
  avatar: string | null;
};

export type Comment = {
  id: string;
  user: CommentUser;
  body: string | null;
  gifUrl: string | null;
  isSpoiler: boolean;
  isHidden: boolean;
  hasWatched: boolean;
  likeCount: number;
  dislikeCount: number;
  replyCount: number;
  parentId: string | null;
  mentionedUser: { username: string; displayName: string } | null;
  isDeleted: boolean;
  editedAt: string | null;
  createdAt: string;
  myVote: number;
};

export type CommentTarget = "series" | "movie" | "book" | "episode";
export type SortMode = "popular" | "new";

type Params = {
  targetType: CommentTarget;
  contentId: string | number;
  season?: number;
  episode?: number;
  sort?: SortMode;
};

/** Yorumları listele */
export function useComments(p: Params) {
  const qs = new URLSearchParams({
    targetType: p.targetType,
    contentId: String(p.contentId),
    sort: p.sort ?? "popular",
  });

  if (p.season != null) qs.set("season", String(p.season));
  if (p.episode != null) qs.set("episode", String(p.episode));

  return useQuery({
    queryKey: [
      "comments",
      p.targetType,
      String(p.contentId),
      p.season,
      p.episode,
      p.sort,
    ],
    queryFn: async () => {
      const { data } = await api.get(`/api/comment?${qs.toString()}`);
      return data as {
        comments: Comment[];
        total: number;
        totalWithReplies: number;
        hasMore: boolean;
        viewerWatched: boolean;
      };
    },
    enabled: !!p.contentId,
  });
}

/** Bir yorumun yanıtları */
export function useReplies(commentId: string, enabled = false) {
  return useQuery({
    queryKey: ["replies", commentId],
    queryFn: async () => {
      const { data } = await api.get(`/api/comment/${commentId}`);
      return data.replies as Comment[];
    },
    enabled,
  });
}

/** Yorum yaz */
export function useCreateComment(p: Params) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (vars: {
      body: string;
      isSpoiler: boolean;
      gifUrl?: string;
      parentId?: string;
    }) => {
      const { data } = await api.post("/api/comment", {
        targetType: p.targetType,
        contentId: p.contentId,
        season: p.season,
        episode: p.episode,
        ...vars,
      });
      return data.comment as Comment;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["comments"] });
      if (vars.parentId) {
        qc.invalidateQueries({ queryKey: ["replies", vars.parentId] });
      }
    },
  });
}

/** Yorum beğen / beğenme */
export function useVoteComment() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (vars: { commentId: string; value: 1 | -1 }) => {
      const { data } = await api.post(`/api/comment/${vars.commentId}/vote`, {
        value: vars.value,
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["comments"] });
      qc.invalidateQueries({ queryKey: ["replies"] });
    },
  });
}

/** Yorumu şikayet et */
export function useReportComment() {
  return useMutation({
    mutationFn: async (vars: {
      commentId: string;
      reason: string;
      note?: string;
    }) => {
      const { data } = await api.post(`/api/comment/${vars.commentId}/report`, {
        reason: vars.reason,
        note: vars.note,
      });
      return data;
    },
  });
}

/** Yorumu sil */
export function useDeleteComment() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: string) => {
      const { data } = await api.delete(`/api/comment/${commentId}`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["comments"] });
      qc.invalidateQueries({ queryKey: ["replies"] });
    },
  });
}