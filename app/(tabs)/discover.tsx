import { useState } from "react";
import {
  View,
  Text,
  FlatList,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useSuggestedUsers } from "@/lib/queries/socialGraph";
import { Zap } from "lucide-react-native";
import { router } from "expo-router";
import { useTheme } from "@/lib/store/theme";
import { SearchBar } from "@/components/ui/SearchBar";
import { Chip } from "@/components/ui/Chip";
import { PosterCard } from "@/components/content/PosterCard";
import {
  useTrending,
  useSearch,
  type ContentType,
  type SearchType,
  type ContentItem,
  type PersonItem,
} from "@/lib/queries/content";
import { useSearchUsers } from "@/lib/queries/social";
import {
  SCREEN_PADDING,
  spacing,
  fontSize,
  fontWeight,
  radius,
  shadow,
} from "@/theme";

type Tab = SearchType | "user";

const TABS: { key: Tab; label: string }[] = [
  { key: "series", label: "Dizi" },
  { key: "movie", label: "Film" },
  { key: "book", label: "Kitap" },
  { key: "person", label: "Oyuncu" },
  { key: "user", label: "Kullanıcı" },
];

export default function DiscoverScreen() {
  const { colors } = useTheme();

  const [tab, setTab] = useState<Tab>("series");
  const [query, setQuery] = useState("");

  const isPerson = tab === "person";
  const isUser = tab === "user";
  const isContent = !isPerson && !isUser;
  const searching = query.trim().length >= 2;

  const trending = useTrending(isContent ? (tab as ContentType) : "series");
  const search = useSearch(query, isUser ? "person" : (tab as SearchType));
  const userSearch = useSearchUsers(isUser ? query : "");
  const suggestedQ = useSuggestedUsers();

  const items = searching ? search.data : isContent ? trending.data : [];
  const loading = isUser
    ? userSearch.isLoading
    : searching
    ? search.isLoading
    : trending.isLoading;

  const placeholder = isUser
    ? "Kullanıcı ara..."
    : isPerson
    ? "Oyuncu ara..."
    : tab === "book"
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
      <View
        style={{
          paddingHorizontal: SCREEN_PADDING,
          paddingTop: spacing.md,
        }}
      >
        <Text
          style={{
            fontSize: fontSize.xxl,
            fontWeight: fontWeight.heavy,
            color: colors.text,
            letterSpacing: -0.3,
          }}
        >
          Keşfet
        </Text>
      </View>

      {/* Sekmeler */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          gap: spacing.sm,
          paddingHorizontal: SCREEN_PADDING,
        }}
        style={{ marginTop: spacing.xl, flexGrow: 0 }}
      >
        {TABS.map((t) => (
          <Chip
            key={t.key}
            label={t.label}
            active={tab === t.key}
            onPress={() => setTab(t.key)}
            size="sm"
          />
        ))}
      </ScrollView>

      {/* Arama */}
      <View
        style={{
          paddingHorizontal: SCREEN_PADDING,
          paddingTop: spacing.lg,
          paddingBottom: spacing.xl,
        }}
      >
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder={placeholder}
        />
      </View>

      {/* Sonuçlar */}
      {loading ? (
        <View style={{ paddingTop: spacing.xxl, alignItems: "center" }}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : isUser ? (
        !searching ? (
          <FlatList
            key="suggested-users"
            data={suggestedQ.data ?? []}
            keyExtractor={(u) => u.id}
            contentContainerStyle={{
              paddingHorizontal: SCREEN_PADDING,
              paddingBottom: 120,
              gap: spacing.sm,
            }}
            ListHeaderComponent={
              (suggestedQ.data?.length ?? 0) > 0 ? (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: spacing.sm,
                    paddingBottom: spacing.lg,
                  }}
                >
                  <Zap size={16} color={colors.accent} />
                  <Text
                    style={{
                      fontSize: fontSize.lg,
                      fontWeight: fontWeight.heavy,
                      color: colors.text,
                    }}
                  >
                    Sana Benzeyenler
                  </Text>
                </View>
              ) : null
            }
            renderItem={({ item }) => (
              <Pressable
                onPress={() => router.push(`/user/${item.username}`)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: spacing.md,
                  backgroundColor: colors.surface,
                  borderRadius: radius.lg,
                  borderWidth: 1,
                  borderColor: colors.border,
                  padding: spacing.md,
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: radius.pill,
                    backgroundColor: colors.surfaceAlt,
                    overflow: "hidden",
                  }}
                >
                  {item.avatar && (
                    <Image
                      source={{ uri: item.avatar }}
                      style={{ width: "100%", height: "100%" }}
                      contentFit="cover"
                    />
                  )}
                </View>

                <View style={{ flex: 1, gap: 2 }}>
                  <Text
                    style={{
                      fontSize: fontSize.md,
                      fontWeight: fontWeight.bold,
                      color: colors.text,
                    }}
                  >
                    {item.displayName}
                  </Text>
                  <Text
                    style={{ fontSize: fontSize.xs, color: colors.textFaint }}
                  >
                    @{item.username} · {item.reason}
                  </Text>
                </View>

                {/* Uyum */}
                <View
                  style={{
                    alignItems: "center",
                    backgroundColor: colors.accentSoft,
                    borderRadius: radius.md,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                  }}
                >
                  <Text
                    style={{
                      fontSize: fontSize.md,
                      fontWeight: fontWeight.heavy,
                      color: colors.accent,
                    }}
                  >
                    %{item.compatibility}
                  </Text>
                  <Text
                    style={{
                      fontSize: 9,
                      color: colors.accent,
                      opacity: 0.7,
                    }}
                  >
                    uyum
                  </Text>
                </View>
              </Pressable>
            )}
            ListEmptyComponent={
              <View
                style={{
                  paddingVertical: 60,
                  paddingHorizontal: 30,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: fontSize.md,
                    color: colors.textDim,
                    textAlign: "center",
                    lineHeight: 22,
                  }}
                >
                  Kullanıcı ara.{"\n"}Arkadaşlarını bul, takip et.
                </Text>
              </View>
            }
          />
        ) : (
          <FlatList
            key="user-list"
            data={userSearch.data ?? []}
            keyExtractor={(u) => u.id}
            contentContainerStyle={{
              paddingHorizontal: SCREEN_PADDING,
              paddingBottom: 120,
              gap: spacing.xs,
            }}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => router.push(`/user/${item.username}`)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: spacing.md,
                  paddingVertical: spacing.md,
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: radius.pill,
                    backgroundColor: colors.surface,
                    overflow: "hidden",
                    ...shadow.sm,
                    shadowColor: colors.shadowColor,
                  }}
                >
                  {item.avatar && (
                    <Image
                      source={{ uri: item.avatar }}
                      style={{ width: "100%", height: "100%" }}
                      contentFit="cover"
                    />
                  )}
                </View>

                <View style={{ flex: 1, gap: 2 }}>
                  <Text
                    style={{
                      fontSize: fontSize.lg,
                      fontWeight: fontWeight.bold,
                      color: colors.text,
                    }}
                  >
                    {item.displayName}
                  </Text>

                  <Text
                    style={{
                      fontSize: fontSize.sm,
                      color: colors.textDim,
                    }}
                  >
                    @{item.username} · {item.followers} takipçi
                  </Text>
                </View>

                {item.followStatus && (
                  <View
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: radius.pill,
                      paddingVertical: 6,
                      paddingHorizontal: 12,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: fontSize.xs,
                        fontWeight: fontWeight.bold,
                        color: colors.textDim,
                      }}
                    >
                      {item.followStatus === "accepted"
                        ? "Takipte"
                        : "İstek Gönderildi"}
                    </Text>
                  </View>
                )}
              </Pressable>
            )}
            ListEmptyComponent={
              <View style={{ alignItems: "center", padding: spacing.xxl }}>
                <Text style={{ fontSize: fontSize.md, color: colors.textDim }}>
                  Kullanıcı bulunamadı
                </Text>
              </View>
            }
          />
        )
      ) : isPerson && !searching ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: spacing.xxl,
          }}
        >
          <Text
            style={{
              fontSize: fontSize.md,
              color: colors.textDim,
              textAlign: "center",
              lineHeight: 22,
            }}
          >
            Oyuncu ara.{"\n"}Filmografilerini keşfet.
          </Text>
        </View>
      ) : isPerson ? (
        <FlatList
          key="person-list"
          data={(search.data ?? []) as PersonItem[]}
          keyExtractor={(p) => String(p.tmdbId)}
          contentContainerStyle={{
            paddingHorizontal: SCREEN_PADDING,
            paddingBottom: 120,
            gap: spacing.xs,
          }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/person/${item.tmdbId}`)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.md,
                paddingVertical: spacing.md,
              }}
            >
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: radius.pill,
                  backgroundColor: colors.surface,
                  overflow: "hidden",
                  ...shadow.sm,
                  shadowColor: colors.shadowColor,
                }}
              >
                {item.photo && (
                  <Image
                    source={{ uri: item.photo }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                  />
                )}
              </View>

              <Text
                style={{
                  flex: 1,
                  fontSize: fontSize.lg,
                  fontWeight: fontWeight.bold,
                  color: colors.text,
                }}
              >
                {item.name}
              </Text>
            </Pressable>
          )}
          ListEmptyComponent={
            <View style={{ alignItems: "center", padding: spacing.xxl }}>
              <Text style={{ fontSize: fontSize.md, color: colors.textDim }}>
                Oyuncu bulunamadı
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          key="content-grid"
          data={(items ?? []) as ContentItem[]}
          keyExtractor={(i, idx) =>
            `${i.type}-${i.tmdbId ?? i.googleBooksId}-${idx}`
          }
          numColumns={3}
          columnWrapperStyle={{
            gap: spacing.lg,
            paddingHorizontal: SCREEN_PADDING,
          }}
          contentContainerStyle={{
            paddingBottom: 120,
            gap: spacing.xl,
          }}
          renderItem={({ item }) => (
            <PosterCard
              title={item.titleTr}
              poster={item.poster}
              year={item.year}
              width={104}
              onPress={() =>
                router.push(
                  `/content/${item.type}/${item.tmdbId ?? item.googleBooksId}`
                )
              }
            />
          )}
          ListEmptyComponent={
            <View style={{ alignItems: "center", padding: spacing.xxl }}>
              <Text style={{ fontSize: fontSize.md, color: colors.textDim }}>
                Sonuç bulunamadı
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}