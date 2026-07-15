// app/onboarding.tsx : Yeni kullanıcıya popüler dizi/film gösterip beğendiklerini seçtiren tek ekranlık onboarding.
import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Check } from "lucide-react-native";
import { useTheme } from "@/lib/store/theme";
import { api } from "@/lib/api";
import { useTrending } from "@/lib/queries/content";
import { useCompleteOnboarding } from "@/lib/queries/onboarding";
import {
  SCREEN_PADDING,
  spacing,
  fontSize,
  fontWeight,
  radius,
  shadow,
} from "@/theme";

type Selectable = {
  type: "series" | "movie";
  tmdbId: number;
  titleTr: string;
  poster: string | null;
};

export default function OnboardingScreen() {
  const { colors } = useTheme();

  const seriesQ = useTrending("series");
  const moviesQ = useTrending("movie");
  const complete = useCompleteOnboarding();

  // Seçilenler: "series:123" / "movie:456" biçiminde
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const series: Selectable[] = (seriesQ.data ?? []).map((s: any) => ({
    type: "series",
    tmdbId: s.tmdbId,
    titleTr: s.titleTr,
    poster: s.poster,
  }));

  const movies: Selectable[] = (moviesQ.data ?? []).map((m: any) => ({
    type: "movie",
    tmdbId: m.tmdbId,
    titleTr: m.titleTr,
    poster: m.poster,
  }));

  const toggle = (item: Selectable) => {
    const key = `${item.type}:${item.tmdbId}`;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const finish = async (withSelections: boolean) => {
    setSaving(true);
    try {
      if (withSelections && selected.size > 0) {
        const all = [...series, ...movies];
        // Seçilenleri "beğendim" olarak işaretle
        await Promise.all(
          [...selected].map((key) => {
            const [type, tmdbId] = key.split(":");
            return api
              .post("/api/watch/like", {
                type,
                id: Number(tmdbId),
                action: "like",
              })
              .catch(() => null); // biri hata verse de akışı durdurma
          })
        );
      }

      await complete.mutateAsync();
      router.replace("/(tabs)");
    } catch {
      Alert.alert("Hata", "Bir şeyler ters gitti, tekrar dene.");
      setSaving(false);
    }
  };

  const isLoading = seriesQ.isLoading || moviesQ.isLoading;

  const renderRow = (title: string, items: Selectable[]) => (
    <View style={{ gap: spacing.md }}>
      <Text
        style={{
          fontSize: fontSize.lg,
          fontWeight: fontWeight.heavy,
          color: colors.text,
          paddingHorizontal: SCREEN_PADDING,
        }}
      >
        {title}
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: SCREEN_PADDING,
          gap: spacing.md,
        }}
      >
        {items.map((item) => {
          const key = `${item.type}:${item.tmdbId}`;
          const isSel = selected.has(key);

          return (
            <Pressable
              key={key}
              onPress={() => toggle(item)}
              style={{ width: 108 }}
            >
              <View
                style={{
                  width: 108,
                  height: 160,
                  borderRadius: radius.lg,
                  backgroundColor: colors.surface,
                  borderWidth: 2,
                  borderColor: isSel ? colors.accent : "transparent",
                  overflow: "hidden",
                  ...shadow.md,
                  shadowColor: colors.shadowColor,
                }}
              >
                {item.poster && (
                  <Image
                    source={{ uri: item.poster }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                    transition={200}
                  />
                )}

                {/* Seçili katmanı */}
                {isSel && (
                  <View
                    style={{
                      position: "absolute",
                      inset: 0,
                      backgroundColor: "rgba(0,0,0,0.35)",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <View
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 100,
                        backgroundColor: colors.accent,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Check size={20} color={colors.accentText} />
                    </View>
                  </View>
                )}
              </View>

              <Text
                style={{
                  fontSize: fontSize.xs,
                  color: colors.textDim,
                  marginTop: 6,
                }}
                numberOfLines={1}
              >
                {item.titleTr}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 140, gap: spacing.xl }}>
        {/* Başlık */}
        <View
          style={{
            paddingHorizontal: SCREEN_PADDING,
            paddingTop: spacing.xl,
            gap: spacing.sm,
          }}
        >
          <Text
            style={{
              fontSize: fontSize.xxl,
              fontWeight: fontWeight.heavy,
              color: colors.text,
            }}
          >
            Neleri seviyorsun?
          </Text>
          <Text
            style={{ fontSize: fontSize.md, color: colors.textDim, lineHeight: 21 }}
          >
            İzlediğin veya beğendiğin birkaçını seç, sana daha iyi öneriler
            sunalım.
          </Text>
        </View>

        {isLoading ? (
          <View style={{ paddingVertical: 60, alignItems: "center" }}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : (
          <>
            {series.length > 0 && renderRow("Popüler Diziler", series)}
            {movies.length > 0 && renderRow("Popüler Filmler", movies)}
          </>
        )}
      </ScrollView>

      {/* Alt aksiyon çubuğu */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          flexDirection: "row",
          gap: spacing.md,
          paddingHorizontal: SCREEN_PADDING,
          paddingTop: spacing.md,
          paddingBottom: 34,
          backgroundColor: colors.bg,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <Pressable
          onPress={() => finish(false)}
          disabled={saving}
          style={{
            paddingVertical: 14,
            paddingHorizontal: 20,
            borderRadius: radius.md,
          }}
        >
          <Text
            style={{
              fontSize: fontSize.md,
              fontWeight: fontWeight.bold,
              color: colors.textDim,
            }}
          >
            Atla
          </Text>
        </Pressable>

        <Pressable
          onPress={() => finish(true)}
          disabled={saving}
          style={{
            flex: 1,
            backgroundColor: colors.accent,
            borderRadius: radius.md,
            paddingVertical: 14,
            alignItems: "center",
            justifyContent: "center",
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? (
            <ActivityIndicator size="small" color={colors.accentText} />
          ) : (
            <Text
              style={{
                fontSize: fontSize.md,
                fontWeight: fontWeight.heavy,
                color: colors.accentText,
              }}
            >
              {selected.size > 0 ? `Devam (${selected.size})` : "Devam"}
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}