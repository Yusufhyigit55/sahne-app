// app/content/[type]/[id].tsx : İçerik detay ekranı — 4 aksiyon butonu, durum menüsü, bölüm takibi, anketler, listeye ekle.
import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, router } from "expo-router";
import {
  ChevronLeft,
  ChevronDown,
  Check,
  MessageCircle,
  Bookmark,
  ThumbsUp,
  ThumbsDown,
  Star,
  ListPlus,
} from "lucide-react-native";
import { useTheme } from "@/lib/store/theme";
import {
  useContentDetail,
  useSeason,
  type ContentType,
} from "@/lib/queries/content";
import {
  useWatchStatus,
  useToggleEpisode,
  useBulkWatch,
  useToggleLike,
  useMovieWatch,
  useSetStatus,
} from "@/lib/queries/watch";
import { RatingBadge } from "@/components/content/RatingBadge";
import { SpoilerBlur } from "@/components/content/SpoilerBlur";
import { ProviderRow } from "@/components/content/ProviderRow";
import { CastStrip } from "@/components/content/CastStrip";
import { PosterCard } from "@/components/content/PosterCard";
import { Chip } from "@/components/ui/Chip";
import { WatchedSheet } from "@/components/social/WatchedSheet";
import { StatusSheet } from "@/components/social/StatusSheet";
import { CreatePollSheet } from "@/components/social/CreatePollSheet";
import { PollCard } from "@/components/social/PollCard";
import { usePolls } from "@/lib/queries/poll";
import { AddToListSheet } from "@/components/social/AddToListSheet";

const STATUS_LABEL: Record<string, string> = {
  none: "",
  watchlist: "İzleme Listesinde",
  watching: "İzliyor",
  up_to_date: "Güncel",
  completed: "Tamamlandı",
  paused: "Askıda",
  dropped: "Yarım Bırakıldı",
  reading: "Okuyor",
};

export default function ContentDetailScreen() {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ type: string; id: string }>();
  const type = params.type as ContentType;
  const id = params.id;

  const { data, isLoading } = useContentDetail(type, id);

  const [season, setSeason] = useState(1);
  const [sheetEp, setSheetEp] = useState<{
    episode: number;
    name: string;
  } | null>(null);
  const [statusOpen, setStatusOpen] = useState(false);
  const [pollSheetOpen, setPollSheetOpen] = useState(false);
  const [listSheetOpen, setListSheetOpen] = useState(false);

  const isSeries = type === "series";
  const tmdbId = Number(id);

  const seasonQ = useSeason(isSeries ? tmdbId : 0, season);
  const statusQ = useWatchStatus(type, id);
  const pollsQ = usePolls(type as string, id as string);

  const toggleEp = useToggleEpisode(tmdbId);
  const bulk = useBulkWatch(tmdbId);
  const like = useToggleLike(type, id);
  const movieWatch = useMovieWatch(tmdbId);
  const setStatus = useSetStatus(type, id);

  const record = statusQ.data?.record;
  const watchedEp = statusQ.data?.watchedEpisodes ?? 0;
  const totalEp = statusQ.data?.totalEpisodes ?? 0;
  const progress = totalEp > 0 ? (watchedEp / totalEp) * 100 : 0;

  const inWatchlist = record?.status === "watchlist";
  const hasStatus = record && record.status !== "none";

  const handleToggle = (episode: number, isAired: boolean, name: string) => {
    if (!isAired) {
      Alert.alert("Henüz yayınlanmadı", "Bu bölüm henüz yayınlanmamış.");
      return;
    }

    toggleEp.mutate(
      { season, episode },
      {
        onSuccess: (res) => {
          if (res.watched) {
            setSheetEp({ episode, name });
          }
        },
      }
    );
  };

  const handleBulkSeason = () => {
    Alert.alert(
      "Sezonu İşaretle",
      `${season}. sezonun tüm yayınlanmış bölümlerini izledim olarak işaretle?`,
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "İşaretle",
          onPress: () => bulk.mutate({ scope: "season", season }),
        },
      ]
    );
  };

  const handleBulkAll = () => {
    Alert.alert(
      "Tüm Diziyi İşaretle",
      "Tüm yayınlanmış bölümleri izledim olarak işaretle?",
      [
        { text: "Vazgeç", style: "cancel" },
        { text: "İşaretle", onPress: () => bulk.mutate({ scope: "all" }) },
      ]
    );
  };

  if (isLoading || !data) {
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
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* ---- Backdrop ---- */}
        <View style={{ height: 220, position: "relative" }}>
          {data.backdrop ? (
            <Image
              source={{ uri: data.backdrop }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
            />
          ) : (
            <View style={{ flex: 1, backgroundColor: colors.surface }} />
          )}

          <LinearGradient
            colors={["transparent", colors.bg]}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: 140,
            }}
          />

          <Pressable
            onPress={() => router.back()}
            style={{
              position: "absolute",
              top: 52,
              left: 16,
              width: 36,
              height: 36,
              borderRadius: 100,
              backgroundColor: "rgba(0,0,0,0.5)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ChevronLeft size={20} color="#fff" />
          </Pressable>
        </View>

        {/* ---- Poster + Başlık ---- */}
        <View
          style={{
            flexDirection: "row",
            gap: 14,
            paddingHorizontal: 18,
            marginTop: -58,
            alignItems: "flex-end",
          }}
        >
          <View
            style={{
              width: 96,
              height: 140,
              borderRadius: 12,
              backgroundColor: colors.surface,
              overflow: "hidden",
            }}
          >
            {data.poster && (
              <Image
                source={{ uri: data.poster }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
              />
            )}
          </View>

          <View style={{ flex: 1, paddingBottom: 6 }}>
            <Text
              style={{
                fontSize: 19,
                fontWeight: "800",
                color: colors.text,
                lineHeight: 24,
              }}
            >
              {data.titleTr}
            </Text>
            <Text
              style={{ fontSize: 12.5, color: colors.textDim, marginTop: 4 }}
            >
              {[
                data.year,
                isSeries && data.totalSeasons
                  ? `${data.totalSeasons} Sezon`
                  : null,
                type === "book" && data.pageCount
                  ? `${data.pageCount} sayfa`
                  : null,
                data.genres?.slice(0, 2).join(", "),
                data.authors?.join(", "),
              ]
                .filter(Boolean)
                .join(" · ")}
            </Text>
          </View>
        </View>

        {/* ---- Puanlar + Yorumlar + Liste + Durum ---- */}
        <View
          style={{
            flexDirection: "row",
            gap: 10,
            paddingHorizontal: 18,
            marginTop: 16,
            flexWrap: "wrap",
          }}
        >
          <RatingBadge
            kind="tmdb"
            value={data.tmdbRating ?? data.externalRating}
          />
          <RatingBadge kind="sahne" value={data.appRating} />

          <Pressable
            onPress={() =>
              router.push(
                `/comments/${type}/${id}?title=${encodeURIComponent(
                  data.titleTr
                )}`
              )
            }
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              backgroundColor: colors.surface,
              borderRadius: 10,
              paddingVertical: 8,
              paddingHorizontal: 12,
            }}
          >
            <MessageCircle size={14} color={colors.textDim} />
            <Text
              style={{ fontSize: 12, fontWeight: "700", color: colors.text }}
            >
              Yorumlar
            </Text>
          </Pressable>

          {/* Listeye Ekle */}
          <Pressable
            onPress={() => setListSheetOpen(true)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              backgroundColor: colors.surface,
              borderRadius: 10,
              paddingVertical: 8,
              paddingHorizontal: 12,
            }}
          >
            <ListPlus size={14} color={colors.textDim} />
            <Text
              style={{ fontSize: 12, fontWeight: "700", color: colors.text }}
            >
              Listeye Ekle
            </Text>
          </Pressable>

          {/* Durum seçici — film hariç */}
          {type !== "movie" && (
            <Pressable
              onPress={() => setStatusOpen(true)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
                backgroundColor: hasStatus
                  ? colors.accentSoft
                  : colors.surface,
                borderWidth: 1,
                borderColor: hasStatus ? colors.accent : colors.border,
                borderRadius: 10,
                paddingVertical: 8,
                paddingHorizontal: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color: hasStatus ? colors.accent : colors.textDim,
                }}
              >
                {hasStatus ? STATUS_LABEL[record!.status] : "Durum Seç"}
              </Text>
              <ChevronDown
                size={13}
                color={hasStatus ? colors.accent : colors.textDim}
              />
            </Pressable>
          )}
        </View>

        {/* ---- Aksiyon butonları ---- */}
        <View
          style={{
            flexDirection: "row",
            gap: 8,
            paddingHorizontal: 18,
            marginTop: 14,
          }}
        >
          {/* Sonra İzle / Oku */}
          <Pressable
            onPress={() => {
              if (type === "movie") {
                movieWatch.mutate("watchlist");
              } else {
                like.mutate("watchlist");
              }
            }}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              backgroundColor: inWatchlist ? colors.accentSoft : colors.surface,
              borderWidth: 1,
              borderColor: inWatchlist ? colors.accent : colors.border,
              borderRadius: 11,
              paddingVertical: 11,
            }}
          >
            <Bookmark
              size={15}
              color={inWatchlist ? colors.accent : colors.textDim}
            />
            <Text
              style={{
                fontSize: 12,
                fontWeight: "700",
                color: inWatchlist ? colors.accent : colors.textDim,
              }}
            >
              {inWatchlist
                ? "Listede"
                : type === "book"
                ? "Sonra Oku"
                : "Sonra İzle"}
            </Text>
          </Pressable>

          {/* Beğen */}
          <Pressable
            onPress={() => like.mutate("like")}
            style={{
              width: 46,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: record?.isLiked
                ? colors.accentSoft
                : colors.surface,
              borderWidth: 1,
              borderColor: record?.isLiked ? colors.accent : colors.border,
              borderRadius: 11,
            }}
          >
            <ThumbsUp
              size={16}
              color={record?.isLiked ? colors.accent : colors.textDim}
            />
          </Pressable>

          {/* Beğenmedim */}
          <Pressable
            onPress={() => like.mutate("dislike")}
            style={{
              width: 46,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: record?.isDisliked
                ? colors.warnSoft
                : colors.surface,
              borderWidth: 1,
              borderColor: record?.isDisliked ? colors.danger : colors.border,
              borderRadius: 11,
            }}
          >
            <ThumbsDown
              size={16}
              color={record?.isDisliked ? colors.danger : colors.textDim}
            />
          </Pressable>

          {/* Favori */}
          <Pressable
            onPress={() => like.mutate("favorite")}
            style={{
              width: 46,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: record?.isFavorite
                ? colors.accentSoft
                : colors.surface,
              borderWidth: 1,
              borderColor: record?.isFavorite ? colors.accent : colors.border,
              borderRadius: 11,
            }}
          >
            <Star
              size={16}
              color={record?.isFavorite ? colors.accent : colors.textDim}
            />
          </Pressable>
        </View>

        {/* Film için "İzledim" butonu */}
        {type === "movie" && (
          <View style={{ paddingHorizontal: 18, marginTop: 8 }}>
            <Pressable
              onPress={() => movieWatch.mutate("completed")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
                backgroundColor:
                  record?.status === "completed"
                    ? colors.accent
                    : colors.surface,
                borderWidth: record?.status === "completed" ? 0 : 1,
                borderColor: colors.border,
                borderRadius: 11,
                paddingVertical: 13,
              }}
            >
              <Check
                size={16}
                color={
                  record?.status === "completed"
                    ? colors.accentText
                    : colors.textDim
                }
                strokeWidth={2.5}
              />
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "800",
                  color:
                    record?.status === "completed"
                      ? colors.accentText
                      : colors.textDim,
                }}
              >
                {record?.status === "completed" ? "İzledin ✓" : "İzledim"}
              </Text>
            </Pressable>
          </View>
        )}

        {/* ---- İlerleme çubuğu ---- */}
        {isSeries && watchedEp > 0 && (
          <View style={{ paddingHorizontal: 18, marginTop: 14, gap: 6 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text style={{ fontSize: 12, color: colors.textDim }}>
                {watchedEp} / {totalEp} bölüm
              </Text>
              <Text style={{ fontSize: 12, color: colors.textDim }}>
                %{Math.round(progress)}
              </Text>
            </View>
            <View
              style={{
                height: 6,
                backgroundColor: colors.surface,
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  height: "100%",
                  width: `${progress}%`,
                  backgroundColor: colors.accent,
                }}
              />
            </View>
          </View>
        )}

        {/* ---- Özet ---- */}
        {data.overview ? (
          <View style={{ padding: 18 }}>
            <SpoilerBlur text={data.overview} hidden={watchedEp === 0} />
          </View>
        ) : null}

        <View style={{ paddingHorizontal: 18, gap: 22 }}>
          <ProviderRow providers={data.providers ?? []} />

          <CastStrip cast={data.cast ?? []} />

          {/* Benzer */}
          {data.similar?.length > 0 && (
            <View style={{ gap: 10 }}>
              <Text
                style={{ fontSize: 14, fontWeight: "700", color: colors.text }}
              >
                Bunu {isSeries ? "İzleyenler" : "Beğenenler"} Şunları da{" "}
                {isSeries ? "İzledi" : "Beğendi"}
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 12 }}
              >
                {data.similar.map((s: any) => (
                  <PosterCard
                    key={s.tmdbId}
                    title={s.titleTr}
                    poster={s.poster}
                    width={96}
                    onPress={() => router.push(`/content/${s.type}/${s.tmdbId}`)}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* ---- Anketler ---- */}
          <View style={{ gap: 10 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{ fontSize: 14, fontWeight: "700", color: colors.text }}
              >
                Anketler
              </Text>
              <Pressable
                onPress={() => setPollSheetOpen(true)}
                hitSlop={8}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderRadius: 100,
                  backgroundColor: colors.accentSoft,
                }}
              >
                <Text
                  style={{
                    fontSize: 12.5,
                    fontWeight: "700",
                    color: colors.accent,
                  }}
                >
                  + Anket Oluştur
                </Text>
              </Pressable>
            </View>

            {pollsQ.data && pollsQ.data.length > 0 ? (
              pollsQ.data.map((poll) => (
                <PollCard
                  key={poll.id}
                  poll={poll}
                  type={type as string}
                  tmdbId={id as string}
                  watched={watchedEp > 0}
                />
              ))
            ) : (
              <Text
                style={{
                  fontSize: 13,
                  color: colors.textFaint,
                  paddingVertical: 6,
                }}
              >
                Henüz anket yok. İlkini sen aç.
              </Text>
            )}
          </View>

          {/* ---- Bölümler ---- */}
          {isSeries && data.seasons?.length > 0 && (
            <View style={{ gap: 12 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: colors.text,
                  }}
                >
                  Bölümler
                </Text>

                <Pressable onPress={handleBulkAll}>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "700",
                      color: colors.accent,
                    }}
                  >
                    Tümünü İşaretle
                  </Text>
                </Pressable>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
              >
                {data.seasons.map((s: any) => (
                  <Chip
                    key={s.seasonNumber}
                    label={`S${s.seasonNumber}`}
                    active={season === s.seasonNumber}
                    onPress={() => setSeason(s.seasonNumber)}
                    size="sm"
                  />
                ))}
              </ScrollView>

              <Pressable
                onPress={handleBulkSeason}
                disabled={bulk.isPending}
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 10,
                  paddingVertical: 10,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 12.5,
                    fontWeight: "700",
                    color: colors.accent,
                  }}
                >
                  {bulk.isPending
                    ? "İşaretleniyor..."
                    : `${season}. Sezonu İşaretle`}
                </Text>
              </Pressable>

              {seasonQ.isLoading ? (
                <ActivityIndicator color={colors.accent} />
              ) : (
                <View>
                  {seasonQ.data?.episodes?.map((ep: any) => (
                    <Pressable
                      key={ep.episode}
                      onPress={() => {
                        if (!ep.isAired) {
                          Alert.alert(
                            "Henüz yayınlanmadı",
                            "Bu bölüm henüz yayınlanmamış."
                          );
                          return;
                        }
                        router.push(
                          `/comments/episode/${id}?season=${season}&episode=${ep.episode}`
                        );
                      }}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 12,
                        paddingVertical: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border,
                        opacity: ep.isAired ? 1 : 0.4,
                      }}
                    >
                      {/* İzlendi kutusu — sadece bu izle/izleme yapar */}
                      <Pressable
                        onPress={(e) => {
                          e.stopPropagation();
                          handleToggle(ep.episode, ep.isAired, ep.name);
                        }}
                        hitSlop={10}
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 7,
                          borderWidth: 2,
                          borderColor: ep.watched
                            ? colors.accent
                            : colors.textFaint,
                          backgroundColor: ep.watched
                            ? colors.accent
                            : "transparent",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {ep.watched && (
                          <Check
                            size={13}
                            color={colors.accentText}
                            strokeWidth={3.5}
                          />
                        )}
                      </Pressable>

                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: "700",
                            color: colors.text,
                          }}
                          numberOfLines={1}
                        >
                          {ep.episode}. {ep.name}
                        </Text>
                        <Text
                          style={{
                            fontSize: 11,
                            color: colors.textDim,
                            marginTop: 2,
                          }}
                        >
                          {[ep.runtime ? `${ep.runtime} dk` : null, ep.airDate]
                            .filter(Boolean)
                            .join(" · ")}
                        </Text>
                      </View>

                      {/* Yorum ikonu — görsel ipucu (satırın kendisi de açar) */}
                      <MessageCircle size={16} color={colors.textFaint} />
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* İzledim Anketi */}
      {sheetEp && (
        <WatchedSheet
          visible={!!sheetEp}
          onClose={() => setSheetEp(null)}
          tmdbId={tmdbId}
          season={season}
          episode={sheetEp.episode}
          episodeName={sheetEp.name}
          cast={data.cast ?? []}
        />
      )}

      {/* Durum Seçici */}
      <StatusSheet
        visible={statusOpen}
        onClose={() => setStatusOpen(false)}
        type={type}
        current={record?.status ?? null}
        onSelect={(s) => setStatus.mutate(s)}
      />

      {/* Anket Oluştur */}
      <CreatePollSheet
        visible={pollSheetOpen}
        onClose={() => setPollSheetOpen(false)}
        type={type as string}
        tmdbId={id as string}
      />

      {/* Listeye Ekle */}
      <AddToListSheet
        visible={listSheetOpen}
        onClose={() => setListSheetOpen(false)}
        type={type as string}
        tmdbId={id as string}
      />
    </View>
  );
}