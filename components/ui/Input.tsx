import { View, Text, TextInput, Pressable } from "react-native";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react-native";
import { useTheme } from "@/lib/store/theme";

type Props = {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  secure?: boolean;
  error?: string;
  autoCapitalize?: "none" | "sentences";
  keyboardType?: "default" | "email-address";
};

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secure,
  error,
  autoCapitalize = "none",
  keyboardType = "default",
}: Props) {
  const { colors } = useTheme();
  const [hidden, setHidden] = useState(!!secure);

  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontSize: 12.5, fontWeight: "700", color: colors.textDim }}>
        {label}
      </Text>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: error ? colors.danger : colors.border,
          borderRadius: 12,
          paddingHorizontal: 14,
        }}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textFaint}
          secureTextEntry={hidden}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          keyboardType={keyboardType}
          style={{
            flex: 1,
            paddingVertical: 14,
            fontSize: 14,
            color: colors.text,
          }}
        />

        {secure && (
          <Pressable onPress={() => setHidden(!hidden)} hitSlop={10}>
            {hidden ? (
              <EyeOff size={18} color={colors.textDim} />
            ) : (
              <Eye size={18} color={colors.textDim} />
            )}
          </Pressable>
        )}
      </View>

      {error && (
        <Text style={{ fontSize: 11.5, color: colors.danger }}>{error}</Text>
      )}
    </View>
  );
}