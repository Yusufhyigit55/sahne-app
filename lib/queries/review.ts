import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const REACTIONS = [
  { key: "laughed", emoji: "😂", label: "Güldüm" },
  { key: "cried", emoji: "😭", label: "Ağladım" },
  { key: "shocked", emoji: "😱", label: "Şok oldum" },
  { key: "angry", emoji: "😡", label: "Sinirlendim" },
  { key: "scared", emoji: "😨", label: "Korktum" },
  { key: "tense", emoji: "😬", label: "Gerildim" },
  { key: "confused", emoji: "🤔", label: "Kafam karıştı" },
  { key: "bored", emoji: "😴", label: "Sıkıldım" },
  { key: "excited", emoji: "🤩", label: "Heyecanlandım" },
  { key: "moved", emoji: "🥹", label: "Duygulandım" },
] as const;

export type EpisodeReview = {
  score: number | null;
  reactions: string[];
  favoriteCharacterId: number | null;
};

/** Bölümün değerlendirmesi + topluluk sonuçları */
export function useEpisodeReview(
  tmdbId: number,
  season: number,
  episode: number,
  enabled = true
) {
  return useQuery({
    queryKey: ["episodeReview", tmdbId, season, episode],
    queryFn: async () => {
      const { data } = await api.get(
        `/api/reaction?tmdbId=${tmdbId}&season=${season}&episode=${episode}`
      );
      return data as {
        myReview: EpisodeReview | null;
        avgScore: number | null;
        totalReviews: number;
        reactionStats: Record<string, { count: number; percent: number }>;
        characterStats: {
          characterId: number;
          count: number;
          percent: number;
        }[];
      };
    },
    enabled: enabled && !!tmdbId && !!episode,
  });
}

/** Bölüm değerlendirmesi kaydet */
export function useSaveReview(tmdbId: number) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (vars: {
      season: number;
      episode: number;
      score?: number | null;
      reactions?: string[];
      favoriteCharacterId?: number | null;
    }) => {
      const { data } = await api.post("/api/reaction", { tmdbId, ...vars });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["episodeReview"] });
    },
  });
}

/** Dizi/film geneli favori karakter */
export function useCharacterVote(type: string, tmdbId: number) {
  return useQuery({
    queryKey: ["characterVote", type, tmdbId],
    queryFn: async () => {
      const { data } = await api.get(
        `/api/character-vote?type=${type}&tmdbId=${tmdbId}`
      );
      return data as {
        myVote: number | null;
        stats: {
          characterId: number;
          characterName: string;
          actorName: string;
          count: number;
          percent: number;
        }[];
        totalVotes: number;
      };
    },
    enabled: !!tmdbId,
  });
}

/** Favori karakter oyu ver */
export function useVoteCharacter(type: string, tmdbId: number) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (vars: {
      characterId: number;
      characterName?: string;
      actorName?: string;
    }) => {
      const { data } = await api.post("/api/character-vote", {
        type,
        tmdbId,
        ...vars,
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["characterVote"] });
    },
  });
}