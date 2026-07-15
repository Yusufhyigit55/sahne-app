// components/profile/TasteProfileCard.tsx : Kullanıcının zevk profili içgörülerini kart listesi olarak gösterir.
import { View, Text } from "react-native";
import { Sparkles } from "lucide-react-native";
import { useTheme } from "@/lib/store/theme";
import { useTasteProfile } from "@/lib/queries/tasteProfile";
import {
  SCREEN_PADDING,
  spacing,
  fontSize,
  fontWeight,
  radius,
} from "@/theme";

/** Sadece kendi profilinde gösterilir (enabled ile kontrol edilir). */
export function TasteProfileCard({ enabled = true }: { enabled?: boolean }) {
  const { colors } = useTheme();
  const { data, isLoading } = useTasteProfile(enabled);

  // Yükleniyor veya hiç içgörü yoksa bölümü hiç gösterme
  if (!enabled || isLoading) return null;
  if (!data) return null;

  // Yeterli veri yoksa nazik bir mesaj
  if (data.needsMoreData || data.insights.length === 0) {
    return (
      <View style={{ marginTop: spacing.section, gap: spacing.lg }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
            paddingHorizontal: SCREEN_PADDING,
          }}
        >
          <Sparkles size={17} color={colors.accent} />
          <Text
            style={{
              fontSize: fontSize.xl,
              fontWeight: fontWeight.heavy,
              color: colors.text,
            }}
          >
            Zevk Profilin
          </Text>
        </View>

        <View
          style={{
            marginHorizontal: SCREEN_PADDING,
            backgroundColor: colors.surface,
            borderRadius: radius.xl,
            padding: spacing.xxl,
            alignItems: "center",
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
            Biraz daha izle, seni tanımaya başlayalım.{"\n"}
            İzledikçe zevk profilin burada belirecek.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ marginTop: spacing.section, gap: spacing.lg }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.sm,
          paddingHorizontal: SCREEN_PADDING,
        }}
      >
        <Sparkles size={17} color={colors.accent} />
        <Text
          style={{
            fontSize: fontSize.xl,
            fontWeight: fontWeight.heavy,
            color: colors.text,
          }}
        >
          Zevk Profilin
        </Text>
      </View>

      <View style={{ paddingHorizontal: SCREEN_PADDING, gap: spacing.md }}>
        {data.insights.map((ins) => (
          <View
            key={ins.key}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.md,
              backgroundColor: colors.surface,
              borderRadius: radius.lg,
              borderWidth: 1,
              borderColor: colors.border,
              padding: spacing.lg,
            }}
          >
            {/* Emoji rozeti */}
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: radius.pill,
                backgroundColor: colors.accentSoft,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 22 }}>{ins.emoji}</Text>
            </View>

            <View style={{ flex: 1, gap: 3 }}>
              <Text
                style={{
                  fontSize: fontSize.md,
                  fontWeight: fontWeight.heavy,
                  color: colors.text,
                }}
              >
                {ins.title}
              </Text>
              <Text
                style={{
                  fontSize: fontSize.sm,
                  color: colors.textDim,
                  lineHeight: 19,
                }}
              >
                {ins.detail}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}