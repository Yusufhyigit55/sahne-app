// lib/queries/list.ts : Kullanıcı listeleri için listeleme, oluşturma, detay, düzenleme, item ekle-çıkar, favorile ve silme hook'ları.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type ListSummary = {
  id: string;
  title: string;
  description: string;
  isPublic: boolean;
  itemCount: number;
  favoriteCount: number;
  covers: string[];
  createdAt: string;
};

export type ListItem = {
  contentId: string;
  note: string;
  order: number;
  type: "series" | "movie" | "book";
  tmdbId: string | number;
  title: string;
  poster: string | null;
  year: number | null;
};

export type ListDetail = {
  id: string;
  title: string;
  description: string;
  isPublic: boolean;
  favoriteCount: number;
  isFavorited: boolean;
  isOwner: boolean;
  userId: string;
  items: ListItem[];
  createdAt: string;
};

/** Bir kullanıcının listeleri (userId yoksa kendi listelerin). */
export function useLists(userId?: string) {
  return useQuery({
    queryKey: ["lists", userId ?? "me"],
    queryFn: async () => {
      const qs = userId ? `?userId=${userId}` : "";
      const { data } = await api.get(`/api/list${qs}`);
      return { lists: data.lists as ListSummary[], isOwner: data.isOwner };
    },
  });
}

/** Tek listenin detayı (içerikleriyle). */
export function useListDetail(id: string) {
  return useQuery({
    queryKey: ["list", id],
    queryFn: async () => {
      const { data } = await api.get(`/api/list/${id}`);
      return data.list as ListDetail;
    },
    enabled: !!id,
  });
}

/** Yeni liste oluştur. */
export function useCreateList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      title: string;
      description?: string;
      isPublic: boolean;
    }) => {
      const { data } = await api.post("/api/list", vars);
      return data.list as ListSummary;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lists", "me"] });
    },
  });
}

/** Liste bilgilerini düzenle. */
export function useEditList(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      title?: string;
      description?: string;
      isPublic?: boolean;
    }) => {
      const { data } = await api.patch(`/api/list/${id}`, {
        action: "edit",
        ...vars,
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["list", id] });
      qc.invalidateQueries({ queryKey: ["lists", "me"] });
    },
  });
}

/** Listeye içerik ekle. */
export function useAddToList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      listId: string;
      type: string;
      tmdbId: string | number;
      note?: string;
    }) => {
      const { listId, ...body } = vars;
      const { data } = await api.patch(`/api/list/${listId}`, {
        action: "add_item",
        ...body,
      });
      return data;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["list", vars.listId] });
      qc.invalidateQueries({ queryKey: ["lists", "me"] });
    },
  });
}

/** Listeden içerik çıkar. */
export function useRemoveFromList(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (contentId: string) => {
      const { data } = await api.patch(`/api/list/${id}`, {
        action: "remove_item",
        contentId,
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["list", id] });
      qc.invalidateQueries({ queryKey: ["lists", "me"] });
    },
  });
}

/** Listeyi favorile / favoriden çıkar. */
export function useFavoriteList(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.patch(`/api/list/${id}`, {
        action: "favorite",
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["list", id] });
    },
  });
}

/** Listeyi sil. */
export function useDeleteList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/api/list/${id}`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lists", "me"] });
    },
  });
}