// components/social/GifPicker.tsx : Alttan açılan GIF arama ve seçme paneli; iki sütunlu ızgara, seçince gifUrl döner.
import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  TextInput,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { Image } from "expo-image";
import { X, Search } from "lucide-react-native";
import { useTheme } from "@/lib/store/theme";
import { useGifSearch, GiphyGif } from "@/lib/queries/giphy";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (gifUrl: string) => void;
};

export function GifPicker({ visible, onClose, onSelect }: Props) {
  const { colors } = useTheme();
  const [query, setQuery] = useState("");

  const { data: gifs, isLoading } = useGifSearch(query);

  const pick = (gif: GiphyGif) => {
    onSelect(gif.url);
    setQuery("");
    onClose();
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
            paddingTop: 16,
            paddingHorizontal: 18,
            paddingBottom: 24,
            height: "72%",
          }}
        >
          {/* Başlık */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <Text
              style={{ fontSize: 17, fontWeight: "800", color: colors.text }}
            >
              GIF Seç
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <X size={22} color={colors.textDim} />
            </Pressable>
          </View>

          {/* Arama kutusu */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 12,
              paddingHorizontal: 12,
              marginBottom: 14,
            }}
          >
            <Search size={16} color={colors.textFaint} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="GIF ara..."
              placeholderTextColor={colors.textFaint}
              style={{
                flex: 1,
                paddingVertical: 11,
                fontSize: 14,
                color: colors.text,
              }}
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery("")} hitSlop={8}>
                <X size={15} color={colors.textFaint} />
              </Pressable>
            )}
          </View>

          {/* GIF ızgarası */}
          {isLoading ? (
            <ActivityIndicator
              color={colors.accent}
              style={{ marginTop: 30 }}
            />
          ) : !gifs || gifs.length === 0 ? (
            <Text
              style={{
                color: colors.textFaint,
                textAlign: "center",
                marginTop: 30,
                fontSize: 13,
              }}
            >
              Sonuç yok.
            </Text>
          ) : (
            <FlatList
              data={gifs}
              keyExtractor={(g) => g.id}
              numColumns={2}
              columnWrapperStyle={{ gap: 8 }}
              contentContainerStyle={{ gap: 8, paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => pick(item)}
                  style={{
                    flex: 1,
                    aspectRatio: 1,
                    borderRadius: 10,
                    overflow: "hidden",
                    backgroundColor: colors.surface,
                  }}
                >
                  <Image
                    source={{ uri: item.previewUrl }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                  />
                </Pressable>
              )}
            />
          )}

          {/* Giphy atıf — kullanım şartı */}
          <Text
            style={{
              fontSize: 10,
              color: colors.textFaint,
              textAlign: "center",
              marginTop: 4,
            }}
          >
            Powered by GIPHY
          </Text>
        </View>
      </View>
    </Modal>
  );
}