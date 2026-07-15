// components/stats/BadgeGrid.tsx : Kazanılan/kilitli rozetleri ızgara halinde gösterir.
import { View, Text } from "react-native";
import { useTheme } from "@/lib/store/theme";
import { fontSize, fontWeight } from "@/theme";
import type { Badge } from "@/lib/queries/stats";

export function BadgeGrid({ badges }: { badges: Badge[] }) {
  const { colors } = useTheme();

  // Kazanılanlar önce
  const sorted = [...badges].sort(
    (a, b) => Number(b.earned) - Number(a.earned)
  );

  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      {sorted.map((b) => (
        <View
          key={b.key}
          style={{
            width: "22%",
            alignItems: "center",
            gap: 4,
            opacity: b.earned ? 1 : 0.3,
          }}
        >
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              backgroundColor: b.earned ? colors.accentSoft : colors.surface,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: b.earned ? 1.5 : 1,
              borderColor: b.earned ? colors.accent : colors.border,
            }}
          >
            <Text style={{ fontSize: 24 }}>{b.emoji}</Text>
          </View>
          <Text
            style={{
              fontSize: 9,
              fontWeight: fontWeight.bold,
              color: b.earned ? colors.text : colors.textDim,
              textAlign: "center",
            }}
            numberOfLines={2}
          >
            {b.title}
          </Text>
        </View>
      ))}
    </View>
  );
}