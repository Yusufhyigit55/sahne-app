import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/lib/store/theme";
import { spacing, fontSize, fontWeight, radius, shadow } from "@/theme";

export function StatCard({
  value,
  label,
  sub,
  Icon,
  accent,
  wide,
}: {
  value: string;
  label: string;
  sub?: string;
  Icon?: any;
  accent?: boolean;
  wide?: boolean;
}) {
  const { colors, name } = useTheme();

  const isDark = name === "dark";

  const gradientColors: [string, string] = accent
    ? isDark
      ? ["rgba(45, 212, 191, 0.22)", "rgba(45, 212, 191, 0.06)"]
      : ["rgba(13, 148, 136, 0.16)", "rgba(13, 148, 136, 0.04)"]
    : isDark
    ? [colors.surfaceRaised, colors.surface]
    : [colors.surface, colors.surfaceAlt];

  return (
    <View
      style={{
        minWidth: wide ? 190 : 140,
        borderRadius: radius.xl,
        ...shadow.md,
        shadowColor: colors.shadowColor,
      }}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: radius.xl,
          borderWidth: 1,
          borderColor: accent ? colors.accent : colors.borderLight,
          paddingVertical: spacing.lg,
          paddingHorizontal: spacing.lg,
          gap: spacing.xs,
          overflow: "hidden",
        }}
      >
        {/* Arka plan ikonu — dev, silik */}
        {Icon && (
          <View
            style={{
              position: "absolute",
              right: -12,
              bottom: -12,
              opacity: accent ? 0.14 : 0.07,
            }}
          >
            <Icon size={82} color={accent ? colors.accent : colors.text} />
          </View>
        )}

        {/* Ön plan ikonu */}
        {Icon && (
          <Icon
            size={15}
            color={accent ? colors.accent : colors.textFaint}
            style={{ marginBottom: 3 }}
          />
        )}

        <Text
          style={{
            fontSize: fontSize.display,
            fontWeight: fontWeight.heavy,
            color: accent ? colors.accent : colors.text,
            letterSpacing: -0.6,
          }}
          numberOfLines={1}
        >
          {value}
        </Text>

        <Text
          style={{
            fontSize: fontSize.xs,
            fontWeight: fontWeight.medium,
            color: colors.textDim,
          }}
        >
          {label}
        </Text>

        {sub && (
          <Text
            style={{
              fontSize: 10,
              color: colors.textFaint,
              marginTop: 1,
            }}
            numberOfLines={1}
          >
            {sub}
          </Text>
        )}
      </LinearGradient>
    </View>
  );
}