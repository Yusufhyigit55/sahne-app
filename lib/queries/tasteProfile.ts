// lib/queries/tasteProfile.ts : Kullanıcının zevk profili içgörülerini getiren hook.
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type TasteInsight = {
  key: string;
  emoji: string;
  title: string;
  detail: string;
};

export type TasteProfile = {
  insights: TasteInsight[];
  needsMoreData: boolean;
};

/** Giriş yapan kullanıcının zevk profili. */
export function useTasteProfile(enabled = true) {
  return useQuery({
    queryKey: ["tasteProfile"],
    queryFn: async () => {
      const { data } = await api.get("/api/taste-profile");
      return data as TasteProfile;
    },
    enabled,
    staleTime: 1000 * 60 * 10, // 10 dk
  });
}