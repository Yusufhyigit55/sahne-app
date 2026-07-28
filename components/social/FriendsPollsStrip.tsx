// components/social/FriendsPollsStrip.tsx : Takip edilenlerin açtığı anketler (yatay şerit).
import { View, Text, ScrollView, Pressable } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { BarChart } from "lucide-react-native";
import { useTheme } from "@/lib/store/theme";
import { useFriendsPolls } from "@/lib/queries/social";
import { spacing, fontSize, fontWeight, radius } from "@/theme";

const PAD = 18;

export function FriendsPollsStrip() {
  const { colors } = useTheme();
  const { data: polls } = useFriendsPolls();

  if (!polls || polls.length === 0) return null;

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
        <BarChart size={16} color={colors.accent} strokeWidth={2.5} />
        <Text
          style={{
            fontSize: fontSize.md,
            fontWeight: fontWeight.heavy,
            color: colors.text,
          }}
        >
          Arkadaş Anketleri
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: PAD, gap: spacing.md }}
      >
        {polls.map((poll) => (
          <Pressable
            key={poll.id}
            onPress={() =>
              router.push(`/content/${poll.content.type}/${poll.content.id}`)
            }
            style={{
              width: 220,
              backgroundColor: colors.surface,
              borderRadius: radius.lg,
              padding: spacing.md,
              gap: 8,
            }}
          >
            {/* Anketi açan */}
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 7 }}
            >
              {poll.creator.avatar ? (
                <Image
                  source={{ uri: poll.creator.avatar }}
                  style={{ width: 24, height: 24, borderRadius: 12 }}
                />
              ) : (
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: colors.surfaceAlt,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: colors.textDim, fontSize: 11 }}>
                    {poll.creator.displayName?.[0] ?? poll.creator.username[0]}
                  </Text>
                </View>
              )}
              <Text
                style={{
                  fontSize: fontSize.xs,
                  color: colors.textDim,
                  flex: 1,
                }}
                numberOfLines={1}
              >
                {poll.creator.displayName || poll.creator.username}
              </Text>
            </View>

            {/* Soru */}
            <Text
              style={{
                fontSize: fontSize.sm,
                fontWeight: fontWeight.bold,
                color: colors.text,
              }}
              numberOfLines={2}
            >
              {poll.question}
            </Text>

            {/* İçerik + seçenek sayısı */}
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              {poll.content.poster && (
                <Image
                  source={{ uri: poll.content.poster }}
                  style={{ width: 22, height: 32, borderRadius: 4 }}
                />
              )}
              <Text
                style={{
                  fontSize: fontSize.xs,
                  color: colors.textFaint,
                  flex: 1,
                }}
                numberOfLines={1}
              >
                {poll.content.titleTr} · {poll.optionCount} seçenek
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}