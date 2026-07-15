import { Pressable, Text } from "react-native";
import { useTheme } from "@/lib/store/theme";
import { radius, fontSize, fontWeight } from "@/theme";

export function Chip({
  label,
  active,
  onPress,
  size = "md",
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  size?: "sm" | "md";
}) {
  const { colors } = useTheme();

  const isSmall = size === "sm";

  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: active ? colors.accent : colors.surface,
        borderWidth: 1,
        borderColor: active ? colors.accent : colors.border,
        borderRadius: radius.pill,
        paddingVertical: isSmall ? 8 : 11,
        paddingHorizontal: isSmall ? 15 : 19,
      }}
    >
      <Text
        style={{
          fontSize: isSmall ? fontSize.sm : fontSize.md,
          fontWeight: fontWeight.bold,
          color: active ? colors.accentText : colors.textDim,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}