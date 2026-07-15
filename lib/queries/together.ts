import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type TogetherItem = {
  type: "series" | "movie";
  tmdbId: number;
  titleTr: string;
  poster: string | null;
  year: string | null;
  tmdbRating: number | null;
  reason: string;
};

export type TogetherData = {
  ok: boolean;
  other: {
    username: string;
    displayName: string;
    avatar: string | null;
  };
  shared: TogetherItem[];
  recommendations: TogetherItem[];
  commonGenres: string[];
};

export function useTogether(username: string) {
  return useQuery({
    queryKey: ["together", username],
    queryFn: async () => {
      const { data } = await api.get(
        `/api/together/${encodeURIComponent(username)}`
      );
      return data as TogetherData;
    },
    enabled: !!username,
    staleTime: 1000 * 60 * 10,
  });
}