import { QueryClient } from "@tanstack/react-query";

/**
 * Tek merkezi QueryClient.
 * Giriş/çıkışta temizlenebilmesi için store'dan erişilebilir olmalı.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60, // 1 dk
    },
  },
});