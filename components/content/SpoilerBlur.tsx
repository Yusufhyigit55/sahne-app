import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useTheme } from "@/lib/store/theme";

type Props = {
  text: string;
  hidden: boolean;
  label?: string;
};

export function SpoilerBlur({ text, hidden, label }: Props) {
  const { colors } = useTheme();
  const [revealed, setRevealed] = useState(!hidden);

  if (!text) return null;

  if (revealed) {
    return (
      <Text style={{ fontSize: 13.5, lineHeight: 22, color: colors.textDim }}>
        {text}
      </Text>
    );
  }

  return (
    <View style={{ position: "relative", borderRadius: 12, overflow: "hidden" }}>
      <Text
        style={{
          fontSize: 13.5,
          lineHeight: 22,
          color: colors.textDim,
          opacity: 0.25,
        }}
        numberOfLines={4}
      >
        {text}
      </Text>

      <Pressable
        onPress={() => setRevealed(true)}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            backgroundColor: colors.accent,
            paddingVertical: 9,
            paddingHorizontal: 18,
            borderRadius: 100,
          }}
        >
          <Text
            style={{
              fontSize: 12.5,
              fontWeight: "800",
              color: colors.accentText,
            }}
          >
            {label ?? "Konuyu Göster"}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}