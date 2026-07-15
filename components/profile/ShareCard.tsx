// components/profile/ShareCard.tsx : Paylaşım için tasarlanmış dikey kart (view-shot ile PNG'ye çevrilir).
import { forwardRef } from "react";
import { View, Text } from "react-native";
import { Image } from "expo-image";
import { useTheme } from "@/lib/store/theme";
import type { UserStats } from "@/lib/queries/stats";
import type { TasteInsight } from "@/lib/queries/tasteProfile";

type Props = {
  displayName: string;
  username: string;
  avatar: string | null;
  stats: UserStats;
  insights: TasteInsight[];
};

function formatMinutes(min: number): string {
  if (min < 60) return `${min}dk`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours}sa`;
  const days = Math.floor(hours / 24);
  return `${days}g`;
}

/** Paylaşılabilir kart. ref view-shot tarafından yakalanır. */
export const ShareCard = forwardRef<View, Props>(function ShareCard(
  { displayName, username, avatar, stats, insights },
  ref
) {
  const { colors } = useTheme();

  // En çarpıcı 3 istatistik
  const bigStats = [
    { value: String(stats.summary.episodesWatched), label: "Bölüm" },
    { value: formatMinutes(stats.summary.totalMinutesAll), label: "Süre" },
    { value: String(stats.summary.moviesWatched), label: "Film" },
  ];

  // En fazla 2 zevk etiketi
  const tags = insights.slice(0, 2);

  return (
    <View
      ref={ref}
      collapsable={false}
      style={{
        width: 320,
        height: 568, // 9:16 story oranı
        backgroundColor: colors.bg,
        borderRadius: 28,
        overflow: "hidden",
        padding: 28,
        justifyContent: "space-between",
      }}
    >
      {/* Üst — avatar + isim */}
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
          <Text
            style={{ fontSize: 20, fontWeight: "800", color: colors.text }}
          >
            {displayName}
          </Text>
          <Text style={{ fontSize: 13, color: colors.textDim }}>
            @{username}
          </Text>
        </View>
      </View>

      {/* Orta — büyük istatistikler */}
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

      {/* Alt-orta — zevk etiketleri */}
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
          Sahne
        </Text>
        <Text style={{ fontSize: 11, color: colors.textFaint }}>
          dizi · film · kitap takip
        </Text>
      </View>
    </View>
  );
});