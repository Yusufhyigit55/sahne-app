// app/lists/index.tsx : Kullanıcının listelerini gösterir; yeni liste oluşturma paneli ve liste kartları (kapak kolajı).
import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Plus, Lock, Heart, X } from "lucide-react-native";
import { useTheme } from "@/lib/store/theme";
import { useLists, useCreateList } from "@/lib/queries/list";
import { apiError } from "@/lib/api";

export default function ListsScreen() {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ userId?: string }>();
  const userId = params.userId;

  const { data, isLoading } = useLists(userId);
  const create = useCreateList();

  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  const isOwner = data?.isOwner ?? false;

  const submit = () => {
    if (title.trim().length < 2) {
      Alert.alert("Eksik", "Başlık en az 2 karakter olmalı.");
      return;
    }
    create.mutate(
      { title: title.trim(), description: desc.trim(), isPublic },
      {
        onSuccess: (list) => {
          setModalOpen(false);
          setTitle("");
          setDesc("");
          setIsPublic(true);
          router.push(`/lists/${list.id}`);
        },
        onError: (err) => Alert.alert("Hata", apiError(err)),
      }
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Başlık */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 18,
          paddingTop: 56,
          paddingBottom: 12,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <ChevronLeft size={24} color={colors.text} />
          </Pressable>
          <Text style={{ fontSize: 19, fontWeight: "800", color: colors.text }}>
            {isOwner ? "Listelerim" : "Listeler"}
          </Text>
        </View>

        {isOwner && (
          <Pressable
            onPress={() => setModalOpen(true)}
            hitSlop={8}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              paddingVertical: 7,
              paddingHorizontal: 12,
              borderRadius: 100,
              backgroundColor: colors.accent,
            }}
          >
            <Plus size={15} color={colors.accentText} />
            <Text
              style={{
                fontSize: 12.5,
                fontWeight: "700",
                color: colors.accentText,
              }}
            >
              Yeni
            </Text>
          </Pressable>
        )}
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />
      ) : !data || data.lists.length === 0 ? (
        <Text
          style={{
            color: colors.textFaint,
            textAlign: "center",
            marginTop: 40,
            fontSize: 14,
          }}
        >
          {isOwner
            ? "Henüz liste oluşturmadın. İlkini oluştur."
            : "Herkese açık liste yok."}
        </Text>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 18, paddingTop: 4, gap: 12 }}>
          {data.lists.map((l) => (
            <Pressable
              key={l.id}
              onPress={() => router.push(`/lists/${l.id}`)}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.border,
                overflow: "hidden",
              }}
            >
              {/* Kapak kolajı */}
              <View style={{ flexDirection: "row", height: 110 }}>
                {l.covers.length > 0 ? (
                  l.covers.slice(0, 4).map((cover, i) => (
                    <Image
                      key={i}
                      source={{ uri: cover }}
                      style={{ flex: 1, height: "100%" }}
                      contentFit="cover"
                    />
                  ))
                ) : (
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: colors.surfaceAlt,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ color: colors.textFaint, fontSize: 12 }}>
                      Boş liste
                    </Text>
                  </View>
                )}
              </View>

              <View style={{ padding: 14 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "800",
                      color: colors.text,
                      flex: 1,
                    }}
                    numberOfLines={1}
                  >
                    {l.title}
                  </Text>
                  {!l.isPublic && <Lock size={13} color={colors.textFaint} />}
                </View>

                {l.description ? (
                  <Text
                    style={{
                      fontSize: 12.5,
                      color: colors.textDim,
                      marginTop: 3,
                    }}
                    numberOfLines={1}
                  >
                    {l.description}
                  </Text>
                ) : null}

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    marginTop: 8,
                  }}
                >
                  <Text style={{ fontSize: 12, color: colors.textFaint }}>
                    {l.itemCount} içerik
                  </Text>
                  {l.favoriteCount > 0 && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Heart size={12} color={colors.textFaint} />
                      <Text style={{ fontSize: 12, color: colors.textFaint }}>
                        {l.favoriteCount}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* Yeni liste modalı */}
      <Modal
        visible={modalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setModalOpen(false)}
      >
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <Pressable
            style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
            onPress={() => setModalOpen(false)}
          />
          <View
            style={{
              backgroundColor: colors.bg,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 22,
              paddingBottom: 32,
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
                Yeni Liste
              </Text>
              <Pressable onPress={() => setModalOpen(false)} hitSlop={8}>
                <X size={22} color={colors.textDim} />
              </Pressable>
            </View>

            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Liste başlığı"
              placeholderTextColor={colors.textFaint}
              maxLength={80}
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 12,
                paddingVertical: 13,
                paddingHorizontal: 14,
                fontSize: 15,
                color: colors.text,
                marginBottom: 12,
              }}
            />

            <TextInput
              value={desc}
              onChangeText={setDesc}
              placeholder="Açıklama (isteğe bağlı)"
              placeholderTextColor={colors.textFaint}
              maxLength={300}
              multiline
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 12,
                paddingVertical: 13,
                paddingHorizontal: 14,
                fontSize: 14,
                color: colors.text,
                marginBottom: 16,
                minHeight: 60,
                textAlignVertical: "top",
              }}
            />

            <Pressable
              onPress={() => setIsPublic(!isPublic)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 13,
                paddingHorizontal: 14,
                borderRadius: 12,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                marginBottom: 20,
              }}
            >
              <Text
                style={{ fontSize: 14, fontWeight: "600", color: colors.text }}
              >
                {isPublic ? "Herkese açık" : "Gizli"}
              </Text>
              <View
                style={{
                  width: 46,
                  height: 28,
                  borderRadius: 100,
                  backgroundColor: isPublic ? colors.accent : colors.border,
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
                    alignSelf: isPublic ? "flex-end" : "flex-start",
                  }}
                />
              </View>
            </Pressable>

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
                {create.isPending ? "Oluşturuluyor..." : "Oluştur"}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}