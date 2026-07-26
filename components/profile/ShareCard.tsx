// components/profile/ShareCard.tsx : Paylaşım için tasarlanmış dikey kart (view-shot ile PNG'ye çevrilir).
import { forwardRef } from "react";
import { View, Text } from "react-native";
import { Image } from "expo-image";
import { useTheme } from "@/lib/store/theme";
import type { UserStats } from "@/lib/queries/stats";
import type { TasteInsight } from "@/lib/queries/tasteProfile";

export type ShareVariant = "stats" | "recent" | "badges" | "favorites";

type PosterItem = {
  type: string;
  id: string | number;
  titleTr: string;
  poster: string | null;
};

type Props = {
  displayName: string;
  username: string;
  avatar: string | null;
  stats: UserStats;
  insights: TasteInsight[];
  variant: ShareVariant;
  recentlyWatched?: PosterItem[];
  favorites?: PosterItem[];
};

function formatMinutes(min: number): string {
  if (min < 60) return `${min}dk`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours}sa`;
  const days = Math.floor(hours / 24);
  return `${days}g`;
}

const VARIANT_TITLE: Record<ShareVariant, string> = {
  stats: "İstatistiklerim",
  recent: "Son İzlediklerim",
  badges: "Rozetlerim",
  favorites: "Favorilerim",
};

/** Paylaşılabilir kart. ref view-shot tarafından yakalanır. */
export const ShareCard = forwardRef<View, Props>(function ShareCard(
  {
    displayName,
    username,
    avatar,
    stats,
    insights,
    variant,
    recentlyWatched = [],
    favorites = [],
  },
  ref
) {
  const { colors } = useTheme();

  const bigStats = [
    { value: String(stats.summary.episodesWatched), label: "Bölüm" },
    { value: formatMinutes(stats.summary.totalMinutesAll), label: "Süre" },
    { value: String(stats.summary.moviesWatched), label: "Film" },
  ];
  const tags = insights.slice(0, 2);
  const earnedBadges = (stats.badges ?? []).filter((b) => b.earned).slice(0, 6);
  const posters = (variant === "recent" ? recentlyWatched : favorites).slice(
    0,
    6
  );

  // Poster ızgarası (recent + favorites için ortak)
  const renderPosters = () => (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 10,
      }}
    >
      {posters.map((p) => (
        <View
          key={`${p.type}:${p.id}`}
          style={{
            width: 84,
            height: 126,
            borderRadius: 10,
            backgroundColor: colors.surface,
            overflow: "hidden",
          }}
        >
          {p.poster && (
            <Image
              source={{ uri: p.poster }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
            />
          )}
        </View>
      ))}
    </View>
  );

  return (
    <View
      ref={ref}
      collapsable={false}
      style={{
        width: 320,
        height: 568,
        backgroundColor: colors.bg,
        borderRadius: 28,
        overflow: "hidden",
        padding: 28,
        justifyContent: "space-between",
      }}
    >
      {/* Üst — avatar + isim + kart başlığı */}
      <View style={{ alignItems: "center", gap: 12, marginTop: 12 }}>
        <View
          style={{
            width: 84,
            height: 84,
            borderRadius: 100,
            backgroundColor: colors.surface,
            overflow: "hidden",
            borderWidth: 2,
            borderColor: colors.accent,
          }}
        >
          {avatar && (
            <Image
              source={{ uri: avatar }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
            />
          )}
        </View>

        <View style={{ alignItems: "center", gap: 2 }}>
          <Text style={{ fontSize: 20, fontWeight: "800", color: colors.text }}>
            {displayName}
          </Text>
          <Text style={{ fontSize: 13, color: colors.textDim }}>
            @{username}
          </Text>
        </View>

        <View
          style={{
            backgroundColor: colors.accentSoft,
            borderRadius: 100,
            paddingVertical: 5,
            paddingHorizontal: 14,
            marginTop: 2,
          }}
        >
          <Text
            style={{ fontSize: 12, fontWeight: "800", color: colors.accent }}
          >
            {VARIANT_TITLE[variant]}
          </Text>
        </View>
      </View>

      {/* Orta — varyanta göre içerik */}
      <View style={{ flex: 1, justifyContent: "center" }}>
        {variant === "stats" && (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              alignItems: "center",
            }}
          >
            {bigStats.map((s, i) => (
              <View key={i} style={{ alignItems: "center", gap: 4 }}>
                <Text
                  style={{
                    fontSize: 30,
                    fontWeight: "900",
                    color: colors.accent,
                    letterSpacing: -0.5,
                  }}
                >
                  {s.value}
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    color: colors.textDim,
                    fontWeight: "600",
                  }}
                >
                  {s.label}
                </Text>
              </View>
            ))}
          </View>
        )}

        {(variant === "recent" || variant === "favorites") && renderPosters()}

        {variant === "badges" && (
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 14,
            }}
          >
            {earnedBadges.map((b) => (
              <View
                key={b.key}
                style={{ alignItems: "center", gap: 4, width: 84 }}
              >
                <Text style={{ fontSize: 34 }}>{b.emoji}</Text>
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "700",
                    color: colors.text,
                    textAlign: "center",
                  }}
                  numberOfLines={2}
                >
                  {b.title}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Alt-orta — zevk etiketleri (sadece stats varyantında) */}
      {variant === "stats" && (
        <View style={{ gap: 10 }}>
          {tags.map((t) => (
            <View
              key={t.key}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                backgroundColor: colors.surface,
                borderRadius: 14,
                paddingVertical: 12,
                paddingHorizontal: 16,
              }}
            >
              <Text style={{ fontSize: 22 }}>{t.emoji}</Text>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "800",
                  color: colors.text,
                  flex: 1,
                }}
              >
                {t.title}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* En alt — marka */}
      <View style={{ alignItems: "center", gap: 2 }}>
        <Text
          style={{
            fontSize: 22,
            fontWeight: "900",
            color: colors.text,
            letterSpacing: -0.3,
          }}
        >
          Tracks
        </Text>
        <Text style={{ fontSize: 11, color: colors.textFaint }}>
          dizi · film · kitap takip
        </Text>
      </View>
    </View>
  );
});