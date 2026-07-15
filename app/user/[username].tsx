import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useLocalSearchParams, router } from "expo-router";
import {
  ChevronLeft,
  MoreHorizontal,
  Lock,
} from "lucide-react-native";
import { useTheme } from "@/lib/store/theme";
import { useAuth } from "@/lib/store/auth";
import {
  useUserProfile,
  useToggleFollow,
  useToggleBlock,
} from "@/lib/queries/social";
import { useStats } from "@/lib/queries/stats";
import { useCompatibility } from "@/lib/queries/socialGraph";
import { CompatibilityCard } from "@/components/social/CompatibilityCard";
import { StatCard } from "@/components/content/StatCard";
import {
  SCREEN_PADDING,
  spacing,
  fontSize,
  fontWeight,
  radius,
  shadow,
} from "@/theme";

function formatMinutes(min: number): string {
  if (min < 60) return `${min} dk`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours} sa`;
  const days = Math.floor(hours / 24);
  return `${days} gün`;
}

export default function UserProfileScreen() {
  const { colors } = useTheme();
  const { user: me } = useAuth();
  const { username } = useLocalSearchParams<{ username: string }>();

  const [menuOpen, setMenuOpen] = useState(false);

  const isMe = me?.username === username;

  const q = useUserProfile(username);
  const statsQ = useStats(username);
  const compatQ = useCompatibility(username, !isMe);

  const follow = useToggleFollow();
  const block = useToggleBlock();

  const user = q.data?.user;
  const st = statsQ.data?.stats;
  const compat = compatQ.data;

  if (q.isLoading || !user) {
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

  const followLabel =
    user.followStatus === "accepted"
      ? "Takip Ediliyor"
      : user.followStatus === "pending"
      ? "İstek Gönderildi"
      : user.isPrivate
      ? "Takip İsteği Gönder"
      : "Takip Et";

  const isFollowing = user.followStatus === "accepted";
  const isLocked = user.isPrivate && !isFollowing && !isMe;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.bg }}
      edges={["top"]}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
        {/* Üst bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: SCREEN_PADDING,
            paddingTop: spacing.md,
          }}
        >
          <Pressable
            onPress={() => router.back()}
            style={{
              width: 36,
              height: 36,
              borderRadius: radius.pill,
              backgroundColor: colors.surface,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ChevronLeft size={19} color={colors.text} />
          </Pressable>

          {!isMe && (
            <Pressable
              onPress={() => setMenuOpen(!menuOpen)}
              style={{
                width: 36,
                height: 36,
                borderRadius: radius.pill,
                backgroundColor: colors.surface,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MoreHorizontal size={18} color={colors.textDim} />
            </Pressable>
          )}
        </View>

        {/* Menü */}
        {menuOpen && !isMe && (
          <View
            style={{
              position: "absolute",
              top: 60,
              right: SCREEN_PADDING,
              zIndex: 10,
              backgroundColor: colors.surface,
              borderRadius: radius.lg,
              borderWidth: 1,
              borderColor: colors.border,
              overflow: "hidden",
              ...shadow.lg,
              shadowColor: colors.shadowColor,
            }}
          >
            <Pressable
              onPress={() => {
                setMenuOpen(false);
                block.mutate({ username, type: "mute" });
              }}
              style={{
                paddingVertical: 13,
                paddingHorizontal: 18,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <Text style={{ fontSize: fontSize.md, color: colors.text }}>
                Sessize Al
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setMenuOpen(false);
                Alert.alert(
                  "Engelle",
                  `${user.displayName} seni göremeyecek, sen de onu göremeyeceksin.`,
                  [
                    { text: "Vazgeç", style: "cancel" },
                    {
                      text: "Engelle",
                      style: "destructive",
                      onPress: () =>
                        block.mutate({ username, type: "block" }),
                    },
                  ]
                );
              }}
              style={{ paddingVertical: 13, paddingHorizontal: 18 }}
            >
              <Text style={{ fontSize: fontSize.md, color: colors.danger }}>
                Engelle
              </Text>
            </Pressable>
          </View>
        )}

        {/* Profil başlığı */}
        <View
          style={{
            alignItems: "center",
            gap: spacing.md,
            marginTop: spacing.lg,
          }}
        >
          <View
            style={{
              width: 96,
              height: 96,
              borderRadius: radius.pill,
              backgroundColor: colors.surface,
              overflow: "hidden",
              ...shadow.md,
              shadowColor: colors.shadowColor,
            }}
          >
            {user.avatar && (
              <Image
                source={{ uri: user.avatar }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
              />
            )}
          </View>

          <View style={{ alignItems: "center", gap: 4 }}>
            {/* İsim */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 7,
              }}
            >
              <Text
                style={{
                  fontSize: fontSize.xxl,
                  fontWeight: fontWeight.heavy,
                  color: colors.text,
                }}
              >
                {user.displayName}
              </Text>

              {user.isPrivate && (
                <Lock size={14} color={colors.textDim} />
              )}
            </View>

            <Text style={{ fontSize: fontSize.sm, color: colors.textDim }}>
              @{user.username}
            </Text>

            {user.bio ? (
              <Text
                style={{
                  fontSize: fontSize.md,
                  color: colors.textDim,
                  textAlign: "center",
                  marginTop: spacing.sm,
                  paddingHorizontal: 36,
                  lineHeight: 21,
                }}
              >
                {user.bio}
              </Text>
            ) : null}
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
                {user.followers}
              </Text>
              <Text style={{ fontSize: fontSize.xs, color: colors.textDim }}>
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
                {user.following}
              </Text>
              <Text style={{ fontSize: fontSize.xs, color: colors.textDim }}>
                Takip
              </Text>
            </Pressable>
          </View>

          {/* Butonlar */}
          {!isMe && (
            <View
              style={{
                flexDirection: "row",
                gap: spacing.sm,
                paddingHorizontal: SCREEN_PADDING,
                marginTop: spacing.md,
                width: "100%",
              }}
            >
              <Pressable
                onPress={() => follow.mutate(username)}
                style={{
                  flex: 1,
                  backgroundColor: isFollowing
                    ? colors.surface
                    : colors.accent,
                  borderWidth: 1,
                  borderColor: isFollowing ? colors.border : colors.accent,
                  borderRadius: radius.md,
                  paddingVertical: 12,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: fontSize.md,
                    fontWeight: fontWeight.heavy,
                    color: isFollowing ? colors.textDim : colors.accentText,
                  }}
                >
                  {followLabel}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => router.push(`/together/${username}`)}
                style={{
                  flex: 1,
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: radius.md,
                  paddingVertical: 12,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: fontSize.md,
                    fontWeight: fontWeight.heavy,
                    color: colors.text,
                  }}
                >
                  Birlikte İzleyelim
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Zevk Uyumu — kilitli hesapta da görünür */}
        {compat && (
          <View
            style={{
              marginTop: spacing.section,
              paddingHorizontal: SCREEN_PADDING,
            }}
          >
            <CompatibilityCard data={compat} />
          </View>
        )}

        {/* Gizli hesap kilidi */}
        {isLocked ? (
          <View
            style={{
              alignItems: "center",
              paddingVertical: 60,
              paddingHorizontal: 40,
              gap: spacing.md,
            }}
          >
            <Lock size={30} color={colors.textFaint} />
            <Text
              style={{
                fontSize: fontSize.md,
                color: colors.textDim,
                textAlign: "center",
                lineHeight: 22,
              }}
            >
              Bu hesap gizli.{"\n"}
              İçeriklerini görmek için takip isteği gönder.
            </Text>
          </View>
        ) : (
          <>
            {/* İstatistikler */}
            {st && (
              <View style={{ marginTop: spacing.section, gap: spacing.lg }}>
                <Text
                  style={{
                    fontSize: fontSize.xl,
                    fontWeight: fontWeight.heavy,
                    color: colors.text,
                    paddingHorizontal: SCREEN_PADDING,
                  }}
                >
                  İstatistikler
                </Text>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{
                    gap: spacing.md,
                    paddingHorizontal: SCREEN_PADDING,
                  }}
                >
                  <StatCard
                    value={String(st.summary.episodesWatched)}
                    label="İzlenen Bölüm"
                    accent
                  />
                  <StatCard
                    value={formatMinutes(st.summary.totalMinutesAll)}
                    label="Toplam Süre"
                  />
                  <StatCard
                    value={String(st.summary.moviesWatched)}
                    label="Film"
                  />
                  {st.summary.longestStreak > 0 && (
                    <StatCard
                      value={`${st.summary.longestStreak} gün`}
                      label="En Uzun Seri"
                    />
                  )}
                  {st.series.topGenres[0] && (
                    <StatCard
                      value={st.series.topGenres[0].name}
                      label="En Çok İzlenen Tür"
                      wide
                    />
                  )}
                </ScrollView>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}