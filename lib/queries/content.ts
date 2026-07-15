import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type ContentType = "series" | "movie" | "book";
export type SearchType = ContentType | "person";

export type ContentItem = {
  type: ContentType;
  tmdbId?: number;
  googleBooksId?: string;
  titleTr: string;
  titleOriginal?: string;
  poster: string | null;
  year: string | null;
  tmdbRating?: number | null;
  authors?: string[];
  overview?: string;
};

export type PersonItem = {
  type: "person";
  tmdbId: number;
  name: string;
  photo: string | null;
};

/** Trend içerikler — Keşfet'in varsayılan görünümü */
export function useTrending(type: ContentType) {
  return useQuery({
    queryKey: ["trending", type],
    queryFn: async () => {
      const { data } = await api.get(`/api/content/trending?type=${type}`);
      return data.results as ContentItem[];
    },
    staleTime: 1000 * 60 * 30,
  });
}

/** İçerik arama */
export function useSearch(query: string, type: SearchType) {
  return useQuery({
    queryKey: ["search", type, query],
    queryFn: async () => {
      const { data } = await api.get(
        `/api/content/search?q=${encodeURIComponent(query)}&type=${type}`
      );
      return data.results as (ContentItem | PersonItem)[];
    },
    enabled: query.trim().length >= 2,
    staleTime: 1000 * 60 * 5,
  });
}

/** İçerik detayı — 30 dk önbellekli, gereksiz çağrı yok */
export function useContentDetail(type: ContentType, id: string | number) {
  return useQuery({
    queryKey: ["content", type, String(id)],
    queryFn: async () => {
      const { data } = await api.get(`/api/content/${type}/${id}`);
      return data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 30,
  });
}

/** Sezonun bölümleri */
export function useSeason(tmdbId: number, seasonNumber: number) {
  return useQuery({
    queryKey: ["season", tmdbId, seasonNumber],
    queryFn: async () => {
      const { data } = await api.get(
        `/api/content/series/${tmdbId}/season/${seasonNumber}`
      );
      return data;
    },
    enabled: !!tmdbId && seasonNumber > 0,
  });
}

/** Oyuncu sayfası */
export function usePerson(id: number) {
  return useQuery({
    queryKey: ["person", id],
    queryFn: async () => {
      const { data } = await api.get(`/api/person/${id}`);
      return data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 60,
  });
}