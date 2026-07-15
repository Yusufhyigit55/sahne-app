// app/settings/about.tsx : Uygulama bilgileri + TMDB/Google Books yasal atıfları.
import { View, Text, ScrollView, Pressable, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useTheme } from "@/lib/store/theme";
import { SCREEN_PADDING, spacing, fontSize, fontWeight, radius } from "@/theme";

const APP_VERSION = "1.0.0";

export default function AboutScreen() {
  const { colors } = useTheme();

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
          Hakkında
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: SCREEN_PADDING,
          gap: spacing.xl,
          paddingBottom: 40,
        }}
      >
        {/* Uygulama */}
        <View style={{ alignItems: "center", gap: 6, paddingVertical: spacing.lg }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: fontWeight.heavy,
              color: colors.text,
            }}
          >
            Sahne
          </Text>
          <Text style={{ fontSize: fontSize.sm, color: colors.textDim }}>
            Sürüm {APP_VERSION}
          </Text>
        </View>

        {/* TMDB atıf */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: radius.xl,
            borderWidth: 1,
            borderColor: colors.border,
            padding: spacing.lg,
            gap: 10,
          }}
        >
          <Text
            style={{
              fontSize: fontSize.md,
              fontWeight: fontWeight.heavy,
              color: colors.text,
            }}
          >
            Veri Kaynakları
          </Text>

          <Text
            style={{
              fontSize: fontSize.sm,
              color: colors.textDim,
              lineHeight: 20,
            }}
          >
            Dizi ve film verileri için TMDB kullanılmaktadır. Bu uygulama TMDB
            tarafından onaylanmamış veya sertifikalanmamıştır.
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: colors.textFaint,
              fontStyle: "italic",
            }}
          >
            This product uses the TMDB API but is not endorsed or certified by
            TMDB.
          </Text>

          <Pressable
            onPress={() => Linking.openURL("https://www.themoviedb.org")}
          >
            <Text
              style={{
                fontSize: fontSize.sm,
                color: colors.accent,
                fontWeight: fontWeight.bold,
              }}
            >
              themoviedb.org
            </Text>
          </Pressable>

          <View
            style={{
              height: 1,
              backgroundColor: colors.border,
              marginVertical: 4,
            }}
          />

          <Text
            style={{
              fontSize: fontSize.sm,
              color: colors.textDim,
              lineHeight: 20,
            }}
          >
            Kitap verileri Google Books tarafından sağlanmaktadır.
          </Text>
          <Pressable
            onPress={() => Linking.openURL("https://books.google.com")}
          >
            <Text
              style={{
                fontSize: fontSize.sm,
                color: colors.accent,
                fontWeight: fontWeight.bold,
              }}
            >
              books.google.com
            </Text>
          </Pressable>
        </View>

        {/* Yasal */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: radius.xl,
            borderWidth: 1,
            borderColor: colors.border,
            padding: spacing.lg,
            gap: 12,
          }}
        >
          <Pressable onPress={() => router.push("/legal/privacy")}>
            <Text style={{ fontSize: fontSize.md, color: colors.text }}>
              Gizlilik Politikası
            </Text>
          </Pressable>
          <View style={{ height: 1, backgroundColor: colors.border }} />
          <Pressable onPress={() => router.push("/legal/terms")}>
            <Text style={{ fontSize: fontSize.md, color: colors.text }}>
              Kullanım Koşulları
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}