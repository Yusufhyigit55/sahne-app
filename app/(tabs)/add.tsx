import { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Check, Bookmark, Star, ChevronRight } from "lucide-react-native";
import { useTheme } from "@/lib/store/theme";
import { SearchBar } from "@/components/ui/SearchBar";
import { Chip } from "@/components/ui/Chip";
import {
  useSearch,
  type ContentType,
  type ContentItem,
} from "@/lib/queries/content";
import { useToggleLike, useMovieWatch } from "@/lib/queries/watch";
import { api } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";

const TABS: { key: ContentType; label: string }[] = [
  { key: "series", label: "Dizi" },
  { key: "movie", label: "Film" },
  { key: "book", label: "Kitap" },
];

/** Tek satırlık hızlı ekleme kartı */
function QuickAddRow({
  item,
  type,
}: {
  item: ContentItem;
  type: ContentType;
}) {
  const { colors } = useTheme();
  const qc = useQueryClient();

  const id = item.tmdbId ?? item.googleBooksId!;
  const [busy, setBusy] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const act = async (
    action: "watchlist" | "favorite" | "completed",
    label: string
  ) => {
    setBusy(action);

    try {
      if (action === "completed") {
        if (type === "movie") {
          await api.post("/api/watch/movie", {
            tmdbId: id,
            status: "completed",
          });
        } else if (type === "book") {
          await api.post("/api/watch/book", {
            googleBooksId: id,
            percent: 100,
          });
        } else {
          // Dizi — tüm bölümleri işaretle
          await api.post("/api/watch/bulk", {
            tmdbId: id,
            scope: "all",
          });
        }
      } else {
        await api.post("/api/watch/like", {
          type,
          id,
          action,
        });
      }

      setDone(action);
      // Kalıcı — kullanıcı ne yaptığını görsün

      qc.invalidateQueries({ queryKey: ["library"] });
      qc.invalidateQueries({ queryKey: ["watchStatus"] });
      qc.invalidateQueries({ queryKey: ["continueWatching"] });
    } catch (err: any) {
      Alert.alert(
        "Hata",
        err?.response?.data?.error ?? "İşlem başarısız"
      );
    } finally {
      setBusy(null);
    }
  };

  const btn = (
    action: "watchlist" | "favorite" | "completed",
    Icon: any,
    label: string
  ) => {
    const isDone = done === action;
    const isBusy = busy === action;

    return (
      <Pressable
        onPress={() => act(action, label)}
        disabled={isBusy}
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 5,
          backgroundColor: isDone ? colors.accent : colors.surfaceAlt,
          borderWidth: 1,
          borderColor: isDone ? colors.accent : colors.border,
          borderRadius: 9,
          paddingVertical: 9,
          opacity: isBusy ? 0.5 : 1,
        }}
      >
        {isBusy ? (
          <ActivityIndicator size="small" color={colors.textDim} />
        ) : (
          <>
            <Icon
              size={13}
              color={isDone ? colors.accentText : colors.textDim}
            />
            <Text
              style={{
                fontSize: 11,
                fontWeight: "700",
                color: isDone ? colors.accentText : colors.textDim,
              }}
            >
              {isDone ? "✓" : label}
            </Text>
          </>
        )}
      </Pressable>
    );
  };

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 14,
        padding: 12,
        gap: 11,
      }}
    >
      {/* Üst: poster + bilgi */}
      <Pressable
        onPress={() => router.push(`/content/${type}/${id}`)}
        style={{ flexDirection: "row", gap: 12, alignItems: "center" }}
      >
        <View
          style={{
            width: 54,
            height: 78,
            borderRadius: 8,
            backgroundColor: colors.surfaceAlt,
            overflow: "hidden",
          }}
        >
          {item.poster && (
            <Image
              source={{ uri: item.poster }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
              transition={200}
            />
          )}
        </View>

        <View style={{ flex: 1, gap: 3 }}>
          <Text
            style={{ fontSize: 14, fontWeight: "700", color: colors.text }}
            numberOfLines={2}
          >
            {item.titleTr}
          </Text>

          <Text style={{ fontSize: 11.5, color: colors.textDim }}>
            {[item.year, item.authors?.[0]].filter(Boolean).join(" · ")}
          </Text>

          {item.tmdbRating != null && (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 3 }}
            >
              <Text style={{ fontSize: 10, color: colors.imdb }}>★</Text>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  color: colors.textDim,
                }}
              >
                {item.tmdbRating.toFixed(1)}
              </Text>
            </View>
          )}
        </View>

        <ChevronRight size={16} color={colors.textFaint} />
      </Pressable>

      {/* Alt: hızlı aksiyonlar */}
      <View style={{ flexDirection: "row", gap: 7 }}>
        {btn(
          "completed",
          Check,
          type === "book" ? "Okudum" : "İzledim"
        )}
        {btn(
          "watchlist",
          Bookmark,
          type === "book" ? "Sonra Oku" : "Sonra İzle"
        )}
        {btn("favorite", Star, "Favori")}
      </View>
    </View>
  );
}

export default function AddScreen() {
  const { colors } = useTheme();

  const [tab, setTab] = useState<ContentType>("series");
  const [query, setQuery] = useState("");

  const search = useSearch(query, tab);
  const searching = query.trim().length >= 2;

  const placeholder =
    tab === "book"
      ? "Kitap ara..."
      : tab === "movie"
      ? "Film ara..."
      : "Dizi ara...";

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.bg }}
      edges={["top"]}
    >
      {/* Başlık */}
      <View style={{ paddingHorizontal: 18, paddingTop: 8, gap: 4 }}>
        <Text style={{ fontSize: 22, fontWeight: "800", color: colors.text }}>
          Hızlı Ekle
        </Text>
        <Text style={{ fontSize: 12.5, color: colors.textDim }}>
          Ara, tek dokunuşla işaretle
        </Text>
      </View>

      {/* Sekmeler */}
      <View
        style={{
          flexDirection: "row",
          gap: 8,
          paddingHorizontal: 18,
          paddingTop: 16,
        }}
      >
        {TABS.map((t) => (
          <Chip
            key={t.key}
            label={t.label}
            active={tab === t.key}
            onPress={() => setTab(t.key)}
          />
        ))}
      </View>

      {/* Arama */}
      <View style={{ paddingHorizontal: 18, paddingVertical: 14 }}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder={placeholder}
        />
      </View>

      {/* Sonuçlar */}
      {!searching ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 40,
            gap: 12,
          }}
        >
          <Text
            style={{
              fontSize: 13,
              color: colors.textDim,
              textAlign: "center",
              lineHeight: 20,
            }}
          >
            İzlediğin veya okuduğun bir şeyi ara.{"\n"}
            Detay sayfasına gitmeden işaretle.
          </Text>
        </View>
      ) : search.isLoading ? (
        <View style={{ paddingTop: 40, alignItems: "center" }}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <FlatList
          key={`add-${tab}`}
          data={(search.data ?? []) as ContentItem[]}
          keyExtractor={(i, idx) =>
            `${i.tmdbId ?? i.googleBooksId}-${idx}`
          }
          contentContainerStyle={{
            paddingHorizontal: 18,
            paddingBottom: 110,
            gap: 10,
          }}
          renderItem={({ item }) => <QuickAddRow item={item} type={tab} />}
          ListEmptyComponent={
            <View style={{ alignItems: "center", padding: 40 }}>
              <Text style={{ fontSize: 13, color: colors.textDim }}>
                Sonuç bulunamadı
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}