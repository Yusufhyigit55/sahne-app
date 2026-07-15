import { View, Text } from "react-native";
import { useTheme } from "@/lib/store/theme";

type Props = {
  kind: "tmdb" | "sahne";
  value: number | null;
};

export function RatingBadge({ kind, value }: Props) {
  const { colors } = useTheme();

  if (value == null) return null;

  const isTmdb = kind === "tmdb";

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: isTmdb ? colors.surface : colors.accentSoft,
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 12,
      }}
    >
      {isTmdb ? (
        <Text style={{ fontSize: 11, fontWeight: "800", color: colors.imdb }}>
          TMDB
        </Text>
      ) : (
        <Text style={{ fontSize: 13, color: colors.accent }}>★</Text>
      )}

      <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text }}>
        {value}
        {!isTmdb && " Sahne"}
      </Text>
    </View>
  );
}