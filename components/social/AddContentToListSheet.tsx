// components/social/AddContentToListSheet.tsx : Bir listeye içerik aramak ve eklemek için alttan açılan panel.
import { useState } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { X, Search, Plus, Check } from "lucide-react-native";
import { useTheme } from "@/lib/store/theme";
import { useSearch } from "@/lib/queries/content";
import { useAddToList } from "@/lib/queries/list";

type Props = {
  visible: boolean;
  onClose: () => void;
  listId: string;
  existingKeys: string[]; // "type:id" — zaten listede olanlar
};

export function AddContentToListSheet({
  visible,
  onClose,
  listId,
  existingKeys,
}: Props) {
  const { colors } = useTheme();
  const [query, setQuery] = useState("");
  const [added, setAdded] = useState<Set<string>>(new Set());
  const [searchType, setSearchType] = useState<"series" | "movie" | "book">(
    "series"
  );

  const searchQ = useSearch(query, searchType);
  const addTo = useAddToList();

  // Basitlik için "all" yerine üç ayrı tür araması yapmıyoruz; tek arama yeterli.
  // Not: useSearch tek tür alır; burada film+dizi karışık için "multi" gerekebilir.
  const results = (searchQ.data ?? []).filter(
    (r: any) => r.type && (r.tmdbId || r.googleBooksId)
  );

  const keyOf = (r: any) => `${r.type}:${r.tmdbId ?? r.googleBooksId}`;

  const handleAdd = (r: any) => {
    const k = keyOf(r);
    setAdded((s) => new Set(s).add(k));
    addTo.mutate({
      listId,
      type: r.type,
      tmdbId: r.tmdbId ?? r.googleBooksId,
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: colors.surfaceAlt,
            borderTopLeftRadius: 22,
            borderTopRightRadius: 22,
            maxHeight: "85%",
            paddingTop: 14,
          }}
        >
          {/* Başlık */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 18,
              paddingBottom: 12,
            }}
          >
            <Text
              style={{ fontSize: 17, fontWeight: "800", color: colors.text }}
            >
              Listeye İçerik Ekle
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
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 10,
              marginHorizontal: 18,
              marginBottom: 12,
            }}
          >
            <Search size={18} color={colors.textDim} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Dizi veya film ara..."
              placeholderTextColor={colors.textFaint}
              style={{ flex: 1, fontSize: 15, color: colors.text }}
              autoFocus
            />
          </View>
        {/* Tür seçici */}
          <View
            style={{
              flexDirection: "row",
              gap: 8,
              paddingHorizontal: 18,
              marginBottom: 12,
            }}
          >
            {(
              [
                { key: "series", label: "Dizi" },
                { key: "movie", label: "Film" },
                { key: "book", label: "Kitap" },
              ] as const
            ).map((t) => (
              <Pressable
                key={t.key}
                onPress={() => setSearchType(t.key)}
                style={{
                  backgroundColor:
                    searchType === t.key ? colors.accent : colors.surface,
                  borderRadius: 100,
                  paddingVertical: 7,
                  paddingHorizontal: 16,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "700",
                    color:
                      searchType === t.key ? colors.accentText : colors.textDim,
                  }}
                >
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </View>
          {/* Sonuçlar */}
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 30 }}
            keyboardShouldPersistTaps="handled"
          >
            {searchQ.isLoading ? (
              <View style={{ paddingVertical: 30, alignItems: "center" }}>
                <ActivityIndicator color={colors.accent} />
              </View>
            ) : query.trim().length < 2 ? (
              <Text
                style={{
                  color: colors.textDim,
                  textAlign: "center",
                  paddingVertical: 30,
                }}
              >
                Aramak için en az 2 harf gir.
              </Text>
            ) : results.length === 0 ? (
              <Text
                style={{
                  color: colors.textDim,
                  textAlign: "center",
                  paddingVertical: 30,
                }}
              >
                Sonuç bulunamadı.
              </Text>
            ) : (
              results.map((r: any) => {
                const k = keyOf(r);
                const isAdded = added.has(k) || existingKeys.includes(k);
                return (
                  <View
                    key={k}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                      paddingVertical: 8,
                    }}
                  >
                    <View
                      style={{
                        width: 44,
                        height: 64,
                        borderRadius: 6,
                        backgroundColor: colors.surface,
                        overflow: "hidden",
                      }}
                    >
                      {r.poster && (
                        <Image
                          source={{ uri: r.poster }}
                          style={{ width: "100%", height: "100%" }}
                          contentFit="cover"
                        />
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "700",
                          color: colors.text,
                        }}
                        numberOfLines={1}
                      >
                        {r.titleTr}
                      </Text>
                      {r.year && (
                        <Text style={{ fontSize: 12, color: colors.textDim }}>
                          {r.year}
                        </Text>
                      )}
                    </View>
                    <Pressable
                      onPress={() => !isAdded && handleAdd(r)}
                      disabled={isAdded}
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 17,
                        backgroundColor: isAdded
                          ? colors.surfaceAlt
                          : colors.accent,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {isAdded ? (
                        <Check size={17} color={colors.textDim} strokeWidth={2.5} />
                      ) : (
                        <Plus size={17} color={colors.accentText} strokeWidth={2.5} />
                      )}
                    </Pressable>
                  </View>
                );
              })
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}