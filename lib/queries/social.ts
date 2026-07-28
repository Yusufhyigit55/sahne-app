import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type FeedUser = {
  id: string;
  username: string;
  displayName: string;
  avatar: string | null;
};

export type FeedItem = {
  
  id: string;
  type: string;
  text: string;
  user: FeedUser;
  content: {
    type: "series" | "movie" | "book";
    id: string | number;
    titleTr: string;
    poster: string | null;
  };
  meta: Record<string, any>;
  isSpoiler: boolean;
  groupCount?: number;
  createdAt: string;
};

export type UserProfile = {
  id: string;
  username: string;
  displayName: string;
  avatar: string | null;
  coverImage: string | null;
  bio: string;
  location: string;
  isPrivate: boolean;
  isSelf: boolean;
  followStatus: "accepted" | "pending" | null;
  isMuted: boolean;
  followers: number;
  following: number;
  createdAt: string;
  stats: {
    episodesWatched: number;
    moviesWatched: number;
    seriesCompleted: number;
    booksRead: number;
    totalMinutes: number;
    comments: number;
  } | null;
  streak: { current: number; longest: number } | null;
  favorites: {
    type: string;
    id: string | number;
    titleTr: string;
    poster: string | null;
  }[];
  recentlyWatched: {
    type: string;
    id: string | number;
    titleTr: string;
    poster: string | null;
  }[];
};

/** Sosyal feed — kronolojik */
export function useFeed() {
  return useQuery({
    queryKey: ["feed"],
    queryFn: async () => {
      const { data } = await api.get("/api/social/feed");
      return data.items as FeedItem[];
    },
  });
}
export type TrendingItem = {
  type: "series" | "movie" | "book";
  id: number;
  titleTr: string;
  poster: string | null;
  friendCount: number;
  friends: { avatar: string | null; displayName: string }[];
};
export type FriendPoll = {
  id: string;
  question: string;
  creator: { username: string; displayName: string; avatar: string | null };
  content: {
    type: "series" | "movie" | "book";
    id: number;
    titleTr: string;
    poster: string | null;
  };
  optionCount: number;
};

/** Takip edilenlerin açtığı son anketler */
export function useFriendsPolls() {
  return useQuery({
    queryKey: ["friendsPolls"],
    queryFn: async () => {
      const { data } = await api.get("/api/social/friends-polls");
      return data.polls as FriendPoll[];
    },
  });
}
/** Arkadaşların bu hafta en çok izlediği içerikler (trend) */
export function useTrending() {
  return useQuery({
    queryKey: ["trending"],
    queryFn: async () => {
      const { data } = await api.get("/api/social/trending");
      return data.trending as TrendingItem[];
    },
  });
}
/** Kullanıcı profili */
export function useUserProfile(username: string) {
  return useQuery({
    queryKey: ["userProfile", username],
    queryFn: async () => {
      const { data } = await api.get(`/api/user/${username}`);
      return data as { user: UserProfile; locked: boolean };
    },
    enabled: !!username,
  });
}

/** Takip et / bırak */
export function useToggleFollow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (username: string) => {
      const { data } = await api.post("/api/social/follow", { username });
      return data as { status: "accepted" | "pending" | null };
    },
    // Optimistic: butona basınca profil durumunu anında güncelle (backend beklenmez)
    onMutate: async (username) => {
      const key = ["userProfile", username];
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<any>(key);

      qc.setQueryData(key, (old: any) => {
        if (!old?.user) return old;
        const cur = old.user.followStatus;
        // Takip ediyorsa/bekliyorsa → bırak (null); değilse → gizli hesapsa pending, değilse accepted
        let next: "accepted" | "pending" | null;
        let followerDelta = 0;
        if (cur === "accepted") {
          next = null;
          followerDelta = -1;
        } else if (cur === "pending") {
          next = null;
        } else {
          next = old.user.isPrivate ? "pending" : "accepted";
          if (next === "accepted") followerDelta = 1;
        }
        return {
          ...old,
          user: {
            ...old.user,
            followStatus: next,
            followers: Math.max(0, (old.user.followers ?? 0) + followerDelta),
          },
        };
      });

      return { prev, key };
    },
    onError: (_e, _v, ctx: any) => {
      if (ctx?.prev !== undefined) {
        qc.setQueryData(ctx.key, ctx.prev);
      }
    },
    onSettled: (_d, _e, username) => {
      qc.invalidateQueries({ queryKey: ["userProfile", username] });
      qc.invalidateQueries({ queryKey: ["feed"] });
      qc.invalidateQueries({ queryKey: ["followRequests"] });
    },
  });
}

/** Engelle / sessize al */
export function useToggleBlock() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (vars: {
      username: string;
      type: "block" | "mute";
    }) => {
      const { data } = await api.post("/api/social/block", vars);
      return data as { active: boolean; type: string };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["userProfile"] });
      qc.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}

/** Takipçi / takip edilen listesi */
export function useFollowList(username: string, type: "followers" | "following") {
  return useQuery({
    queryKey: ["followList", username, type],
    queryFn: async () => {
      const { data } = await api.get(
        `/api/social/follow?username=${username}&type=${type}`
      );
      return data.users as FeedUser[];
    },
    enabled: !!username,
  });
}

/** Bekleyen takip istekleri */
export function useFollowRequests() {
  return useQuery({
    queryKey: ["followRequests"],
    queryFn: async () => {
      const { data } = await api.get("/api/social/requests");
      return data.requests as {
        id: string;
        user: FeedUser;
        createdAt: string;
      }[];
    },
  });
}

/** İsteği onayla / reddet */
export function useHandleRequest() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (vars: {
      requestId: string;
      action: "accept" | "reject";
    }) => {
      const { data } = await api.post("/api/social/requests", vars);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["followRequests"] });
      qc.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}
/** Kullanıcı ara */
export function useSearchUsers(query: string) {
  return useQuery({
    queryKey: ["searchUsers", query],
    queryFn: async () => {
      const { data } = await api.get(
        `/api/social/search?q=${encodeURIComponent(query)}`
      );
      return data.users as {
        id: string;
        username: string;
        displayName: string;
        avatar: string | null;
        isPrivate: boolean;
        followers: number;
        followStatus: "accepted" | "pending" | null;
      }[];
    },
    enabled: query.trim().length >= 2,
    staleTime: 1000 * 60,
  });
}