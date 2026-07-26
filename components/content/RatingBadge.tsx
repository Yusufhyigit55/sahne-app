import { View, Text } from "react-native";
import { useTheme } from "@/lib/store/theme";

type Props = {
  kind: "tmdb" | "sahne";
  value: number | null;
  count?: number; // kaç Tracks kullanıcısı puan verdi (opsiyonel)
};

export function RatingBadge({ kind, value, count }: Props) {
  const { colors } = useTheme();
  const isTmdb = kind === "tmdb";

  // TMDB puanı yoksa gizle; Tracks puanı yoksa "Henüz yok" göster (kullanıcı bilsin)
  if (isTmdb && value == null) return null;

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
        <Text style={{ fontSize: 11, fontWeight: "800", color: colors.accent }}>
          TRACKS
        </Text>
      )}
      <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text }}>
        {value != null ? value : "—"}
      </Text>
      {!isTmdb && value != null && count != null && count > 0 && (
        <Text style={{ fontSize: 10, color: colors.textDim }}>
          ({count})
        </Text>
      )}
    </View>
  );
}