import { View, Text, Pressable } from "react-native";
import { useTheme } from "@/lib/store/theme";
import { REACTIONS } from "@/lib/queries/review";

type Props = {
  selected: string[];
  onChange: (v: string[]) => void;
  stats?: Record<string, { count: number; percent: number }>;
};

export function ReactionPicker({ selected, onChange, stats }: Props) {
  const { colors } = useTheme();

  const toggle = (key: string) => {
    if (selected.includes(key)) {
      onChange(selected.filter((k) => k !== key));
    } else {
      if (selected.length >= 5) return; // Max 5
      onChange([...selected, key]);
    }
  };

  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        justifyContent: "center",
      }}
    >
      {REACTIONS.map((r) => {
        const active = selected.includes(r.key);
        const pct = stats?.[r.key]?.percent;

        return (
          <Pressable
            key={r.key}
            onPress={() => toggle(r.key)}
            style={{
              width: "31%",
              alignItems: "center",
              paddingVertical: 11,
              paddingHorizontal: 6,
              borderRadius: 12,
              backgroundColor: active ? colors.accentSoft : colors.surface,
              borderWidth: 1,
              borderColor: active ? colors.accent : colors.border,
            }}
          >
            <Text style={{ fontSize: 20 }}>{r.emoji}</Text>
            <Text
              style={{
                fontSize: 11,
                fontWeight: "700",
                color: colors.text,
                marginTop: 5,
                textAlign: "center",
              }}
              numberOfLines={1}
            >
              {r.label}
            </Text>

            {pct != null && pct > 0 && (
              <Text
                style={{
                  fontSize: 10,
                  color: colors.accent,
                  marginTop: 2,
                  fontWeight: "700",
                }}
              >
                %{pct}
              </Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}