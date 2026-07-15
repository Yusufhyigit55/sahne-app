// app/together/[username].tsx : İki kullanıcının ortak zevkine göre "birlikte ne izleyelim" ekranı.
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useTheme } from "@/lib/store/theme";
import { useTogether, type TogetherItem } from "@/lib/queries/together";
import { SCREEN_PADDING, spacing, fontSize, fontWeight, radius } from "@/theme";

export default function TogetherScreen() {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ username: string }>();
  const username = params.username ?? "";

  const q = useTogether(username);
  const data = q.data;

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
          paddingHorizontal: SCREEN_PADDING,
          paddingBottom: spacing.sm,
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
          Birlikte İzleyelim
        </Text>
      </View>

      {q.isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : q.isError || !data ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: SCREEN_PADDING,
          }}
        >
          <Text
            style={{
              color: colors.textDim,
              fontSize: fontSize.md,
              textAlign: "center",
            }}
          >
            Öneri oluşturulamadı. İkinizin de biraz daha içerik beğenmesi
            gerekebilir.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{
            padding: SCREEN_PADDING,
            gap: spacing.xl,
            paddingBottom: 40,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Başlık — kiminle */}
          <View style={{ alignItems: "center", gap: 8 }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: colors.surface,
                overflow: "hidden",
              }}
            >
              {data.other.avatar && (
                <Image
                  source={{ uri: data.other.avatar }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                />
              )}
            </View>
            <Text
              style={{
                fontSize: fontSize.lg,
                fontWeight: fontWeight.heavy,
                color: colors.text,
              }}
            >
              {data.other.displayName} ile
            </Text>

            {/* Ortak türler */}
            {data.commonGenres.length > 0 && (
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 6,
                  justifyContent: "center",
                }}
              >
                {data.commonGenres.map((g) => (
                  <View
                    key={g}
                    style={{
                      backgroundColor: colors.accentSoft,
                      borderRadius: radius.pill,
                      paddingHorizontal: 12,
                      paddingVertical: 5,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
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
          </View>

          {/* Öneriler */}
          {data.recommendations.length > 0 && (
            <View style={{ gap: spacing.md }}>
              <Text
                style={{
                  fontSize: fontSize.lg,
                  fontWeight: fontWeight.heavy,
                  color: colors.text,
                }}
              >
                İkinize Öneriler
              </Text>
              <View style={{ gap: spacing.md }}>
                {data.recommendations.map((item) => (
                  <PosterRow key={`${item.type}:${item.tmdbId}`} item={item} />
                ))}
              </View>
            </View>
          )}

          {/* Ortak beğeniler */}
          {data.shared.length > 0 && (
            <View style={{ gap: spacing.md }}>
              <Text
                style={{
                  fontSize: fontSize.lg,
                  fontWeight: fontWeight.heavy,
                  color: colors.text,
                }}
              >
                İkiniz de Sevmiş
              </Text>
              <View style={{ gap: spacing.md }}>
                {data.shared.map((item) => (
                  <PosterRow key={`${item.type}:${item.tmdbId}`} item={item} />
                ))}
              </View>
            </View>
          )}

          {data.recommendations.length === 0 &&
            data.shared.length === 0 && (
              <Text
                style={{
                  color: colors.textDim,
                  textAlign: "center",
                  marginTop: 20,
                }}
              >
                Ortak bir öneri bulunamadı. Biraz daha içerik beğenince tekrar
                dene.
              </Text>
            )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function PosterRow({ item }: { item: TogetherItem }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => router.push(`/content/${item.type}/${item.tmdbId}`)}
      style={{
        flexDirection: "row",
        gap: spacing.md,
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: "hidden",
      }}
    >
      <View style={{ width: 70, height: 105, backgroundColor: colors.surfaceAlt }}>
        {item.poster && (
          <Image
            source={{ uri: item.poster }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
          />
        )}
      </View>
      <View style={{ flex: 1, paddingVertical: 12, paddingRight: 12, gap: 4 }}>
        <Text
          style={{
            fontSize: fontSize.md,
            fontWeight: fontWeight.heavy,
            color: colors.text,
          }}
          numberOfLines={2}
        >
          {item.titleTr}
        </Text>
        <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
          {item.year && (
            <Text style={{ fontSize: 12, color: colors.textDim }}>
              {item.year}
            </Text>
          )}
          {item.tmdbRating != null && (
            <Text style={{ fontSize: 12, color: colors.textDim }}>
              ⭐ {item.tmdbRating}
            </Text>
          )}
          <Text style={{ fontSize: 12, color: colors.textDim }}>
            {item.type === "series" ? "Dizi" : "Film"}
          </Text>
        </View>
        <Text
          style={{ fontSize: 12, color: colors.accent, fontWeight: fontWeight.bold }}
          numberOfLines={1}
        >
          {item.reason}
        </Text>
      </View>
    </Pressable>
  );
}