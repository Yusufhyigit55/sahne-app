// components/social/MovieWatchedSheet.tsx : Film "İzledim" sonrası puan + reaksiyon + favori karakter toplayan sheet.
import { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
  Image,
} from "react-native";
import { Check, X } from "lucide-react-native";
import { useTheme } from "@/lib/store/theme";
import { StarRating } from "@/components/social/StarRating";
import { ReactionPicker } from "@/components/social/ReactionPicker";
import { useMovieWatch } from "@/lib/queries/watch";
import { useCharacterVote, useVoteCharacter } from "@/lib/queries/review";

type Cast = {
  id: number;
  name: string;
  character: string;
  profilePath?: string | null;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  tmdbId: number;
  title: string;
  cast: Cast[];
  // Tekrar açıldığında mevcut değerleri göstermek için
  initialRating?: number | null;
  initialReactions?: string[];
};

export function MovieWatchedSheet({
  visible,
  onClose,
  tmdbId,
  title,
  cast,
  initialRating,
  initialReactions,
}: Props) {
  const { colors } = useTheme();

  const movieWatch = useMovieWatch(tmdbId);
  const voteQ = useCharacterVote("movie", tmdbId);
  const vote = useVoteCharacter("movie", tmdbId);

  const [rating, setRating] = useState<number | null>(null);
  const [reactions, setReactions] = useState<string[]>([]);

  // Sheet açılınca mevcut değerleri doldur (tekrar erişim)
  useEffect(() => {
    if (visible) {
      setRating(initialRating ?? null);
      setReactions(initialReactions ?? []);
    }
  }, [visible, initialRating, initialReactions]);

  const myVotedCharacter = voteQ.data?.myVote ?? null;
  // Oy istatistikleri: characterId → { count, percent }
  const voteStats = new Map(
    (voteQ.data?.stats ?? []).map((s) => [
      s.characterId,
      { count: s.count, percent: s.percent },
    ])
  );
  const totalVotes = voteQ.data?.totalVotes ?? 0;

  // Karakterleri oy sayısına göre sırala (en çok seçilen önce), oy almayanlar sonra
  const sortedCast = [...cast].sort((a, b) => {
    const ca = voteStats.get(a.id)?.count ?? 0;
    const cb = voteStats.get(b.id)?.count ?? 0;
    return cb - ca;
  });

  const handleRating = (v: number | null) => {
    setRating(v);
    movieWatch.mutate({ rating: v });
  };

  const handleReactions = (v: string[]) => {
    setReactions(v);
    movieWatch.mutate({ reactions: v });
  };
  const handleVoteCharacter = (c: Cast) => {
    // Aynı karaktere tekrar basınca geri alma davranışı backend'de yoksa sadece oyla
    vote.mutate({
      characterId: c.id,
      characterName: c.character || c.name,
      actorName: c.name,
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        {/* Karartma */}
        <Pressable
          onPress={onClose}
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        />

        <View
          style={{
            backgroundColor: colors.bg,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: "85%",
            paddingTop: 8,
          }}
        >
          {/* Tutamaç + başlık */}
          <View style={{ alignItems: "center", paddingVertical: 6 }}>
            <View
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: colors.border,
              }}
            />
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 20,
              paddingBottom: 8,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color: colors.accent,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                İzledin 🎬
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "800",
                  color: colors.text,
                  marginTop: 2,
                }}
                numberOfLines={1}
              >
                {title}
              </Text>
            </View>
            <Pressable onPress={onClose} hitSlop={8}>
              <X size={22} color={colors.textDim} />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={{ padding: 20, gap: 26, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            {/* PUAN */}
            <View style={{ gap: 12, alignItems: "center" }}>
              <Text
                style={{ fontSize: 15, fontWeight: "700", color: colors.text }}
              >
                Kaç puan verirsin?
              </Text>
              <StarRating value={rating} onChange={handleRating} max={10} />
              {rating != null && (
                <Text style={{ fontSize: 13, color: colors.textDim }}>
                  {rating}/10
                </Text>
              )}
            </View>

            {/* REAKSİYON */}
            <View style={{ gap: 12, alignItems: "center" }}>
              <Text
                style={{ fontSize: 15, fontWeight: "700", color: colors.text }}
              >
                Nasıl hissettin?
              </Text>
              <ReactionPicker selected={reactions} onChange={handleReactions} />
            </View>

            {/* FAVORİ KARAKTER */}
            {cast.length > 0 && (
              <View style={{ gap: 12 }}>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "700",
                    color: colors.text,
                    textAlign: "center",
                  }}
                >
                  Favori karakterin?
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 12, paddingHorizontal: 4 }}
                >
                  {sortedCast.slice(0, 15).map((c) => {
                    const selected = myVotedCharacter === c.id;
                    const stat = voteStats.get(c.id);
                    return (
                      <Pressable
                        key={c.id}
                        onPress={() => handleVoteCharacter(c)}
                        style={{ width: 78, alignItems: "center", gap: 6 }}
                      >
                        <View
                          style={{
                            width: 72,
                            height: 72,
                            borderRadius: 36,
                            backgroundColor: colors.surfaceAlt,
                            borderWidth: 2.5,
                            borderColor: selected
                              ? colors.accent
                              : "transparent",
                            overflow: "hidden",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {c.profilePath ? (
                            <Image
                              source={{
                                uri: `https://image.tmdb.org/t/p/w185${c.profilePath}`,
                              }}
                              style={{ width: "100%", height: "100%" }}
                            />
                          ) : (
                            <Text
                              style={{
                                fontSize: 22,
                                color: colors.textFaint,
                              }}
                            >
                              {(c.character || c.name)[0]}
                            </Text>
                          )}
                          {selected && (
                            <View
                              style={{
                                position: "absolute",
                                right: 0,
                                bottom: 0,
                                width: 24,
                                height: 24,
                                borderRadius: 12,
                                backgroundColor: colors.accent,
                                alignItems: "center",
                                justifyContent: "center",
                                borderWidth: 2,
                                borderColor: colors.bg,
                              }}
                            >
                              <Check size={13} color={colors.accentText} />
                            </View>
                          )}
                        </View>
                        <Text
                          style={{
                            fontSize: 11,
                            color: selected ? colors.accent : colors.textDim,
                            fontWeight: selected ? "700" : "500",
                            textAlign: "center",
                          }}
                          numberOfLines={1}
                        >
                          {c.character || c.name}
                        </Text>
                        {totalVotes > 0 && stat && (
                          <Text
                            style={{
                              fontSize: 10.5,
                              fontWeight: "800",
                              color: colors.accent,
                            }}
                          >
                            %{stat.percent}
                          </Text>
                        )}
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Bitir */}
            <Pressable
              onPress={onClose}
              style={{
                backgroundColor: colors.accent,
                borderRadius: 14,
                paddingVertical: 15,
                alignItems: "center",
                marginTop: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "800",
                  color: colors.accentText,
                }}
              >
                Tamam
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}