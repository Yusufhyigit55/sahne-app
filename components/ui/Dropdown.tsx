import { useState } from "react";
import { View, Text, Pressable, Modal } from "react-native";
import { ChevronDown, Check } from "lucide-react-native";
import { useTheme } from "@/lib/store/theme";

export type DropdownOption = {
  key: string;
  label: string;
  count?: number;
};

export function Dropdown({
  options,
  value,
  onSelect,
  placeholder = "Seç",
}: {
  options: DropdownOption[];
  value: string;
  onSelect: (key: string) => void;
  placeholder?: string;
}) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);

  const selected = options.find((o) => o.key === value);
  const isDefault = value === "all";

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 5,
          backgroundColor: isDefault ? colors.surface : colors.accentSoft,
          borderWidth: 1,
          borderColor: isDefault ? colors.border : colors.accent,
          borderRadius: 100,
          paddingVertical: 7,
          paddingHorizontal: 13,
        }}
      >
        <Text
          style={{
            fontSize: 12,
            fontWeight: "700",
            color: isDefault ? colors.textDim : colors.accent,
          }}
        >
          {selected?.label ?? placeholder}
        </Text>
        <ChevronDown
          size={13}
          color={isDefault ? colors.textDim : colors.accent}
        />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          onPress={() => setOpen(false)}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            paddingHorizontal: 40,
          }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: colors.bg,
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            {options.map((opt, i) => {
              const active = value === opt.key;

              return (
                <Pressable
                  key={opt.key}
                  onPress={() => {
                    onSelect(opt.key);
                    setOpen(false);
                  }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    paddingVertical: 14,
                    paddingHorizontal: 18,
                    backgroundColor: active
                      ? colors.accentSoft
                      : "transparent",
                    borderBottomWidth: i === options.length - 1 ? 0 : 1,
                    borderBottomColor: colors.border,
                  }}
                >
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 14,
                      fontWeight: active ? "800" : "600",
                      color: active ? colors.accent : colors.text,
                    }}
                  >
                    {opt.label}
                  </Text>

                  {opt.count != null && opt.count > 0 && (
                    <Text
                      style={{
                        fontSize: 12.5,
                        fontWeight: "700",
                        color: active ? colors.accent : colors.textFaint,
                      }}
                    >
                      {opt.count}
                    </Text>
                  )}

                  {active && (
                    <Check size={16} color={colors.accent} strokeWidth={3} />
                  )}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}