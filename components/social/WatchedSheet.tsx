import { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { useTheme } from "@/lib/store/theme";
import { StarRating } from "./StarRating";
import { ReactionPicker } from "./ReactionPicker";
import { useEpisodeReview, useSaveReview } from "@/lib/queries/review";

type Cast = {
  id: number;
  name: string;
  character: string;
  photo: string | null;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  tmdbId: number;
  season: number;
  episode: number;
  episodeName: string;
  cast: Cast[];
};

export function WatchedSheet({
  visible,
  onClose,
  tmdbId,
  season,
  episode,
  episodeName,
  cast,
}: Props) {
  const { colors } = useTheme();

  const reviewQ = useEpisodeReview(tmdbId, season, episode, visible);
  const save = useSaveReview(tmdbId);

  const [score, setScore] = useState<number | null>(null);
  const [reactions, setReactions] = useState<string[]>([]);
  const [favChar, setFavChar] = useState<number | null>(null);

  // Panel açılınca mevcut değerlendirmeyi yükle
  useEffect(() => {
    if (visible && reviewQ.data?.myReview) {
      setScore(reviewQ.data.myReview.score);
      setReactions(reviewQ.data.myReview.reactions ?? []);
      setFavChar(reviewQ.data.myReview.favoriteCharacterId);
    } else if (visible) {
      setScore(null);
      setReactions([]);
      setFavChar(null);
    }
  }, [visible, reviewQ.data]);

  const handleSave = () => {
    save.mutate(
      {
        season,
        episode,
        score,
        reactions,
        favoriteCharacterId: favChar,
      },
      { onSuccess: onClose }
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "flex-end",
        }}
        onPress={onClose}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: colors.surfaceAlt,
            borderTopLeftRadius: 22,
            borderTopRightRadius: 22,
            maxHeight: "88%",
            paddingTop: 14,
          }}
        >
          {/* Tutamaç */}
          <View
            style={{
              width: 40,
              height: 4,
              backgroundColor: colors.textFaint,
              borderRadius: 100,
              alignSelf: "center",
              marginBottom: 14,
            }}
          />

          <ScrollView
            contentContainerStyle={{ padding: 20, paddingTop: 0, gap: 22 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Başlık */}
            <View style={{ alignItems: "center", gap: 4 }}>
              <Text
                style={{ fontSize: 17, fontWeight: "800", color: colors.text }}
              >
                İzledim ✓
              </Text>
              <Text
                style={{ fontSize: 12, color: colors.textDim }}
                numberOfLines={1}
              >
                S{season}B{episode} · {episodeName}
              </Text>
            </View>

            {/* Puan */}
            <View style={{ gap: 10 }}>
              <Text
                style={{
                  fontSize: 13.5,
                  fontWeight: "700",
                  color: colors.textDim,
                  textAlign: "center",
                }}
              >
                Beğendin mi?
              </Text>
              <StarRating value={score} onChange={setScore} max={5} />
              {reviewQ.data?.avgScore != null && (
                <Text
                  style={{
                    fontSize: 11,
                    color: colors.textFaint,
                    textAlign: "center",
                  }}
                >
                  Topluluk ortalaması: {reviewQ.data.avgScore} /5 (
                  {reviewQ.data.totalReviews} değerlendirme)
                </Text>
              )}
            </View>

            {/* Tepkiler */}
            <View style={{ gap: 10 }}>
              <Text
                style={{
                  fontSize: 13.5,
                  fontWeight: "700",
                  color: colors.textDim,
                  textAlign: "center",
                }}
              >
                Ne hissettin?{" "}
                <Text style={{ fontSize: 11, color: colors.textFaint }}>
                  (en fazla 5)
                </Text>
              </Text>
              <ReactionPicker
                selected={reactions}
                onChange={setReactions}
                stats={reviewQ.data?.reactionStats}
              />
            </View>

            {/* Favori karakter */}
            {cast.length > 0 && (
              <View style={{ gap: 10 }}>
                <Text
                  style={{
                    fontSize: 13.5,
                    fontWeight: "700",
                    color: colors.textDim,
                    textAlign: "center",
                  }}
                >
                  Favori karakterin kimdi?
                </Text>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 12, paddingHorizontal: 4 }}
                >
                  {cast.slice(0, 12).map((c) => {
                    const active = favChar === c.id;
                    return (
                      <Pressable
                        key={c.id}
                        onPress={() => setFavChar(active ? null : c.id)}
                        style={{ width: 64, alignItems: "center" }}
                      >
                        <View
                          style={{
                            width: 56,
                            height: 56,
                            borderRadius: 100,
                            backgroundColor: colors.surface,
                            borderWidth: 2,
                            borderColor: active
                              ? colors.accent
                              : "transparent",
                            overflow: "hidden",
                          }}
                        >
                          {c.photo && (
                            <Image
                              source={{ uri: c.photo }}
                              style={{ width: "100%", height: "100%" }}
                              contentFit="cover"
                            />
                          )}
                        </View>
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: "700",
                            color: colors.text,
                            marginTop: 6,
                            textAlign: "center",
                          }}
                          numberOfLines={1}
                        >
                          {c.character || c.name}
                        </Text>
                        <Text
                          style={{
                            fontSize: 9.5,
                            color: colors.textDim,
                            textAlign: "center",
                          }}
                          numberOfLines={1}
                        >
                          {c.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Butonlar */}
            <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
              <Pressable
                onPress={onClose}
                style={{
                  flex: 1,
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  paddingVertical: 14,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "700",
                    color: colors.textDim,
                  }}
                >
                  Atla
                </Text>
              </Pressable>

              <Pressable
                onPress={handleSave}
                disabled={save.isPending}
                style={{
                  flex: 1,
                  backgroundColor: colors.accent,
                  borderRadius: 12,
                  paddingVertical: 14,
                  alignItems: "center",
                  opacity: save.isPending ? 0.6 : 1,
                }}
              >
                {save.isPending ? (
                  <ActivityIndicator size="small" color={colors.accentText} />
                ) : (
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "800",
                      color: colors.accentText,
                    }}
                  >
                    Kaydet
                  </Text>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}