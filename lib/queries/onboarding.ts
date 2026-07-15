// lib/queries/onboarding.ts : Onboarding tamamlama hook'u; sunucuda işaretler ve yerel user'ı günceller.
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/store/auth";

/** Onboarding'i tamamlandı olarak işaretle (sunucu + yerel state). */
export function useCompleteOnboarding() {
  const { user, setUser } = useAuth();

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/api/onboarding/complete", {});
      return data;
    },
    onSuccess: () => {
      // Yerel user'ı güncelle ki tekrar onboarding'e yönlenmesin
      if (user) {
        setUser({ ...user, onboarded: true });
      }
    },
  });
}