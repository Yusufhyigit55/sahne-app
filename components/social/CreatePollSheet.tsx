// components/social/CreatePollSheet.tsx : Alttan açılan anket oluşturma paneli; tip seçimi, soru, seçenekler ve spoiler anahtarı.
import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { X, Plus, Trash2 } from "lucide-react-native";
import { useTheme } from "@/lib/store/theme";
import { PollType, POLL_TYPE_LABELS, useCreatePoll } from "@/lib/queries/poll";
import { apiError } from "@/lib/api";

type Props = {
  visible: boolean;
  onClose: () => void;
  type: string;
  tmdbId: number | string;
};

const TYPE_ORDER: PollType[] = ["single", "multiple", "yesno", "prediction"];

export function CreatePollSheet({ visible, onClose, type, tmdbId }: Props) {
  const { colors } = useTheme();
  const create = useCreatePoll(type, tmdbId);

  const [pollType, setPollType] = useState<PollType>("single");
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [isSpoiler, setIsSpoiler] = useState(false);

  const needsOptions = pollType !== "yesno";

  const reset = () => {
    setPollType("single");
    setQuestion("");
    setOptions(["", ""]);
    setIsSpoiler(false);
  };

  const addOption = () => {
    if (options.length >= 6) return;
    setOptions([...options, ""]);
  };

  const removeOption = (i: number) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, idx) => idx !== i));
  };

  const setOption = (i: number, val: string) => {
    setOptions(options.map((o, idx) => (idx === i ? val : o)));
  };

  const submit = () => {
    if (question.trim().length < 3) {
      Alert.alert("Eksik", "Soru en az 3 karakter olmalı.");
      return;
    }

    const cleaned = options.map((o) => o.trim()).filter((o) => o.length > 0);

    if (needsOptions && cleaned.length < 2) {
      Alert.alert("Eksik", "En az 2 seçenek gerekli.");
      return;
    }

    create.mutate(
      {
        question: question.trim(),
        pollType,
        options: needsOptions ? cleaned : [],
        isSpoiler,
      },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
        onError: (err) => {
          Alert.alert("Hata", apiError(err));
        },
      }
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, justifyContent: "flex-end" }}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
          onPress={onClose}
        />

        <View
          style={{
            backgroundColor: colors.bg,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingHorizontal: 22,
            paddingTop: 16,
            paddingBottom: 32,
            maxHeight: "88%",
          }}
        >
          {/* Başlık */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 18,
            }}
          >
            <Text
              style={{ fontSize: 17, fontWeight: "800", color: colors.text }}
            >
              Anket Oluştur
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <X size={22} color={colors.textDim} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Anket tipi */}
            <Text
              style={{
                fontSize: 12.5,
                fontWeight: "700",
                color: colors.textDim,
                marginBottom: 8,
              }}
            >
              ANKET TİPİ
            </Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 20,
              }}
            >
              {TYPE_ORDER.map((t) => {
                const active = pollType === t;
                return (
                  <Pressable
                    key={t}
                    onPress={() => setPollType(t)}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 9,
                      borderRadius: 100,
                      backgroundColor: active ? colors.accent : colors.surface,
                      borderWidth: 1,
                      borderColor: active ? colors.accent : colors.border,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "700",
                        color: active ? colors.accentText : colors.text,
                      }}
                    >
                      {POLL_TYPE_LABELS[t]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Soru */}
            <Text
              style={{
                fontSize: 12.5,
                fontWeight: "700",
                color: colors.textDim,
                marginBottom: 8,
              }}
            >
              SORU
            </Text>
            <TextInput
              value={question}
              onChangeText={setQuestion}
              placeholder="Örn. En iyi sezon hangisiydi?"
              placeholderTextColor={colors.textFaint}
              maxLength={200}
              multiline
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 12,
                padding: 14,
                fontSize: 15,
                color: colors.text,
                marginBottom: 20,
                minHeight: 52,
              }}
            />

            {/* Seçenekler (yesno hariç) */}
            {needsOptions && (
              <>
                <Text
                  style={{
                    fontSize: 12.5,
                    fontWeight: "700",
                    color: colors.textDim,
                    marginBottom: 8,
                  }}
                >
                  SEÇENEKLER ({options.length}/6)
                </Text>

                {options.map((opt, i) => (
                  <View
                    key={i}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 8,
                    }}
                  >
                    <TextInput
                      value={opt}
                      onChangeText={(v) => setOption(i, v)}
                      placeholder={`Seçenek ${i + 1}`}
                      placeholderTextColor={colors.textFaint}
                      maxLength={100}
                      style={{
                        flex: 1,
                        backgroundColor: colors.surface,
                        borderWidth: 1,
                        borderColor: colors.border,
                        borderRadius: 12,
                        paddingVertical: 12,
                        paddingHorizontal: 14,
                        fontSize: 14,
                        color: colors.text,
                      }}
                    />
                    {options.length > 2 && (
                      <Pressable onPress={() => removeOption(i)} hitSlop={6}>
                        <Trash2 size={18} color={colors.textFaint} />
                      </Pressable>
                    )}
                  </View>
                ))}

                {options.length < 6 && (
                  <Pressable
                    onPress={addOption}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                      paddingVertical: 10,
                      marginBottom: 12,
                    }}
                  >
                    <Plus size={16} color={colors.accent} />
                    <Text
                      style={{
                        fontSize: 13.5,
                        fontWeight: "700",
                        color: colors.accent,
                      }}
                    >
                      Seçenek ekle
                    </Text>
                  </Pressable>
                )}
              </>
            )}

            {/* Spoiler anahtarı */}
            <Pressable
              onPress={() => setIsSpoiler(!isSpoiler)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 14,
                paddingHorizontal: 14,
                borderRadius: 12,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: isSpoiler ? colors.warn : colors.border,
                marginTop: 8,
                marginBottom: 20,
              }}
            >
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: colors.text,
                  }}
                >
                  Spoiler içeriyor
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.textDim,
                    marginTop: 2,
                  }}
                >
                  İzlemeyenlere bulanık gösterilir
                </Text>
              </View>
              <View
                style={{
                  width: 46,
                  height: 28,
                  borderRadius: 100,
                  backgroundColor: isSpoiler ? colors.warn : colors.border,
                  padding: 3,
                  justifyContent: "center",
                }}
              >
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 100,
                    backgroundColor: "#fff",
                    alignSelf: isSpoiler ? "flex-end" : "flex-start",
                  }}
                />
              </View>
            </Pressable>

            {/* Gönder */}
            <Pressable
              onPress={submit}
              disabled={create.isPending}
              style={{
                paddingVertical: 15,
                borderRadius: 14,
                alignItems: "center",
                backgroundColor: colors.accent,
                opacity: create.isPending ? 0.6 : 1,
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "800",
                  color: colors.accentText,
                }}
              >
                {create.isPending ? "Oluşturuluyor..." : "Anketi Yayınla"}
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}