import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type LibraryTab = "watched" | "watchlist" | "favorites";

export type LibraryStatus =
  | "all"
  | "watching"
  | "up_to_date"
  | "completed"
  | "paused"
  | "dropped"
  | "reading";

export type LibraryType = "all" | "series" | "movie" | "book";

export type LibraryItem = {
  type: "series" | "movie" | "book";
  id: string | number;
  titleTr: string;
  poster: string | null;
  year: number | null;
  status: string;
  rating: number | null;
  isFavorite: boolean;
  isHidden: boolean;
  watchedEpisodes: number;
  totalEpisodes: number;
  progress: number;
  updatedAt: string;
};

export const STATUS_LABELS: Record<string, string> = {
  all: "Tümü",
  watching: "İzliyor",
  up_to_date: "Güncel",
  completed: "Tamamlandı",
  paused: "Askıda",
  dropped: "Yarım Bıraktı",
  reading: "Okuyor",
  watchlist: "İzleme Listesi",
};

export const TYPE_LABELS: Record<string, string> = {
  all: "Tümü",
  series: "Dizi",
  movie: "Film",
  book: "Kitap",
};

export function useLibrary(
  username: string,
  tab: LibraryTab,
  status: LibraryStatus = "all",
  type: LibraryType = "all"
) {
  return useQuery({
    queryKey: ["library", username, tab, status, type],
    queryFn: async () => {
      const qs = new URLSearchParams({
        username,
        tab,
        status,
        type,
      });

      const { data } = await api.get(`/api/library?${qs.toString()}`);
      return data as {
        items: LibraryItem[];
        statusCounts: Record<string, number>;
        total: number;
        hasMore: boolean;
      };
    },
    enabled: !!username,
  });
}