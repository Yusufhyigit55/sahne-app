import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type WeekPoint = { label: string; value: number };
export type GenreCount = { name: string; count: number };
export type RatedItem = { title: string; rating: number };

export type MediaStats = {
  weeklyWatched: WeekPoint[];
  weeklyHours: WeekPoint[];
  totalMinutes: number;
  totalWatched: number;
  totalAdded: number;
  stillAiring: number;
  topGenres: GenreCount[];
  remaining: number;
  remainingFromCount: number;
  topRated: RatedItem[];
  commentCount: number;
  likesReceived: number;
  characterVotes: number;
  characterVotedContent: number;
};

export type Badge = {
  key: string;
  emoji: string;
  title: string;
  description: string;
  category: "milestone" | "completion" | "streak" | "social" | "variety";
  earned: boolean;
};

export type UserStats = {
  series: MediaStats;
  movies: MediaStats;
  summary: {
    totalMinutesAll: number;
    episodesWatched: number;
    moviesWatched: number;
    currentStreak: number;
    longestStreak: number;
  };
  badges: Badge[];
  earnedBadgeCount: number;
};

export function useStats(username: string) {
  return useQuery({
    queryKey: ["stats", username],
    queryFn: async () => {
      const { data } = await api.get(
        `/api/stats?username=${encodeURIComponent(username)}`
      );
      return data as { stats: UserStats | null; isPrivate?: boolean };
    },
    enabled: !!username,
    staleTime: 1000 * 60 * 5,
  });
}

/** Dakikayı "X ay Y gün Z saat" formatına çevirir. */
export function formatDuration(totalMinutes: number): {
  months: number;
  days: number;
  hours: number;
} {
  const totalHours = Math.floor(totalMinutes / 60);
  const months = Math.floor(totalHours / (24 * 30));
  const remAfterMonths = totalHours - months * 24 * 30;
  const days = Math.floor(remAfterMonths / 24);
  const hours = remAfterMonths - days * 24;
  return { months, days, hours };
}
