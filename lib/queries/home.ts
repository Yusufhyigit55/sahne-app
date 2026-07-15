import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type ContinueItem = {
  tmdbId: number;
  titleTr: string;
  poster: string | null;
  season: number;
  episode: number;
  episodeName: string;
  runtime: number | null;
  watchedEpisodes: number;
  totalEpisodes: number;
  progress: number;
};

/** İzlemeye Devam Et kartları */
export function useContinueWatching() {
  return useQuery({
    queryKey: ["continueWatching"],
    queryFn: async () => {
      const { data } = await api.get("/api/home/continue");
      return data.items as ContinueItem[];
    },
  });
}