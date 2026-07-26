// app/share-card.tsx : Paylaşım kartını gösterir; view-shot ile PNG'ye çevirip sistem paylaşım menüsünü açar.
import { useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { ChevronLeft, Share2 } from "lucide-react-native";
import { useTheme } from "@/lib/store/theme";
import { useAuth } from "@/lib/store/auth";
import { useStats } from "@/lib/queries/stats";
import { useTasteProfile } from "@/lib/queries/tasteProfile";
import { useUserProfile } from "@/lib/queries/social";
import { ShareCard, type ShareVariant } from "@/components/profile/ShareCard";
import { spacing, fontSize, fontWeight, radius } from "@/theme";

const VARIANTS: { key: ShareVariant; label: string }[] = [
  { key: "stats", label: "İstatistik" },
  { key: "recent", label: "Son İzlenen" },
  { key: "favorites", label: "Favoriler" },
  { key: "badges", label: "Rozetler" },
];

export default function ShareCardScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();

  const cardRef = useRef<View>(null);
  const [sharing, setSharing] = useState(false);
  const [variant, setVariant] = useState<ShareVariant>("stats");

  const username = user?.username ?? "";
  const statsQ = useStats(username);
  const tasteQ = useTasteProfile(true);
  const profileQ = useUserProfile(username);

  const st = statsQ.data?.stats;
  const insights = tasteQ.data?.insights ?? [];
  const recentlyWatched = profileQ.data?.user.recentlyWatched ?? [];
  const favorites = profileQ.data?.user.favorites ?? [];

  const isLoading = statsQ.isLoading || tasteQ.isLoading;

  const handleShare = async () => {
    if (!cardRef.current) return;

    setSharing(true);
    try {
      const uri = await captureRef(cardRef, {
        format: "png",
        quality: 1,
      });

      const available = await Sharing.isAvailableAsync();
      if (!available) {
        Alert.alert("Paylaşım yok", "Bu cihazda paylaşım kullanılamıyor.");
        setSharing(false);
        return;
      }

      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        dialogTitle: "Tracks Kartını Paylaş",
      });
    } catch (err) {
      Alert.alert("Hata", "Kart paylaşılamadı, tekrar dene.");
    } finally {
      setSharing(false);
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.bg }}
      edges={["top"]}
    >
      {/* Üst bar */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.md,
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.sm,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{
            width: 36,
            height: 36,
            borderRadius: radius.pill,
            backgroundColor: colors.surface,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ChevronLeft size={19} color={colors.text} />
        </Pressable>

        <Text
          style={{
            fontSize: 18,
            fontWeight: fontWeight.heavy,
            color: colors.text,
          }}
        >
          Kartını Paylaş
        </Text>
      </View>

      {/* Kart türü seçici */}
      <View style={{ paddingTop: spacing.md }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            gap: 8,
            paddingHorizontal: spacing.lg,
          }}
        >
          {VARIANTS.map((v) => {
            const active = variant === v.key;
            return (
              <Pressable
                key={v.key}
                onPress={() => setVariant(v.key)}
                style={{
                  backgroundColor: active ? colors.accent : colors.surface,
                  borderRadius: radius.pill,
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "700",
                    color: active ? colors.accentText : colors.textDim,
                  }}
                >
                  {v.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Kart önizleme */}
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isLoading || !st ? (
          <ActivityIndicator color={colors.accent} />
        ) : (
          <ShareCard
            ref={cardRef}
            displayName={user?.displayName ?? ""}
            username={username}
            avatar={user?.avatar ?? null}
            stats={st}
            insights={insights}
            variant={variant}
            recentlyWatched={recentlyWatched}
            favorites={favorites}
          />
        )}
      </View>

      {/* Paylaş butonu */}
      <View
        style={{
          paddingHorizontal: spacing.lg,
          paddingBottom: 34,
          paddingTop: spacing.md,
        }}
      >
        <Pressable
          onPress={handleShare}
          disabled={sharing || isLoading || !st}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            backgroundColor: colors.accent,
            borderRadius: radius.md,
            paddingVertical: 15,
            opacity: sharing || isLoading || !st ? 0.6 : 1,
          }}
        >
          {sharing ? (
            <ActivityIndicator size="small" color={colors.accentText} />
          ) : (
            <>
              <Share2 size={18} color={colors.accentText} />
              <Text
                style={{
                  fontSize: fontSize.md,
                  fontWeight: fontWeight.heavy,
                  color: colors.accentText,
                }}
              >
                Paylaş
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}