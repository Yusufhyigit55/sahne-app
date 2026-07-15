// lib/queries/calendar.ts : Yaklaşan bölümleri getiren hook; tarih formatlama yardımcısıyla.
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type UpcomingEpisode = {
  tmdbId: number;
  title: string;
  poster: string | null;
  season: number;
  episode: number;
  episodeName: string | null;
  airDate: string; // "2026-07-21"
};

/** Kullanıcının yaklaşan bölümleri (tarihe göre sıralı). */
export function useCalendar() {
  return useQuery({
    queryKey: ["calendar"],
    queryFn: async () => {
      const { data } = await api.get("/api/calendar");
      return data.episodes as UpcomingEpisode[];
    },
    staleTime: 1000 * 60 * 15, // 15 dk
  });
}

/** "2026-07-21" → "21 Tem" gibi kısa tarih. Bugün/yarın özel gösterilir. */
export function formatAirDate(airDate: string): string {
  const months = [
    "Oca", "Şub", "Mar", "Nis", "May", "Haz",
    "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara",
  ];

  const date = new Date(airDate + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.round(
    (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return "Bugün";
  if (diffDays === 1) return "Yarın";
  if (diffDays > 1 && diffDays < 7) return `${diffDays} gün sonra`;

  return `${date.getDate()} ${months[date.getMonth()]}`;
}