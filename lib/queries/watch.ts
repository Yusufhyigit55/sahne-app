import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type WatchStatus =
  | "none"
  | "watchlist"
  | "watching"
  | "up_to_date"
  | "completed"
  | "paused"
  | "dropped"
  | "reading";

export type WatchRecord = {
  status: WatchStatus;
  rating: number | null;
  isLiked: boolean;
  isDisliked: boolean;
  isFavorite: boolean;
  isHidden: boolean;
  watchedAt: string | null;
  rewatchCount: number;
};

const EMPTY_RECORD: WatchRecord = {
  status: "none",
  rating: null,
  isLiked: false,
  isDisliked: false,
  isFavorite: false,
  isHidden: false,
  watchedAt: null,
  rewatchCount: 0,
};

/** Kullanıcının bir içerikle ilişkisi */
export function useWatchStatus(type: string, id: string | number) {
  return useQuery({
    queryKey: ["watchStatus", type, String(id)],
    queryFn: async () => {
      const { data } = await api.get(`/api/watch/status?type=${type}&id=${id}`);
      return data as {
        record: WatchRecord | null;
        watchedEpisodes: number;
        totalEpisodes: number;
      };
    },
    enabled: !!id,
    staleTime: 1000 * 30, // 30 saniye
    refetchOnWindowFocus: false,
  });
}

/** Bölüm işaretle / geri al — OPTIMISTIC */
export function useToggleEpisode(tmdbId: number) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (vars: { season: number; episode: number }) => {
      const { data } = await api.post("/api/watch/episode", {
        tmdbId,
        season: vars.season,
        episode: vars.episode,
      });
      return data;
    },

    onMutate: async (vars) => {
      const seasonKey = ["season", tmdbId, vars.season];
      const statusKey = ["watchStatus", "series", String(tmdbId)];

      await qc.cancelQueries({ queryKey: seasonKey });
      await qc.cancelQueries({ queryKey: statusKey });

      const prevSeason = qc.getQueryData(seasonKey);
      const prevStatus = qc.getQueryData(statusKey);

      // Kutucuğu anında değiştir
      qc.setQueryData(seasonKey, (old: any) => {
        if (!old?.episodes) return old;
        return {
          ...old,
          episodes: old.episodes.map((e: any) =>
            e.episode === vars.episode ? { ...e, watched: !e.watched } : e
          ),
        };
      });

      const wasWatched = (prevSeason as any)?.episodes?.find(
        (e: any) => e.episode === vars.episode
      )?.watched;

      // Sayacı anında güncelle
      qc.setQueryData(statusKey, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          watchedEpisodes: old.watchedEpisodes + (wasWatched ? -1 : 1),
        };
      });

      return { prevSeason, prevStatus, seasonKey, statusKey };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.prevSeason) qc.setQueryData(ctx.seasonKey, ctx.prevSeason);
      if (ctx?.prevStatus) qc.setQueryData(ctx.statusKey, ctx.prevStatus);
    },

    // Sunucu yanıtını doğrudan yaz
    onSuccess: (data) => {
      const statusKey = ["watchStatus", "series", String(tmdbId)];

      qc.setQueryData(statusKey, (old: any) => {
        const base = old ?? {
          record: null,
          watchedEpisodes: 0,
          totalEpisodes: 0,
        };

        return {
          ...base,
          watchedEpisodes: data.totalWatched,
          totalEpisodes: data.totalEpisodes,
          record: {
            ...(base.record ?? EMPTY_RECORD),
            status: data.status,
          },
        };
      });
    },

    onSettled: () => {
      qc.invalidateQueries({
        queryKey: ["continueWatching"],
        refetchType: "none",
      });
      qc.invalidateQueries({ queryKey: ["library"], refetchType: "none" });
    },
  });
}

/** Sezon veya tüm diziyi toplu işaretle */
export function useBulkWatch(tmdbId: number) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (vars: {
      scope: "season" | "all";
      season?: number;
      watchedAt?: string;
      isApproximate?: boolean;
    }) => {
      const { data } = await api.post("/api/watch/bulk", {
        tmdbId,
        ...vars,
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["season"] });
      qc.invalidateQueries({ queryKey: ["watchStatus"] });
      qc.invalidateQueries({ queryKey: ["continueWatching"] });
      qc.invalidateQueries({ queryKey: ["library"] });
    },
  });
}

/** Beğen / beğenme / favorile / izleme listesi — OPTIMISTIC */
export function useToggleLike(type: string, id: string | number) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (
      action: "like" | "dislike" | "favorite" | "watchlist"
    ) => {
      const { data } = await api.post("/api/watch/like", {
        type,
        id,
        action,
      });
      return data;
    },

    onMutate: async (action) => {
      const statusKey = ["watchStatus", type, String(id)];
      await qc.cancelQueries({ queryKey: statusKey });

      const prev = qc.getQueryData(statusKey);

      qc.setQueryData(statusKey, (old: any) => {
        const base = old ?? {
          record: null,
          watchedEpisodes: 0,
          totalEpisodes: 0,
        };

        const rec: WatchRecord = base.record ?? EMPTY_RECORD;

        if (action === "favorite") {
          return { ...base, record: { ...rec, isFavorite: !rec.isFavorite } };
        }

        if (action === "dislike") {
          return {
            ...base,
            record: { ...rec, isDisliked: !rec.isDisliked, isLiked: false },
          };
        }

        if (action === "like") {
          return {
            ...base,
            record: { ...rec, isLiked: !rec.isLiked, isDisliked: false },
          };
        }

        if (action === "watchlist") {
          const inList = rec.status === "watchlist";
          return {
            ...base,
            record: {
              ...rec,
              status: (inList ? "none" : "watchlist") as WatchStatus,
            },
          };
        }

        return base;
      });

      return { prev, statusKey };
    },

    onError: (_e, _v, ctx) => {
      if (ctx?.prev !== undefined) {
        qc.setQueryData(ctx.statusKey, ctx.prev);
      }
    },

    onSuccess: (data) => {
      const statusKey = ["watchStatus", type, String(id)];

      qc.setQueryData(statusKey, (old: any) => {
        const base = old ?? {
          record: null,
          watchedEpisodes: 0,
          totalEpisodes: 0,
        };

        if (data.status === null) {
          return { ...base, record: null };
        }

        return {
          ...base,
          record: {
            ...(base.record ?? EMPTY_RECORD),
            status: data.status,
            isLiked: data.isLiked,
            isDisliked: data.isDisliked,
            isFavorite: data.isFavorite,
          },
        };
      });
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["library"], refetchType: "none" });
    },
  });
}

/** Filmi izledim / izleme listesine ekle */
export function useMovieWatch(tmdbId: number) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (status: "completed" | "watchlist" | "dropped") => {
      const { data } = await api.post("/api/watch/movie", {
        tmdbId,
        status,
      });
      return data;
    },

    onMutate: async (status) => {
      const statusKey = ["watchStatus", "movie", String(tmdbId)];
      await qc.cancelQueries({ queryKey: statusKey });

      const prev = qc.getQueryData(statusKey);

      qc.setQueryData(statusKey, (old: any) => {
        const base = old ?? {
          record: null,
          watchedEpisodes: 0,
          totalEpisodes: 0,
        };

        const rec: WatchRecord = base.record ?? EMPTY_RECORD;
        const same = rec.status === status;

        return {
          ...base,
          record: {
            ...rec,
            status: (same ? "none" : status) as WatchStatus,
          },
        };
      });

      return { prev, statusKey };
    },

    onError: (_e, _v, ctx) => {
      if (ctx?.prev !== undefined) {
        qc.setQueryData(ctx.statusKey, ctx.prev);
      }
    },

    onSuccess: (data) => {
      const statusKey = ["watchStatus", "movie", String(tmdbId)];

      qc.setQueryData(statusKey, (old: any) => {
        const base = old ?? {
          record: null,
          watchedEpisodes: 0,
          totalEpisodes: 0,
        };

        if (data.status === null) {
          return { ...base, record: null };
        }

        return {
          ...base,
          record: {
            ...(base.record ?? EMPTY_RECORD),
            status: data.status,
          },
        };
      });
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["library"], refetchType: "none" });
      qc.invalidateQueries({
        queryKey: ["continueWatching"],
        refetchType: "none",
      });
    },
  });
}
/** Durumu elle değiştir — OPTIMISTIC */
export function useSetStatus(type: string, id: string | number) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (status: WatchStatus) => {
      const { data } = await api.patch("/api/watch/status", {
        type,
        id,
        status,
      });
      return data;
    },

    onMutate: async (status) => {
      const statusKey = ["watchStatus", type, String(id)];
      await qc.cancelQueries({ queryKey: statusKey });

      const prev = qc.getQueryData(statusKey);

      qc.setQueryData(statusKey, (old: any) => {
        const base = old ?? {
          record: null,
          watchedEpisodes: 0,
          totalEpisodes: 0,
        };

        return {
          ...base,
          record: { ...(base.record ?? EMPTY_RECORD), status },
        };
      });

      return { prev, statusKey };
    },

    onError: (_e, _v, ctx) => {
      if (ctx?.prev !== undefined) {
        qc.setQueryData(ctx.statusKey, ctx.prev);
      }
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["library"], refetchType: "none" });
      qc.invalidateQueries({
        queryKey: ["continueWatching"],
        refetchType: "none",
      });
    },
  });
}