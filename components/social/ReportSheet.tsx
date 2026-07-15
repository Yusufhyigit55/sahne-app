import { useState } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useTheme } from "@/lib/store/theme";
import { useReportComment, type Comment } from "@/lib/queries/comment";

const REASONS = [
  { key: "unmarked_spoiler", label: "İşaretlenmemiş spoiler" },
  { key: "harassment", label: "Hakaret / küfür" },
  { key: "spam", label: "Spam / reklam" },
  { key: "inappropriate", label: "Uygunsuz içerik" },
  { key: "targeting", label: "Taciz / hedef gösterme" },
];

type Props = {
  comment: Comment | null;
  onClose: () => void;
};

export function ReportSheet({ comment, onClose }: Props) {
  const { colors } = useTheme();
  const report = useReportComment();
  const [selected, setSelected] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!comment || !selected) return;

    report.mutate(
      { commentId: comment.id, reason: selected },
      {
        onSuccess: () => {
          Alert.alert(
            "Bildirimin alındı",
            "Yorumu inceleyeceğiz. Teşekkürler."
          );
          setSelected(null);
          onClose();
        },
        onError: (err: any) => {
          const msg = err?.response?.data?.error ?? "Bildirim gönderilemedi";
          Alert.alert("Hata", msg);
          onClose();
        },
      }
    );
  };

  return (
    <Modal
      visible={!!comment}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "flex-end",
        }}
        onPress={onClose}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: colors.surfaceAlt,
            borderTopLeftRadius: 22,
            borderTopRightRadius: 22,
            padding: 20,
            paddingBottom: 34,
            gap: 18,
          }}
        >
          {/* Tutamaç */}
          <View
            style={{
              width: 40,
              height: 4,
              backgroundColor: colors.textFaint,
              borderRadius: 100,
              alignSelf: "center",
            }}
          />

          <View style={{ gap: 4 }}>
            <Text
              style={{ fontSize: 16, fontWeight: "800", color: colors.text }}
            >
              Yorumu Bildir
            </Text>
            <Text style={{ fontSize: 12, color: colors.textDim }}>
              Neden bildirdiğini seç
            </Text>
          </View>

          {/* Sebepler */}
          <View style={{ gap: 8 }}>
            {REASONS.map((r) => {
              const active = selected === r.key;
              return (
                <Pressable
                  key={r.key}
                  onPress={() => setSelected(r.key)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 11,
                    backgroundColor: active ? colors.accentSoft : colors.surface,
                    borderWidth: 1,
                    borderColor: active ? colors.accent : colors.border,
                    borderRadius: 11,
                    paddingVertical: 13,
                    paddingHorizontal: 14,
                  }}
                >
                  <View
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 100,
                      borderWidth: 2,
                      borderColor: active ? colors.accent : colors.textFaint,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {active && (
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 100,
                          backgroundColor: colors.accent,
                        }}
                      />
                    )}
                  </View>

                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: colors.text,
                    }}
                  >
                    {r.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Butonlar */}
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Pressable
              onPress={onClose}
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                borderRadius: 12,
                paddingVertical: 14,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  color: colors.textDim,
                }}
              >
                Vazgeç
              </Text>
            </Pressable>

            <Pressable
              onPress={handleSubmit}
              disabled={!selected || report.isPending}
              style={{
                flex: 1,
                backgroundColor: selected ? colors.danger : colors.border,
                borderRadius: 12,
                paddingVertical: 14,
                alignItems: "center",
              }}
            >
              {report.isPending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "800",
                    color: selected ? "#fff" : colors.textFaint,
                  }}
                >
                  Bildir
                </Text>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}