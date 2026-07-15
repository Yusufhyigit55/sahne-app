import { View, Text, Pressable } from "react-native";
import { useTheme } from "@/lib/store/theme";

type Props = {
  value: number | null;
  onChange: (v: number | null) => void;
  max?: 5 | 10;
  size?: number;
};

export function StarRating({ value, onChange, max = 5, size = 30 }: Props) {
  const { colors } = useTheme();

  const handlePress = (n: number) => {
    // Aynı yıldıza tekrar basınca puanı kaldır
    onChange(value === n ? null : n);
  };

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "center",
        gap: max === 10 ? 5 : 10,
      }}
    >
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
        <Pressable key={n} onPress={() => handlePress(n)} hitSlop={4}>
          <Text
            style={{
              fontSize: size,
              color:
                value != null && n <= value ? colors.accent : colors.textFaint,
            }}
          >
            ★
          </Text>
        </Pressable>
      ))}
    </View>
  );
}