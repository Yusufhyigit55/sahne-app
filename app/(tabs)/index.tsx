import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Bell, X, Sparkles, Calendar } from "lucide-react-native";import { useTheme } from "@/lib/store/theme";
import { useContinueWatching } from "@/lib/queries/home";
import { useFeed } from "@/lib/queries/social";
import { useRecommendations, useDismissRec } from "@/lib/queries/recommend";
import { useCalendar, formatAirDate } from "@/lib/queries/calendar";
import { FeedItem } from "@/components/social/FeedItem";
import {
  SCREEN_PADDING,
  spacing,
  fontSize,
  fontWeight,
  radius,
  shadow,
} from "@/theme";

export default function HomeScreen() {
  const { colors } = useTheme();

  const continueQ = useContinueWatching();
  const feedQ = useFeed();
  const recsQ = useRecommendations();
  const calendarQ = useCalendar();
  const dismiss = useDismissRec();

  const items = continueQ.data ?? [];
  const feed = feedQ.data ?? [];
  const recs = recsQ.data ?? [];
  const upcoming = calendarQ.data ?? [];

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.bg }}
      edges={["top"]}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={continueQ.isRefetching}
            onRefresh={() => {
              continueQ.refetch();
              feedQ.refetch();
              recsQ.refetch();
              calendarQ.refetch();
            }}
            tintColor={colors.accent}
          />
        }
      >
        {/* ---- Üst bar ---- */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: SCREEN_PADDING,
            paddingTop: spacing.md,
            paddingBottom: spacing.xl,
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
            Sahne
          </Text>

          <Pressable
            onPress={() => router.push("/(tabs)/notifications")}
            style={{
              width: 40,
              height: 40,
              borderRadius: radius.pill,
              backgroundColor: colors.surface,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Bell size={18} color={colors.textDim} />
          </Pressable>
        </View>

        {/* ---- Yaklaşan Bölümler ---- */}
        {upcoming.length > 0 && (
          <View style={{ gap: spacing.lg, marginBottom: spacing.section }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.sm,
                paddingHorizontal: SCREEN_PADDING,
              }}
            >
            <Calendar size={17} color={colors.accent} />
              <Text
                style={{
                  fontSize: fontSize.xl,
                  fontWeight: fontWeight.heavy,
                  color: colors.text,
                }}
              >
                Yaklaşan Bölümler
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: SCREEN_PADDING,
                gap: spacing.lg,
              }}
            >
              {upcoming.map((ep) => (
                <Pressable
                  key={`${ep.tmdbId}-${ep.season}-${ep.episode}`}
                  onPress={() => router.push(`/content/series/${ep.tmdbId}`)}
                  style={{ width: 130 }}
                >
                  <View
                    style={{
                      width: 130,
                      height: 190,
                      borderRadius: radius.lg,
                      backgroundColor: colors.surface,
                      ...shadow.lg,
                      shadowColor: colors.shadowColor,
                    }}
                  >
                    <View
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: radius.lg,
                        overflow: "hidden",
                        borderWidth: 1,
                        borderColor: colors.borderLight,
                        justifyContent: "flex-end",
                      }}
                    >
                      {ep.poster && (
                        <Image
                          source={{ uri: ep.poster }}
                          style={{
                            position: "absolute",
                            width: "100%",
                            height: "100%",
                          }}
                          contentFit="cover"
                          transition={220}
                        />
                      )}

                      {/* Tarih rozeti */}
                      <View
                        style={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          backgroundColor: colors.accent,
                          borderRadius: radius.sm,
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 10.5,
                            fontWeight: fontWeight.heavy,
                            color: colors.accentText,
                          }}
                        >
                          {formatAirDate(ep.airDate)}
                        </Text>
                      </View>

                      {/* Alt bilgi bandı */}
                      <View
                        style={{
                          backgroundColor: "rgba(0,0,0,0.78)",
                          paddingHorizontal: spacing.md,
                          paddingVertical: spacing.sm,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: fontSize.sm,
                            fontWeight: fontWeight.heavy,
                            color: "#fff",
                          }}
                        >
                          S{ep.season}B{ep.episode}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <Text
                    style={{
                      fontSize: fontSize.md,
                      fontWeight: fontWeight.bold,
                      color: colors.text,
                      marginTop: spacing.md,
                    }}
                    numberOfLines={1}
                  >
                    {ep.title}
                  </Text>

                  {ep.episodeName ? (
                    <Text
                      style={{
                        fontSize: fontSize.xs,
                        color: colors.textFaint,
                        marginTop: 3,
                      }}
                      numberOfLines={1}
                    >
                      {ep.episodeName}
                    </Text>
                  ) : null}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ---- İzlemeye Devam Et ---- */}
        <View style={{ gap: spacing.lg }}>
          <Text
            style={{
              fontSize: fontSize.xl,
              fontWeight: fontWeight.heavy,
              color: colors.text,
              paddingHorizontal: SCREEN_PADDING,
            }}
          >
            İzlemeye Devam Et
          </Text>

          {continueQ.isLoading ? (
            <View style={{ paddingVertical: spacing.xxl, alignItems: "center" }}>
              <ActivityIndicator color={colors.accent} />
            </View>
          ) : items.length === 0 ? (
            <View
              style={{
                marginHorizontal: SCREEN_PADDING,
                backgroundColor: colors.surface,
                borderRadius: radius.xl,
                padding: spacing.xxl,
                alignItems: "center",
                gap: spacing.md,
              }}
            >
              <Text
                style={{
                  fontSize: fontSize.md,
                  color: colors.textDim,
                  textAlign: "center",
                }}
              >
                Henüz izlemeye başladığın bir dizi yok.
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
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: SCREEN_PADDING,
                gap: spacing.lg,
              }}
            >
              {items.map((item: any) => (
                <Pressable
                  key={`${item.tmdbId}-${item.season}-${item.episode}`}
                  onPress={() => router.push(`/content/series/${item.tmdbId}`)}
                  style={{ width: 148 }}
                >
                  {/* 3D poster */}
                  <View
                    style={{
                      width: 148,
                      height: 216,
                      borderRadius: radius.lg,
                      backgroundColor: colors.surface,
                      ...shadow.lg,
                      shadowColor: colors.shadowColor,
                    }}
                  >
                    <View
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: radius.lg,
                        overflow: "hidden",
                        borderWidth: 1,
                        borderColor: colors.borderLight,
                        justifyContent: "flex-end",
                      }}
                    >
                      {item.poster && (
                        <Image
                          source={{ uri: item.poster }}
                          style={{
                            position: "absolute",
                            width: "100%",
                            height: "100%",
                          }}
                          contentFit="cover"
                          transition={220}
                        />
                      )}

                      {/* Alt bilgi bandı */}
                      <View
                        style={{
                          backgroundColor: "rgba(0,0,0,0.78)",
                          paddingHorizontal: spacing.md,
                          paddingVertical: spacing.sm,
                          gap: spacing.sm,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: fontSize.sm,
                            fontWeight: fontWeight.heavy,
                            color: "#fff",
                          }}
                        >
                          S{item.season}B{item.episode}
                          {item.runtime ? ` · ${item.runtime} dk` : ""}
                        </Text>

                        <View
                          style={{
                            height: 3,
                            backgroundColor: "rgba(255,255,255,0.25)",
                            borderRadius: 2,
                          }}
                        >
                          <View
                            style={{
                              height: "100%",
                              width: `${item.progress}%`,
                              backgroundColor: colors.accent,
                              borderRadius: 2,
                            }}
                          />
                        </View>
                      </View>
                    </View>
                  </View>

                  <Text
                    style={{
                      fontSize: fontSize.md,
                      fontWeight: fontWeight.bold,
                      color: colors.text,
                      marginTop: spacing.md,
                    }}
                    numberOfLines={1}
                  >
                    {item.titleTr}
                  </Text>

                  <Text
                    style={{
                      fontSize: fontSize.xs,
                      color: colors.textFaint,
                      marginTop: 3,
                    }}
                  >
                    {item.watchedEpisodes}/{item.totalEpisodes} bölüm
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>

        {/* ---- Sana Özel ---- */}
        {recs.length > 0 && (
          <View style={{ marginTop: spacing.section, gap: spacing.lg }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.sm,
                paddingHorizontal: SCREEN_PADDING,
              }}
            >
              <Sparkles size={17} color={colors.accent} />
              <Text
                style={{
                  fontSize: fontSize.xl,
                  fontWeight: fontWeight.heavy,
                  color: colors.text,
                }}
              >
                Sana Özel
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: SCREEN_PADDING,
                gap: spacing.lg,
              }}
            >
              {recs.map((rec) => (
                <View key={`${rec.type}-${rec.tmdbId}`} style={{ width: 126 }}>
                  <Pressable
                    onPress={() =>
                      router.push(`/content/${rec.type}/${rec.tmdbId}`)
                    }
                  >
                    <View
                      style={{
                        width: 126,
                        height: 184,
                        borderRadius: radius.lg,
                        backgroundColor: colors.surface,
                        ...shadow.lg,
                        shadowColor: colors.shadowColor,
                      }}
                    >
                      <View
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: radius.lg,
                          overflow: "hidden",
                          borderWidth: 1,
                          borderColor: colors.borderLight,
                        }}
                      >
                        {rec.poster && (
                          <Image
                            source={{ uri: rec.poster }}
                            style={{ width: "100%", height: "100%" }}
                            contentFit="cover"
                            transition={220}
                          />
                        )}

                        {/* Gizle */}
                        <Pressable
                          onPress={(e) => {
                            e.stopPropagation();
                            dismiss.mutate({
                              type: rec.type,
                              tmdbId: rec.tmdbId,
                            });
                          }}
                          hitSlop={8}
                          style={{
                            position: "absolute",
                            top: 7,
                            right: 7,
                            width: 24,
                            height: 24,
                            borderRadius: radius.pill,
                            backgroundColor: "rgba(0,0,0,0.7)",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <X size={13} color="#fff" />
                        </Pressable>

                        {/* Puan */}
                        {rec.tmdbRating && (
                          <View
                            style={{
                              position: "absolute",
                              bottom: 7,
                              left: 7,
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 3,
                              backgroundColor: "rgba(0,0,0,0.75)",
                              borderRadius: radius.sm,
                              paddingHorizontal: 7,
                              paddingVertical: 3,
                            }}
                          >
                            <Text style={{ fontSize: 9, color: colors.imdb }}>
                              ★
                            </Text>
                            <Text
                              style={{
                                fontSize: 10,
                                fontWeight: fontWeight.heavy,
                                color: "#fff",
                              }}
                            >
                              {rec.tmdbRating}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </Pressable>

                  <Text
                    style={{
                      fontSize: fontSize.sm,
                      fontWeight: fontWeight.bold,
                      color: colors.text,
                      marginTop: spacing.md,
                    }}
                    numberOfLines={1}
                  >
                    {rec.titleTr}
                  </Text>

                  {rec.reasons[0] && (
                    <Text
                      style={{
                        fontSize: fontSize.xs,
                        color: colors.accent,
                        marginTop: 3,
                        lineHeight: 15,
                      }}
                      numberOfLines={2}
                    >
                      {rec.reasons[0].text}
                    </Text>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ---- Akış ---- */}
        <View
          style={{
            paddingHorizontal: SCREEN_PADDING,
            marginTop: spacing.section,
            gap: spacing.sm,
          }}
        >
          <Text
            style={{
              fontSize: fontSize.xl,
              fontWeight: fontWeight.heavy,
              color: colors.text,
              marginBottom: spacing.sm,
            }}
          >
            Akış
          </Text>

          {feedQ.isLoading ? (
            <View style={{ paddingVertical: spacing.xxl, alignItems: "center" }}>
              <ActivityIndicator color={colors.accent} />
            </View>
          ) : feed.length === 0 ? (
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: radius.xl,
                padding: spacing.xxl,
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
                Takip ettiğin kimse yok.{"\n"}
                Arkadaşlarını bul, aktivitelerini gör.
              </Text>
            </View>
          ) : (
            feed.map((item: any) => <FeedItem key={item.id} item={item} />)
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}