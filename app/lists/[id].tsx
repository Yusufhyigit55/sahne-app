// app/lists/[id].tsx : Liste detayı — içerikler, favorileme, sahibi için düzenleme/silme ve içerik çıkarma.
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Lock, Heart, Trash2, X } from "lucide-react-native";
import { useTheme } from "@/lib/store/theme";
import {
  useListDetail,
  useFavoriteList,
  useRemoveFromList,
  useDeleteList,
} from "@/lib/queries/list";

export default function ListDetailScreen() {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ id: string }>();
  const id = params.id;

  const { data: list, isLoading } = useListDetail(id);
  const favorite = useFavoriteList(id);
  const removeItem = useRemoveFromList(id);
  const deleteList = useDeleteList();

  const onDeleteList = () => {
    Alert.alert("Listeyi sil", "Bu liste kalıcı olarak silinecek.", [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: () =>
          deleteList.mutate(id, {
            onSuccess: () => router.back(),
          }),
      },
    ]);
  };

  const onRemoveItem = (contentId: string, title: string) => {
    Alert.alert("Çıkar", `"${title}" listeden çıkarılsın mı?`, [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Çıkar",
        style: "destructive",
        onPress: () => removeItem.mutate(contentId),
      },
    ]);
  };

  if (isLoading || !list) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Üst bar */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 18,
          paddingTop: 56,
          paddingBottom: 8,
        }}
      >
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ChevronLeft size={24} color={colors.text} />
        </Pressable>

        {list.isOwner && (
          <Pressable onPress={onDeleteList} hitSlop={8}>
            <Trash2 size={20} color={colors.textFaint} />
          </Pressable>
        )}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Başlık bloğu */}
        <View style={{ paddingHorizontal: 18, marginBottom: 18 }}>
          <View
            style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
          >
            <Text
              style={{
                fontSize: 23,
                fontWeight: "800",
                color: colors.text,
                flex: 1,
              }}
            >
              {list.title}
            </Text>
            {!list.isPublic && <Lock size={16} color={colors.textFaint} />}
          </View>

          {list.description ? (
            <Text
              style={{
                fontSize: 14,
                color: colors.textDim,
                marginTop: 6,
                lineHeight: 20,
              }}
            >
              {list.description}
            </Text>
          ) : null}

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
              marginTop: 12,
            }}
          >
            <Text style={{ fontSize: 13, color: colors.textFaint }}>
              {list.items.length} içerik
            </Text>

            {/* Favorile — sahibi değilse */}
            {!list.isOwner && (
              <Pressable
                onPress={() => favorite.mutate()}
                disabled={favorite.isPending}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  paddingVertical: 7,
                  paddingHorizontal: 13,
                  borderRadius: 100,
                  backgroundColor: list.isFavorited
                    ? colors.accentSoft
                    : colors.surface,
                  borderWidth: 1,
                  borderColor: list.isFavorited
                    ? colors.accent
                    : colors.border,
                }}
              >
                <Heart
                  size={14}
                  color={list.isFavorited ? colors.accent : colors.textDim}
                  fill={list.isFavorited ? colors.accent : "transparent"}
                />
                <Text
                  style={{
                    fontSize: 12.5,
                    fontWeight: "700",
                    color: list.isFavorited ? colors.accent : colors.textDim,
                  }}
                >
                  {list.favoriteCount}
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* İçerikler */}
        {list.items.length === 0 ? (
          <Text
            style={{
              color: colors.textFaint,
              textAlign: "center",
              marginTop: 30,
              fontSize: 14,
            }}
          >
            {list.isOwner
              ? "Liste boş. İçerik sayfalarından ekleyebilirsin."
              : "Bu liste boş."}
          </Text>
        ) : (
          <View style={{ paddingHorizontal: 18, gap: 12 }}>
            {list.items.map((item) => (
              <View
                key={item.contentId}
                style={{
                  flexDirection: "row",
                  gap: 12,
                  alignItems: "center",
                }}
              >
                <Pressable
                  onPress={() =>
                    router.push(`/content/${item.type}/${item.tmdbId}`)
                  }
                  style={{ flexDirection: "row", gap: 12, flex: 1 }}
                >
                  <View
                    style={{
                      width: 54,
                      height: 80,
                      borderRadius: 8,
                      backgroundColor: colors.surface,
                      overflow: "hidden",
                    }}
                  >
                    {item.poster && (
                      <Image
                        source={{ uri: item.poster }}
                        style={{ width: "100%", height: "100%" }}
                        contentFit="cover"
                      />
                    )}
                  </View>

                  <View style={{ flex: 1, justifyContent: "center" }}>
                    <Text
                      style={{
                        fontSize: 14.5,
                        fontWeight: "700",
                        color: colors.text,
                      }}
                      numberOfLines={2}
                    >
                      {item.title}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: colors.textDim,
                        marginTop: 3,
                      }}
                    >
                      {[
                        item.year,
                        item.type === "series"
                          ? "Dizi"
                          : item.type === "movie"
                          ? "Film"
                          : "Kitap",
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </Text>
                    {item.note ? (
                      <Text
                        style={{
                          fontSize: 12,
                          color: colors.textFaint,
                          marginTop: 4,
                          fontStyle: "italic",
                        }}
                        numberOfLines={2}
                      >
                        {item.note}
                      </Text>
                    ) : null}
                  </View>
                </Pressable>

                {list.isOwner && (
                  <Pressable
                    onPress={() => onRemoveItem(item.contentId, item.title)}
                    hitSlop={8}
                    style={{ padding: 6 }}
                  >
                    <X size={18} color={colors.textFaint} />
                  </Pressable>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}