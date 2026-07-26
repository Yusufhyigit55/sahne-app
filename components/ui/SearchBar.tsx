import { View, TextInput, Pressable, Text } from "react-native";
import { Search, X } from "lucide-react-native";
import { useTheme } from "@/lib/store/theme";

type Props = {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  showSearchButton?: boolean;
};

export function SearchBar({
  value,
  onChangeText,
  placeholder,
  onSubmit,
  showSearchButton,
}: Props) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 12,
          paddingHorizontal: 14,
        }}
      >
        <Search size={17} color={colors.textDim} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          returnKeyType="search"
          placeholder={placeholder ?? "Ara..."}
          placeholderTextColor={colors.textFaint}
          autoCapitalize="none"
          autoCorrect={false}
          style={{
            flex: 1,
            paddingVertical: 13,
            fontSize: 13.5,
            color: colors.text,
          }}
        />
        {value.length > 0 && (
          <Pressable onPress={() => onChangeText("")} hitSlop={10}>
            <X size={16} color={colors.textDim} />
          </Pressable>
        )}
      </View>

      {showSearchButton && (
        <Pressable
          onPress={onSubmit}
          style={{
            backgroundColor: colors.accent,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 13,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontSize: 13.5,
              fontWeight: "800",
              color: colors.accentText,
            }}
          >
            Ara
          </Text>
        </Pressable>
      )}
    </View>
  );
}