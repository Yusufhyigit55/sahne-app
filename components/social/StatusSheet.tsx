import { View, Text, Pressable, Modal } from "react-native";
import { Check, X } from "lucide-react-native";
import { useTheme } from "@/lib/store/theme";
import type { WatchStatus } from "@/lib/queries/watch";

type Option = {
  key: WatchStatus;
  label: string;
  desc: string;
};

const SERIES_OPTIONS: Option[] = [
  {
    key: "watching",
    label: "İzliyorum",
    desc: "Aktif olarak takip ediyorum",
  },
  {
    key: "paused",
    label: "Askıya Al",
    desc: "Ara verdim, sonra devam edeceğim",
  },
  {
    key: "dropped",
    label: "Yarım Bıraktım",
    desc: "Bitirmeyeceğim",
  },
  {
    key: "watchlist",
    label: "İzleme Listesine Taşı",
    desc: "Sonra izleyeceğim",
  },
  {
    key: "none",
    label: "Durumu Kaldır",
    desc: "İzleme kaydını sıfırla",
  },
];

const BOOK_OPTIONS: Option[] = [
  {
    key: "reading",
    label: "Okuyorum",
    desc: "Aktif olarak okuyorum",
  },
  {
    key: "paused",
    label: "Askıya Al",
    desc: "Ara verdim",
  },
  {
    key: "dropped",
    label: "Yarım Bıraktım",
    desc: "Bitirmeyeceğim",
  },
  {
    key: "watchlist",
    label: "Okuma Listesine Taşı",
    desc: "Sonra okuyacağım",
  },
  {
    key: "none",
    label: "Durumu Kaldır",
    desc: "Okuma kaydını sıfırla",
  },
];

export function StatusSheet({
  visible,
  onClose,
  type,
  current,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  type: "series" | "movie" | "book";
  current: WatchStatus | null;
  onSelect: (status: WatchStatus) => void;
}) {
  const { colors } = useTheme();

  const options = type === "book" ? BOOK_OPTIONS : SERIES_OPTIONS;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.55)",
          justifyContent: "flex-end",
        }}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: colors.bg,
            borderTopLeftRadius: 22,
            borderTopRightRadius: 22,
            paddingTop: 10,
            paddingBottom: 34,
          }}
        >
          {/* Tutamaç */}
          <View
            style={{
              width: 38,
              height: 4,
              borderRadius: 100,
              backgroundColor: colors.border,
              alignSelf: "center",
              marginBottom: 16,
            }}
          />

          {/* Başlık */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 20,
              paddingBottom: 14,
            }}
          >
            <Text
              style={{ fontSize: 17, fontWeight: "800", color: colors.text }}
            >
              Durum Seç
            </Text>

            <Pressable
              onPress={onClose}
              style={{
                width: 30,
                height: 30,
                borderRadius: 100,
                backgroundColor: colors.surface,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={16} color={colors.textDim} />
            </Pressable>
          </View>

          {/* Seçenekler */}
          {options.map((opt, i) => {
            const active = current === opt.key;
            const isDanger = opt.key === "none" || opt.key === "dropped";

            return (
              <Pressable
                key={opt.key}
                onPress={() => {
                  onSelect(opt.key);
                  onClose();
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  paddingVertical: 14,
                  paddingHorizontal: 20,
                  backgroundColor: active ? colors.accentSoft : "transparent",
                  borderTopWidth: i === 0 ? 1 : 0,
                  borderBottomWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <View style={{ flex: 1, gap: 2 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: active
                        ? colors.accent
                        : isDanger
                        ? colors.textDim
                        : colors.text,
                    }}
                  >
                    {opt.label}
                  </Text>
                  <Text style={{ fontSize: 11.5, color: colors.textFaint }}>
                    {opt.desc}
                  </Text>
                </View>

                {active && (
                  <Check size={17} color={colors.accent} strokeWidth={3} />
                )}
              </Pressable>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
}