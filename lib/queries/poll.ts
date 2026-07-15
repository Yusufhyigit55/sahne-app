// lib/queries/poll.ts : Anket listeleme, oluşturma, oy verme ve silme için TanStack Query hook'ları.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type PollType = "single" | "multiple" | "yesno" | "prediction";

export type PollOption = {
  id: string;
  text: string;
  voteCount: number;
  percent: number | null; // oy vermeden null
};

export type Poll = {
  id: string;
  question: string;
  type: PollType;
  isSpoiler: boolean;
  isClosed: boolean;
  season: number | null;
  episode: number | null;
  totalVotes: number;
  createdAt: string;
  creatorId: string;
  options: PollOption[];
  myOptionIds: string[] | null;
  hasVoted: boolean;
};

export const POLL_TYPE_LABELS: Record<PollType, string> = {
  single: "Tek seçim",
  multiple: "Çok seçim",
  yesno: "Evet / Hayır",
  prediction: "Tahmin",
};

/** İçeriğe ait anketleri getirir. */
export function usePolls(type: string, tmdbId: number | string, enabled = true) {
  return useQuery({
    queryKey: ["polls", type, tmdbId],
    queryFn: async () => {
      const { data } = await api.get(
        `/api/poll?type=${type}&tmdbId=${tmdbId}`
      );
      return data.polls as Poll[];
    },
    enabled: enabled && !!tmdbId,
  });
}

/** Yeni anket oluşturur. */
export function useCreatePoll(type: string, tmdbId: number | string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (vars: {
      question: string;
      pollType: PollType;
      options: string[];
      isSpoiler: boolean;
      season?: number | null;
      episode?: number | null;
    }) => {
      const { data } = await api.post("/api/poll", {
        type,
        tmdbId,
        ...vars,
      });
      return data.poll as Poll;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["polls", type, tmdbId] });
    },
  });
}

/** Ankete oy verir / oyu değiştirir / geri çeker. */
export function useVotePoll(type: string, tmdbId: number | string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (vars: { pollId: string; optionIds: string[] }) => {
      const { data } = await api.post(`/api/poll/${vars.pollId}/vote`, {
        optionIds: vars.optionIds,
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["polls", type, tmdbId] });
    },
  });
}

/** Anketi siler. */
export function useDeletePoll(type: string, tmdbId: number | string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (pollId: string) => {
      const { data } = await api.delete(`/api/poll/${pollId}`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["polls", type, tmdbId] });
    },
  });
}