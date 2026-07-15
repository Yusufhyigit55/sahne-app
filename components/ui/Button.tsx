import { Pressable, Text, ActivityIndicator, View } from "react-native";
import { useTheme } from "@/lib/store/theme";

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "ghost";
};

export function Button({
  label,
  onPress,
  loading,
  disabled,
  variant = "primary",
}: Props) {
  const { colors } = useTheme();
  const isPrimary = variant === "primary";
  const off = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={off}
      style={{
        backgroundColor: isPrimary ? colors.accent : colors.surface,
        borderRadius: 12,
        paddingVertical: 15,
        alignItems: "center",
        justifyContent: "center",
        opacity: off ? 0.5 : 1,
      }}
    >
      {loading ? (
        <ActivityIndicator
          color={isPrimary ? colors.accentText : colors.accent}
          size="small"
        />
      ) : (
        <Text
          style={{
            color: isPrimary ? colors.accentText : colors.text,
            fontWeight: "800",
            fontSize: 14,
          }}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}