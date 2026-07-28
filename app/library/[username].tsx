// app/library/[username].tsx : Başka kullanıcının kütüphanesi (izledikleri/okudukları, tür + durum filtresi).
import { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useTheme } from "@/lib/store/theme";
import {
  useLibrary,
  type LibraryTab,
  type LibraryStatus,
  type LibraryType,
} from "@/lib/queries/library";
import { Chip } from "@/components/ui/Chip";
import { PosterCard } from "@/components/content/PosterCard";
import { spacing, fontSize, fontWeight } from "@/theme";

const SCREEN_PADDING = 18;

const TYPES: LibraryType[] = ["all", "series", "movie", "book"];
const TYPE_LABELS: Record<LibraryType, string> = {
  all: "Tümü",
  series: "Dizi",
  movie: "Film",
  book: "Kitap",
};

export default function UserLibraryScreen() {
  const { colors } = useTheme();
  const { username } = useLocalSearchParams<{ username: string }>();
  const [type, setType] = useState<LibraryType>("all");

  const libQ = useLibrary(username ?? "", "watched", "all", type);
  const items = libQ.data?.items ?? [];

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.bg }}
      edges={["top"]}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          paddingHorizontal: SCREEN_PADDING,
          paddingVertical: spacing.md,
        }}
      >
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ChevronLeft size={24} color={colors.text} />
        </Pressable>
        <Text
          style={{
            fontSize: fontSize.lg,
            fontWeight: fontWeight.heavy,
            color: colors.text,
          }}
        >
          @{username} · Kütüphane
        </Text>
      </View>

      {/* Tür filtresi */}
      <View
        style={{
          flexDirection: "row",
          gap: spacing.sm,
          paddingHorizontal: SCREEN_PADDING,
          paddingBottom: spacing.md,
        }}
      >
        {TYPES.map((t) => (
          <Chip
            key={t}
            label={TYPE_LABELS[t]}
            active={type === t}
            onPress={() => setType(t)}
            size="sm"
          />
        ))}
      </View>

      {libQ.isLoading ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />
      ) : items.length === 0 ? (
        <Text
          style={{
            textAlign: "center",
            color: colors.textDim,
            marginTop: 40,
          }}
        >
          Bu kütüphanede içerik yok.
        </Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i, idx) => `${i.type}-${i.id}-${idx}`}
          numColumns={3}
          columnWrapperStyle={{
            gap: spacing.lg,
            paddingHorizontal: SCREEN_PADDING,
          }}
          contentContainerStyle={{ paddingBottom: 120, gap: spacing.xl }}
          renderItem={({ item }) => (
            <PosterCard
              title={item.titleTr}
              poster={item.poster}
              width={(360 - SCREEN_PADDING * 2 - spacing.lg * 2) / 3}
              onPress={() =>
                router.push(`/content/${item.type}/${item.id}`)
              }
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}