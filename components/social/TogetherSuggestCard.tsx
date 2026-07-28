// components/social/TogetherSuggestCard.tsx : En uyumlu arkadaşla "Birlikte İzleyelim" kısayol kartı.
import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Sparkles } from "lucide-react-native";
import { useTheme } from "@/lib/store/theme";
import { useSuggestedUsers } from "@/lib/queries/socialGraph";
import { spacing, fontSize, fontWeight, radius } from "@/theme";

export function TogetherSuggestCard() {
  const { colors } = useTheme();
  const { data: users } = useSuggestedUsers();

  // En uyumlu arkadaş
  const top = users && users.length > 0 ? users[0] : null;
  if (!top || top.compatibility < 40) return null; // düşük uyumda gösterme

  return (
    <Pressable
      onPress={() => router.push(`/together/${top.username}`)}
      style={{
        marginHorizontal: 18,
        marginBottom: spacing.lg,
        backgroundColor: colors.surface,
        borderRadius: radius.xl,
        padding: spacing.md,
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        borderWidth: 1,
        borderColor: colors.accent + "33",
      }}
    >
      {top.avatar ? (
        <Image
          source={{ uri: top.avatar }}
          style={{ width: 48, height: 48, borderRadius: 24 }}
        />
      ) : (
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: colors.surfaceAlt,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: colors.textDim, fontSize: 20 }}>
            {top.displayName?.[0] ?? top.username[0]}
          </Text>
        </View>
      )}

      <View style={{ flex: 1 }}>
        <View
          style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
        >
          <Sparkles size={14} color={colors.accent} />
          <Text
            style={{
              fontSize: fontSize.sm,
              fontWeight: fontWeight.heavy,
              color: colors.accent,
            }}
          >
            %{top.compatibility} uyumlusunuz
          </Text>
        </View>
        <Text
          style={{
            fontSize: fontSize.md,
            fontWeight: fontWeight.bold,
            color: colors.text,
            marginTop: 2,
          }}
          numberOfLines={1}
        >
          {top.displayName || top.username} ile ne izleseniz?
        </Text>
        <Text
          style={{
            fontSize: fontSize.xs,
            color: colors.textDim,
            marginTop: 1,
          }}
        >
          Birlikte izleyebileceğiniz içerikleri keşfet
        </Text>
      </View>
    </Pressable>
  );
}