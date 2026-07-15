// components/social/AddToListSheet.tsx : İçeriği bir listeye eklemek için alttan açılan panel; mevcut listeleri gösterir, yeni liste oluşturur.
import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { X, Plus, Check, Lock } from "lucide-react-native";
import { useTheme } from "@/lib/store/theme";
import { useLists, useCreateList, useAddToList } from "@/lib/queries/list";
import { apiError } from "@/lib/api";

type Props = {
  visible: boolean;
  onClose: () => void;
  type: string;
  tmdbId: string | number;
};

export function AddToListSheet({ visible, onClose, type, tmdbId }: Props) {
  const { colors } = useTheme();

  const { data, isLoading } = useLists();
  const create = useCreateList();
  const addTo = useAddToList();

  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const add = (listId: string) => {
    addTo.mutate(
      { listId, type, tmdbId },
      {
        onSuccess: () => {
          Alert.alert("Eklendi", "İçerik listeye eklendi.");
          onClose();
        },
        onError: (err) => Alert.alert("Hata", apiError(err)),
      }
    );
  };

  const createAndAdd = () => {
    if (newTitle.trim().length < 2) {
      Alert.alert("Eksik", "Başlık en az 2 karakter olmalı.");
      return;
    }
    create.mutate(
      { title: newTitle.trim(), isPublic: true },
      {
        onSuccess: (list) => {
          setNewTitle("");
          setCreating(false);
          add(list.id);
        },
        onError: (err) => Alert.alert("Hata", apiError(err)),
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
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
          onPress={onClose}
        />
        <View
          style={{
            backgroundColor: colors.bg,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 22,
            paddingBottom: 32,
            maxHeight: "80%",
          }}
        >
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
              Listeye Ekle
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <X size={22} color={colors.textDim} />
            </Pressable>
          </View>

          {/* Yeni liste oluştur satırı */}
          {creating ? (
            <View
              style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}
            >
              <TextInput
                value={newTitle}
                onChangeText={setNewTitle}
                placeholder="Yeni liste adı"
                placeholderTextColor={colors.textFaint}
                maxLength={80}
                autoFocus
                style={{
                  flex: 1,
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.accent,
                  borderRadius: 12,
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  fontSize: 14,
                  color: colors.text,
                }}
              />
              <Pressable
                onPress={createAndAdd}
                disabled={create.isPending || addTo.isPending}
                style={{
                  paddingHorizontal: 18,
                  borderRadius: 12,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: colors.accent,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "800",
                    color: colors.accentText,
                  }}
                >
                  Ekle
                </Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={() => setCreating(true)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                paddingVertical: 13,
                paddingHorizontal: 14,
                borderRadius: 12,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                borderStyle: "dashed",
                marginBottom: 16,
              }}
            >
              <Plus size={17} color={colors.accent} />
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: colors.accent,
                }}
              >
                Yeni liste oluştur
              </Text>
            </Pressable>
          )}

          {/* Mevcut listeler */}
          {isLoading ? (
            <ActivityIndicator color={colors.accent} />
          ) : !data || data.lists.length === 0 ? (
            <Text
              style={{
                fontSize: 13,
                color: colors.textFaint,
                textAlign: "center",
                paddingVertical: 10,
              }}
            >
              Henüz listen yok.
            </Text>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              {data.lists.map((l) => (
                <Pressable
                  key={l.id}
                  onPress={() => add(l.id)}
                  disabled={addTo.isPending}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: 14,
                    paddingHorizontal: 14,
                    borderRadius: 12,
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                    marginBottom: 8,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                      flex: 1,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14.5,
                        fontWeight: "700",
                        color: colors.text,
                      }}
                      numberOfLines={1}
                    >
                      {l.title}
                    </Text>
                    {!l.isPublic && <Lock size={13} color={colors.textFaint} />}
                  </View>
                  <Text style={{ fontSize: 12, color: colors.textFaint }}>
                    {l.itemCount}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}