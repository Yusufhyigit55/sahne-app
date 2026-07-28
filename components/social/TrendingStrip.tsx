// components/social/TrendingStrip.tsx : Arkadaşların bu hafta en çok izlediği içerikler (yatay şerit).
import { View, Text, ScrollView, Pressable } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { TrendingUp } from "lucide-react-native";
import { useTheme } from "@/lib/store/theme";
import { useTrending } from "@/lib/queries/social";
import { spacing, fontSize, fontWeight, radius } from "@/theme";

export function TrendingStrip() {
  const { colors } = useTheme();
  const { data: trending } = useTrending();

  if (!trending || trending.length === 0) return null;

  return (
    <View style={{ marginBottom: spacing.lg }}>
      {/* Başlık */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          paddingHorizontal: SCREEN_PAD,
          marginBottom: spacing.sm,
        }}
      >
        <TrendingUp size={16} color={colors.accent} strokeWidth={2.5} />
        <Text
          style={{
            fontSize: fontSize.md,
            fontWeight: fontWeight.heavy,
            color: colors.text,
          }}
        >
          Bu Hafta Trend
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: SCREEN_PAD,
          gap: spacing.md,
        }}
      >
        {trending.map((item) => (
          <Pressable
            key={`${item.type}:${item.id}`}
            onPress={() => router.push(`/content/${item.type}/${item.id}`)}
            style={{ width: 110 }}
          >
            <View
              style={{
                width: 110,
                height: 160,
                borderRadius: radius.lg,
                overflow: "hidden",
                backgroundColor: colors.surface,
              }}
            >
              {item.poster && (
                <Image
                  source={{ uri: item.poster }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                />
              )}
            </View>
            <Text
              numberOfLines={1}
              style={{
                fontSize: fontSize.sm,
                fontWeight: fontWeight.bold,
                color: colors.text,
                marginTop: 6,
              }}
            >
              {item.titleTr}
            </Text>
            <Text
              style={{
                fontSize: fontSize.xs,
                color: colors.accent,
                fontWeight: fontWeight.bold,
                marginTop: 1,
              }}
            >
              {item.friendCount} arkadaşın izledi
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const SCREEN_PAD = 18;