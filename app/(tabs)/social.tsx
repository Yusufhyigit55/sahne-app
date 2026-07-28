// app/(tabs)/social.tsx : Arkadaş akışı — takip edilenlerin aktiviteleri (feed).
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { UserPlus } from "lucide-react-native";
import { useTheme } from "@/lib/store/theme";
import { useFeed } from "@/lib/queries/social";
import { FeedItem } from "@/components/social/FeedItem";
import { TrendingStrip } from "@/components/social/TrendingStrip";
import {
  SCREEN_PADDING,
  spacing,
  fontSize,
  fontWeight,
  radius,
} from "@/theme";

export default function SocialScreen() {
  const { colors } = useTheme();
  const feedQ = useFeed();

  const feed = feedQ.data ?? [];

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.bg }}
      edges={["top"]}
    >
      {/* Başlık */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: SCREEN_PADDING,
          paddingTop: spacing.md,
          paddingBottom: spacing.lg,
        }}
      >
        <Text
          style={{
            fontSize: fontSize.xxl,
            fontWeight: fontWeight.heavy,
            color: colors.text,
            letterSpacing: -0.3,
          }}
        >
          Sosyal
        </Text>

        <Pressable
          onPress={() => router.push("/(tabs)/discover")}
          style={{
            width: 40,
            height: 40,
            borderRadius: radius.pill,
            backgroundColor: colors.surface,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <UserPlus size={18} color={colors.textDim} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: SCREEN_PADDING,
          paddingBottom: 110,
        }}
        refreshControl={
          <RefreshControl
            refreshing={feedQ.isRefetching}
            onRefresh={() => feedQ.refetch()}
            tintColor={colors.accent}
          />
        }
      >
        <TrendingStrip />

        {feedQ.isLoading ? (
          <View style={{ paddingVertical: spacing.xxl, alignItems: "center" }}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : feed.length === 0 ? (
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: radius.xl,
              padding: spacing.xxl,
              alignItems: "center",
              marginTop: spacing.xl,
              gap: spacing.md,
            }}
          >
            <Text
              style={{
                fontSize: fontSize.md,
                color: colors.textDim,
                textAlign: "center",
                lineHeight: 22,
              }}
            >
              Takip ettiğin kimse yok.{"\n"}
              Arkadaşlarını bul, aktivitelerini gör.
            </Text>
            <Pressable
              onPress={() => router.push("/(tabs)/discover")}
              style={{
                backgroundColor: colors.accent,
                borderRadius: radius.md,
                paddingVertical: 11,
                paddingHorizontal: 20,
                marginTop: spacing.sm,
              }}
            >
              <Text
                style={{
                  fontSize: fontSize.sm,
                  fontWeight: fontWeight.bold,
                  color: colors.accentText,
                }}
              >
                Kullanıcı Keşfet
              </Text>
            </Pressable>
          </View>
        ) : (
          feed.map((item: any) => <FeedItem key={item.id} item={item} />)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}