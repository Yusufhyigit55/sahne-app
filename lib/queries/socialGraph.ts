import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type SharedContent = {
  type: string;
  id: string | number;
  titleTr: string;
  poster: string | null;
  myRating: number | null;
  theirRating: number | null;
};

export type Compatibility = {
  score: number;
  sharedCount: number;
  sharedContents: SharedContent[];
  topSharedGenres: string[];
  verdict: string;
};

export type SuggestedUser = {
  id: string;
  username: string;
  displayName: string;
  avatar: string | null;
  isPrivate: boolean;
  followers: number;
  compatibility: number;
  sharedCount: number;
  reason: string;
};

/** İki kullanıcı arasındaki uyum */
export function useCompatibility(username: string, enabled = true) {
  return useQuery({
    queryKey: ["compatibility", username],
    queryFn: async () => {
      const { data } = await api.get(
        `/api/social/compatibility?username=${encodeURIComponent(username)}`
      );
      return data.compatibility as Compatibility | null;
    },
    enabled: enabled && !!username,
    staleTime: 1000 * 60 * 5,
  });
}

/** Benzer zevkli kullanıcı önerileri */
export function useSuggestedUsers() {
  return useQuery({
    queryKey: ["suggestedUsers"],
    queryFn: async () => {
      const { data } = await api.get("/api/social/suggestions");
      return data.users as SuggestedUser[];
    },
    staleTime: 1000 * 60 * 15,
  });
}