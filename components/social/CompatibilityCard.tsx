import { View, Text, ScrollView, Pressable } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Zap } from "lucide-react-native";
import { useTheme } from "@/lib/store/theme";
import { spacing, fontSize, fontWeight, radius, shadow } from "@/theme";
import type { Compatibility } from "@/lib/queries/socialGraph";

export function CompatibilityCard({ data }: { data: Compatibility }) {
  const { colors, name } = useTheme();

  const isDark = name === "dark";

  // Skora göre renk
  const scoreColor =
    data.score >= 70
      ? colors.accent
      : data.score >= 40
      ? colors.warn
      : colors.textDim;

  const gradientColors: [string, string] =
    data.score >= 70
      ? isDark
        ? ["rgba(45, 212, 191, 0.20)", "rgba(45, 212, 191, 0.04)"]
        : ["rgba(13, 148, 136, 0.14)", "rgba(13, 148, 136, 0.03)"]
      : isDark
      ? [colors.surfaceRaised, colors.surface]
      : [colors.surface, colors.surfaceAlt];

  return (
    <View
      style={{
        borderRadius: radius.xl,
        ...shadow.md,
        shadowColor: colors.shadowColor,
      }}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: radius.xl,
          borderWidth: 1,
          borderColor: data.score >= 70 ? colors.accent : colors.borderLight,
          padding: spacing.xl,
          gap: spacing.lg,
          overflow: "hidden",
        }}
      >
        {/* Skor */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.lg,
          }}
        >
          {/* Yüzde */}
          <View
            style={{
              width: 66,
              height: 66,
              borderRadius: radius.pill,
              borderWidth: 3,
              borderColor: scoreColor,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.bg,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: fontWeight.heavy,
                color: scoreColor,
                letterSpacing: -0.5,
              }}
            >
              %{data.score}
            </Text>
          </View>

          <View style={{ flex: 1, gap: 3 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Zap size={14} color={scoreColor} />
              <Text
                style={{
                  fontSize: fontSize.lg,
                  fontWeight: fontWeight.heavy,
                  color: colors.text,
                }}
              >
                Zevk Uyumu
              </Text>
            </View>

            <Text
              style={{
                fontSize: fontSize.sm,
                color: colors.textDim,
                lineHeight: 18,
              }}
            >
              {data.verdict}
            </Text>

            {data.sharedCount > 0 && (
              <Text
                style={{
                  fontSize: fontSize.xs,
                  color: colors.textFaint,
                  marginTop: 1,
                }}
              >
                {data.sharedCount} ortak içerik
              </Text>
            )}
          </View>
        </View>

        {/* Ortak türler */}
        {data.topSharedGenres.length > 0 && (
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 6,
            }}
          >
            {data.topSharedGenres.map((g) => (
              <View
                key={g}
                style={{
                  backgroundColor: colors.accentSoft,
                  borderRadius: radius.pill,
                  paddingHorizontal: 11,
                  paddingVertical: 5,
                }}
              >
                <Text
                  style={{
                    fontSize: fontSize.xs,
                    fontWeight: fontWeight.bold,
                    color: colors.accent,
                  }}
                >
                  {g}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Ortak içerikler */}
        {data.sharedContents.length > 0 && (
          <View style={{ gap: spacing.md }}>
            <Text
              style={{
                fontSize: fontSize.sm,
                fontWeight: fontWeight.bold,
                color: colors.textDim,
              }}
            >
              İkinizin de izlediği
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: spacing.md }}
            >
              {data.sharedContents.map((c, i) => (
                <Pressable
                  key={`${c.type}-${c.id}-${i}`}
                  onPress={() => router.push(`/content/${c.type}/${c.id}`)}
                  style={{ width: 74 }}
                >
                  <View
                    style={{
                      width: 74,
                      height: 108,
                      borderRadius: radius.md,
                      backgroundColor: colors.surfaceAlt,
                      overflow: "hidden",
                      borderWidth: 1,
                      borderColor: colors.borderLight,
                      ...shadow.sm,
                      shadowColor: colors.shadowColor,
                    }}
                  >
                    {c.poster && (
                      <Image
                        source={{ uri: c.poster }}
                        style={{ width: "100%", height: "100%" }}
                        contentFit="cover"
                        transition={200}
                      />
                    )}
                  </View>

                  {/* Puanlar */}
                  {(c.myRating != null || c.theirRating != null) && (
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "center",
                        gap: 5,
                        marginTop: 5,
                      }}
                    >
                      {c.myRating != null && (
                        <Text
                          style={{
                            fontSize: 10,
                            fontWeight: fontWeight.heavy,
                            color: colors.accent,
                          }}
                        >
                          {c.myRating}
                        </Text>
                      )}
                      {c.myRating != null && c.theirRating != null && (
                        <Text
                          style={{ fontSize: 10, color: colors.textFaint }}
                        >
                          ·
                        </Text>
                      )}
                      {c.theirRating != null && (
                        <Text
                          style={{
                            fontSize: 10,
                            fontWeight: fontWeight.heavy,
                            color: colors.textDim,
                          }}
                        >
                          {c.theirRating}
                        </Text>
                      )}
                    </View>
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}
      </LinearGradient>
    </View>
  );
}