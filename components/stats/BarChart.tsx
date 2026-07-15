// components/stats/BarChart.tsx : İstatistikler için basit dikey bar grafik. Son sütun vurgulanır (yeşil).
import { View, Text } from "react-native";
import { useTheme } from "@/lib/store/theme";
import { fontSize, fontWeight } from "@/theme";

export type BarPoint = { label: string; value: number };

type Props = {
  data: BarPoint[];
  /** Y ekseni etiketi (örn. "BÖLÜMLER", "SAAT") */
  unit?: string;
  /** Son sütunu vurgula (aktif hafta) */
  highlightLast?: boolean;
  height?: number;
};

export function BarChart({
  data,
  unit,
  highlightLast = true,
  height = 160,
}: Props) {
  const { colors } = useTheme();

  if (data.length === 0) {
    return (
      <View
        style={{
          height,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: colors.textDim, fontSize: fontSize.sm }}>
          Henüz veri yok
        </Text>
      </View>
    );
  }

  const max = Math.max(...data.map((d) => d.value), 1);
  const barAreaHeight = height - 40; // etiketler + değerler için pay

  return (
    <View style={{ flexDirection: "row", height }}>
      {/* Y ekseni etiketi (dikey) */}
      {unit ? (
        <View
          style={{
            width: 16,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: colors.textDim,
              fontSize: 9,
              fontWeight: fontWeight.bold,
              transform: [{ rotate: "-90deg" }],
              width: barAreaHeight,
              textAlign: "center",
              letterSpacing: 1,
            }}
            numberOfLines={1}
          >
            {unit}
          </Text>
        </View>
      ) : null}

      {/* Sütunlar */}
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "flex-end",
          justifyContent: "space-between",
        }}
      >
        {data.map((d, i) => {
          const isLast = i === data.length - 1;
          const barColor =
            highlightLast && isLast ? colors.accent : colors.border;
          const barHeight =
            d.value > 0 ? Math.max((d.value / max) * barAreaHeight, 4) : 0;

          return (
            <View
              key={i}
              style={{ flex: 1, alignItems: "center", gap: 4 }}
            >
              {/* Değer */}
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: fontWeight.bold,
                  color: d.value > 0 ? colors.text : colors.textDim,
                }}
              >
                {d.value}
              </Text>

              {/* Bar */}
              <View
                style={{
                  width: "60%",
                  height: barHeight,
                  backgroundColor: barColor,
                  borderRadius: 3,
                }}
              />

              {/* Etiket */}
              <Text
                style={{
                  fontSize: 10,
                  color: colors.textDim,
                }}
                numberOfLines={1}
              >
                {d.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}