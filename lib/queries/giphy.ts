// lib/queries/giphy.ts : GIF arama/trend sonuçlarını getiren hook (arama boşken trend döner).
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type GiphyGif = {
  id: string;
  url: string;
  previewUrl: string;
  width: number;
  height: number;
};

/** GIF ara. query boşsa trend GIF'ler gelir. */
export function useGifSearch(query: string) {
  return useQuery({
    queryKey: ["giphy", query],
    queryFn: async () => {
      const qs = query.trim() ? `?q=${encodeURIComponent(query.trim())}` : "";
      const { data } = await api.get(`/api/giphy${qs}`);
      return data.gifs as GiphyGif[];
    },
    staleTime: 1000 * 60 * 5, // 5 dk
  });
}