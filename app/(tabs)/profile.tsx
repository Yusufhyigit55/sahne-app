import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { router } from "expo-router";
import {
  Settings,
  List,
  Tv,
  Clock,
  Film,
  Flame,
  Share2,
  ChevronRight,
} from "lucide-react-native";
import { useTheme } from "@/lib/store/theme";
import { useAuth } from "@/lib/store/auth";
import { TasteProfileCard } from "@/components/profile/TasteProfileCard";
import { useUserProfile } from "@/lib/queries/social";
import { useStats } from "@/lib/queries/stats";
import {
  useLibrary,
  STATUS_LABELS,
  TYPE_LABELS,
  type LibraryTab,
  type LibraryStatus,
  type LibraryType,
} from "@/lib/queries/library";
import { Chip } from "@/components/ui/Chip";
import { Dropdown, type DropdownOption } from "@/components/ui/Dropdown";
import { LibraryCard } from "@/components/content/LibraryCard";
import { StatCard } from "@/components/content/StatCard";
import {
  SCREEN_PADDING,
  spacing,
  fontSize,
  fontWeight,
  radius,
  shadow,
} from "@/theme";

const TABS: { key: LibraryTab; label: string }[] = [
  { key: "watched", label: "Kütüphanem" },
  { key: "watchlist", label: "Bekleyenler" },
  { key: "favorites", label: "Favoriler" },
];

const STATUSES: LibraryStatus[] = [
  "all",
  "watching",
  "up_to_date",
  "completed",
  "paused",
  "dropped",
];

const TYPES: LibraryType[] = ["all", "series", "movie", "book"];

function formatMinutes(min: number): string {
  if (min < 60) return `${min} dk`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours} sa`;
  const days = Math.floor(hours / 24);
  const rem = hours % 24;
  return rem ? `${days}g ${rem}s` : `${days} gün`;
}

/** Boş durum mesajı — sekme ve türe göre */
function emptyMessage(tab: LibraryTab, type: LibraryType): string {
  const isBook = type === "book";

  if (tab === "watchlist") {
    return isBook
      ? "Okuma listen boş.\nSonra okumak istediklerini buraya ekle."
      : "Bekleyen bir şey yok.\nSonra bakmak istediklerini buraya ekle.";
  }

  if (tab === "favorites") {
    return isBook ? "Henüz favori kitabın yok." : "Henüz favori eklemedin.";
  }

  if (isBook) return "Henüz kitap okumadın.\nKeşfet'ten başla.";
  if (type === "movie") return "Henüz film izlemedin.\nKeşfet'ten başla.";
  if (type === "series") return "Henüz dizi izlemedin.\nKeşfet'ten başla.";

  return "Kütüphanen boş.\nKeşfet'ten başla.";
}

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();

  const [tab, setTab] = useState<LibraryTab>("watched");
  const [status, setStatus] = useState<LibraryStatus>("all");
  const [type, setType] = useState<LibraryType>("all");

  const username = user?.username ?? "";

  const profileQ = useUserProfile(username);
  const libQ = useLibrary(username, tab, status, type);
  const statsQ = useStats(username);

  const st = statsQ.data?.stats;

  const statusOptions: DropdownOption[] = STATUSES.map((s) => ({
    key: s,
    label: s === "all" ? "Tüm Durumlar" : STATUS_LABELS[s],
    count: s === "all" ? undefined : libQ.data?.statusCounts[s],
  }));

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.bg }}
      edges={["top"]}
    >
      <FlatList
        data={libQ.data?.items ?? []}
        keyExtractor={(i, idx) => `${i.type}-${i.id}-${idx}`}
        numColumns={3}
        columnWrapperStyle={{
          gap: spacing.lg,
          paddingHorizontal: SCREEN_PADDING,
        }}
        contentContainerStyle={{ paddingBottom: 120, gap: spacing.xl }}
        refreshControl={
          <RefreshControl
            refreshing={libQ.isRefetching}
            onRefresh={() => {
              libQ.refetch();
              profileQ.refetch();
              statsQ.refetch();
            }}
            tintColor={colors.accent}
          />
        }
        ListHeaderComponent={
          <View style={{ gap: spacing.xl, paddingBottom: spacing.sm }}>
            {/* Üst bar */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                alignItems: "center",
                paddingHorizontal: SCREEN_PADDING,
                paddingTop: spacing.md,
              }}
            >
              <Pressable
                onPress={() => router.push("/share-card")}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: radius.pill,
                  backgroundColor: colors.surface,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: spacing.sm,
                }}
              >
                <Share2 size={18} color={colors.textDim} />
              </Pressable>

              <Pressable
                onPress={() => router.push("/lists")}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: radius.pill,
                  backgroundColor: colors.surface,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: spacing.sm,
                }}
              >
                <List size={18} color={colors.textDim} />
              </Pressable>

              <Pressable
                onPress={() => router.push("/settings")}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: radius.pill,
                  backgroundColor: colors.surface,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Settings size={18} color={colors.textDim} />
              </Pressable>
            </View>

            {/* Profil başlığı */}
            <View style={{ alignItems: "center", gap: spacing.md }}>
              <View
                style={{
                  width: 92,
                  height: 92,
                  borderRadius: radius.pill,
                  backgroundColor: colors.surface,
                  overflow: "hidden",
                  ...shadow.md,
                  shadowColor: colors.shadowColor,
                }}
              >
                {user?.avatar && (
                  <Image
                    source={{ uri: user.avatar }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                  />
                )}
              </View>

              <View style={{ alignItems: "center", gap: 3 }}>
                <Text
                  style={{
                    fontSize: fontSize.xl,
                    fontWeight: fontWeight.heavy,
                    color: colors.text,
                  }}
                >
                  {user?.displayName}
                </Text>
                <Text style={{ fontSize: fontSize.sm, color: colors.textDim }}>
                  @{user?.username}
                </Text>
              </View>

              {/* Takipçi / Takip */}
              <View
                style={{
                  flexDirection: "row",
                  gap: spacing.xxl,
                  marginTop: spacing.xs,
                }}
              >
                <Pressable
                  onPress={() =>
                    router.push(`/social/${username}?tab=followers`)
                  }
                  style={{ alignItems: "center" }}
                >
                  <Text
                    style={{
                      fontSize: fontSize.lg,
                      fontWeight: fontWeight.heavy,
                      color: colors.text,
                    }}
                  >
                    {profileQ.data?.user.followers ?? 0}
                  </Text>
                  <Text
                    style={{ fontSize: fontSize.xs, color: colors.textDim }}
                  >
                    Takipçi
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() =>
                    router.push(`/social/${username}?tab=following`)
                  }
                  style={{ alignItems: "center" }}
                >
                  <Text
                    style={{
                      fontSize: fontSize.lg,
                      fontWeight: fontWeight.heavy,
                      color: colors.text,
                    }}
                  >
                    {profileQ.data?.user.following ?? 0}
                  </Text>
                  <Text
                    style={{ fontSize: fontSize.xs, color: colors.textDim }}
                  >
                    Takip
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* İstatistikler başlığı → tam ekrana git */}
            {st && (
              <Pressable
                onPress={() => router.push("/stats")}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingHorizontal: SCREEN_PADDING,
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: fontWeight.heavy,
                    color: colors.text,
                  }}
                >
                  İstatistikler
                </Text>
                <ChevronRight size={22} color={colors.textDim} />
              </Pressable>
            )}

            {/* 4 özet kart */}
            {st && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  gap: spacing.md,
                  paddingHorizontal: SCREEN_PADDING,
                }}
                style={{ flexGrow: 0 }}
              >
                <StatCard
                  value={formatMinutes(st.summary.totalMinutesAll)}
                  label="Toplam Süre"
                  Icon={Clock}
                  accent
                />

                <StatCard
                  value={String(st.summary.episodesWatched)}
                  label="İzlenen Bölüm"
                  Icon={Tv}
                />

                <StatCard
                  value={String(st.summary.moviesWatched)}
                  label="İzlenen Film"
                  Icon={Film}
                />

                {st.summary.longestStreak > 0 && (
                  <StatCard
                    value={`${st.summary.longestStreak} gün`}
                    label="En Uzun Seri"
                    sub={
                      st.summary.currentStreak > 0
                        ? `Güncel: ${st.summary.currentStreak} gün`
                        : undefined
                    }
                    Icon={Flame}
                  />
                )}
              </ScrollView>
            )}

            {/* Zevk Profili — sadece kendi profilinde */}
            <TasteProfileCard enabled />

            {/* Sekmeler */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                gap: spacing.sm,
                paddingHorizontal: SCREEN_PADDING,
              }}
              style={{ flexGrow: 0 }}
            >
              {TABS.map((t) => (
                <Chip
                  key={t.key}
                  label={t.label}
                  active={tab === t.key}
                  onPress={() => {
                    setTab(t.key);
                    setStatus("all");
                  }}
                  size="sm"
                />
              ))}
            </ScrollView>

            {/* Filtreler — tek satır */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.sm,
                paddingHorizontal: SCREEN_PADDING,
              }}
            >
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: spacing.sm }}
                style={{ flex: 1 }}
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
              </ScrollView>

              {tab === "watched" && (
                <Dropdown
                  options={statusOptions}
                  value={status}
                  onSelect={(k) => setStatus(k as LibraryStatus)}
                  placeholder="Durum"
                />
              )}
            </View>

            {/* Sonuç sayısı */}
            <Text
              style={{
                fontSize: fontSize.xs,
                color: colors.textFaint,
                paddingHorizontal: SCREEN_PADDING,
              }}
            >
              {libQ.data?.total ?? 0} içerik
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <LibraryCard
            item={item}
            width={104}
            onPress={() => router.push(`/content/${item.type}/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          libQ.isLoading ? (
            <View
              style={{ paddingVertical: spacing.xxl, alignItems: "center" }}
            >
              <ActivityIndicator color={colors.accent} />
            </View>
          ) : (
            <View
              style={{
                paddingVertical: 50,
                paddingHorizontal: 40,
                alignItems: "center",
                gap: spacing.md,
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
                {emptyMessage(tab, type)}
              </Text>

              <Pressable onPress={() => router.push("/(tabs)/discover")}>
                <Text
                  style={{
                    fontSize: fontSize.md,
                    fontWeight: fontWeight.heavy,
                    color: colors.accent,
                  }}
                >
                  Keşfet'e Git
                </Text>
              </Pressable>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}