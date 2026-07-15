import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type RecReason =
  | "similar_users"
  | "genre_match"
  | "tmdb_similar"
  | "same_cast"
  | "popular";

export type Recommendation = {
  type: "series" | "movie";
  tmdbId: number;
  titleTr: string;
  poster: string | null;
  year: string | null;
  tmdbRating: number | null;
  score: number;
  reasons: { key: RecReason; text: string }[];
};

/** Kişiselleştirilmiş öneriler */
export function useRecommendations() {
  return useQuery({
    queryKey: ["recommendations"],
    queryFn: async () => {
      const { data } = await api.get("/api/recommend");
      return data.items as Recommendation[];
    },
    staleTime: 1000 * 60 * 15,
  });
}

/** Öneriyi gizle */
export function useDismissRec() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (vars: { type: string; tmdbId: number }) => {
      const { data } = await api.post("/api/recommend", vars);
      return data;
    },
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: ["recommendations"] });

      const prev = qc.getQueryData(["recommendations"]);

      // Anında listeden çıkar
      qc.setQueryData(["recommendations"], (old: any) => {
        if (!Array.isArray(old)) return old;
        return old.filter(
          (r: Recommendation) =>
            !(r.type === vars.type && r.tmdbId === vars.tmdbId)
        );
      });

      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["recommendations"], ctx.prev);
    },
  });
}