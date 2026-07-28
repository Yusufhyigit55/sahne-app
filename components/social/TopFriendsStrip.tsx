// components/social/TopFriendsStrip.tsx : En uyumlu ilk 3 arkadaş (1.'de yıldız vurgusu).
import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Star, Users } from "lucide-react-native";
import { useTheme } from "@/lib/store/theme";
import { useSuggestedUsers } from "@/lib/queries/socialGraph";
import { spacing, fontSize, fontWeight, radius } from "@/theme";

const PAD = 18;

export function TopFriendsStrip() {
  const { colors } = useTheme();
  const { data: users } = useSuggestedUsers();

  // Uyuma göre sıralı ilk 3
  const top3 = (users ?? [])
    .slice()
    .sort((a, b) => b.compatibility - a.compatibility)
    .slice(0, 3);

  if (top3.length === 0) return null;

  return (
    <View style={{ marginBottom: spacing.lg }}>
      {/* Başlık */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          paddingHorizontal: PAD,
          marginBottom: spacing.sm,
        }}
      >
        <Users size={16} color={colors.accent} strokeWidth={2.5} />
        <Text
          style={{
            fontSize: fontSize.md,
            fontWeight: fontWeight.heavy,
            color: colors.text,
          }}
        >
          En Uyumlu Arkadaşların
        </Text>
      </View>

      <View style={{ paddingHorizontal: PAD, gap: spacing.sm }}>
        {top3.map((u, i) => (
          <Pressable
            key={u.id}
            onPress={() => router.push(`/user/${u.username}`)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.md,
              backgroundColor: colors.surface,
              borderRadius: radius.lg,
              padding: spacing.md,
              // 1. sırada vurgulu kenarlık
              borderWidth: i === 0 ? 1.5 : 0,
              borderColor: i === 0 ? colors.accent : "transparent",
            }}
          >
            {/* Sıra numarası */}
            <View
              style={{
                width: 26,
                height: 26,
                borderRadius: 13,
                backgroundColor:
                  i === 0 ? colors.accent : colors.surfaceAlt,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {i === 0 ? (
                <Star size={14} color={colors.accentText} fill={colors.accentText} />
              ) : (
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: fontWeight.heavy,
                    color: colors.textDim,
                  }}
                >
                  {i + 1}
                </Text>
              )}
            </View>

            {/* Avatar */}
            {u.avatar ? (
              <Image
                source={{ uri: u.avatar }}
                style={{ width: 44, height: 44, borderRadius: 22 }}
              />
            ) : (
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: colors.surfaceAlt,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: colors.textDim, fontSize: 18 }}>
                  {u.displayName?.[0] ?? u.username[0]}
                </Text>
              </View>
            )}

            {/* İsim + uyum */}
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: fontSize.md,
                  fontWeight: fontWeight.bold,
                  color: colors.text,
                }}
                numberOfLines={1}
              >
                {u.displayName || u.username}
              </Text>
              <Text
                style={{
                  fontSize: fontSize.xs,
                  color: colors.accent,
                  fontWeight: fontWeight.bold,
                  marginTop: 1,
                }}
              >
                %{u.compatibility} uyumlu
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}