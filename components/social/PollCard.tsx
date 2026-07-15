// components/social/PollCard.tsx : Tek bir anketi gösterir; oy alma, sonuç yüzdeleri, spoiler bulanıklığı ve silme içerir.
import { useState } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { Trash2, Lock, EyeOff } from "lucide-react-native";
import { useTheme } from "@/lib/store/theme";
import { useAuth } from "@/lib/store/auth";
import {
  Poll,
  POLL_TYPE_LABELS,
  useVotePoll,
  useDeletePoll,
} from "@/lib/queries/poll";

type Props = {
  poll: Poll;
  type: string;
  tmdbId: number | string;
  watched: boolean; // kullanıcı içeriği izledi mi (spoiler için)
};

export function PollCard({ poll, type, tmdbId, watched }: Props) {
  const { colors } = useTheme();
  const { user } = useAuth();

  const vote = useVotePoll(type, tmdbId);
  const del = useDeletePoll(type, tmdbId);

  // Spoiler anketse ve izlemediyse başta gizli
  const [revealed, setRevealed] = useState(false);
  const blurred = poll.isSpoiler && !watched && !revealed;

  const isMulti = poll.type === "multiple";
  const isOwner = user?.id === poll.creatorId;
  const showResults = poll.hasVoted;

  const [pending, setPending] = useState<string[]>(poll.myOptionIds ?? []);

  const onSelect = (optionId: string) => {
    if (poll.isClosed) return;

    if (isMulti) {
      // Çok seçim: aç/kapat, hemen göndermeden topla
      const next = pending.includes(optionId)
        ? pending.filter((x) => x !== optionId)
        : [...pending, optionId];
      setPending(next);
    } else {
      // Tek seçim: anında gönder
      vote.mutate({ pollId: poll.id, optionIds: [optionId] });
    }
  };

  const submitMulti = () => {
    if (pending.length === 0) return;
    vote.mutate({ pollId: poll.id, optionIds: pending });
  };

  const onDelete = () => {
    Alert.alert("Anketi sil", "Bu anket kalıcı olarak silinecek.", [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: () => del.mutate(poll.id),
      },
    ]);
  };

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 16,
        marginBottom: 12,
      }}
    >
      {/* Üst satır: tip etiketi + spoiler/kapalı + sil */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 10,
          gap: 8,
        }}
      >
        <View
          style={{
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 100,
            backgroundColor: colors.accentSoft,
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: "700",
              color: colors.accent,
            }}
          >
            {POLL_TYPE_LABELS[poll.type]}
          </Text>
        </View>

        {poll.isSpoiler && (
          <EyeOff size={14} color={colors.warn} />
        )}
        {poll.isClosed && <Lock size={14} color={colors.textFaint} />}

        <View style={{ flex: 1 }} />

        {isOwner && (
          <Pressable onPress={onDelete} hitSlop={8}>
            <Trash2 size={16} color={colors.textFaint} />
          </Pressable>
        )}
      </View>

      {/* Soru */}
      <Text
        style={{
          fontSize: 15.5,
          fontWeight: "700",
          color: colors.text,
          marginBottom: 14,
          lineHeight: 22,
        }}
      >
        {poll.question}
      </Text>

      {/* Spoiler perdesi */}
      {blurred ? (
        <Pressable
          onPress={() => setRevealed(true)}
          style={{
            paddingVertical: 22,
            alignItems: "center",
            borderRadius: 12,
            backgroundColor: colors.surfaceAlt,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <EyeOff size={20} color={colors.textDim} />
          <Text
            style={{
              fontSize: 13,
              color: colors.textDim,
              marginTop: 6,
              fontWeight: "600",
            }}
          >
            Spoiler içerebilir · Yine de göster
          </Text>
        </Pressable>
      ) : (
        <>
          {/* Seçenekler */}
          {poll.options.map((opt) => {
            const selected = isMulti
              ? pending.includes(opt.id)
              : poll.myOptionIds?.includes(opt.id);
            const pct = showResults ? opt.percent ?? 0 : null;

            return (
              <Pressable
                key={opt.id}
                onPress={() => onSelect(opt.id)}
                disabled={poll.isClosed || vote.isPending}
                style={{
                  marginBottom: 8,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: selected ? colors.accent : colors.border,
                  overflow: "hidden",
                  backgroundColor: colors.surfaceAlt,
                }}
              >
                {/* Sonuç dolgusu (arka plan bar) */}
                {pct != null && (
                  <View
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: `${pct}%`,
                      backgroundColor: selected
                        ? colors.accentSoft
                        : colors.surfaceRaised,
                    }}
                  />
                )}

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: 12,
                    paddingHorizontal: 14,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: selected ? "700" : "600",
                      color: colors.text,
                      flex: 1,
                    }}
                  >
                    {opt.text}
                  </Text>

                  {pct != null && (
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "700",
                        color: selected ? colors.accent : colors.textDim,
                        marginLeft: 8,
                      }}
                    >
                      %{pct}
                    </Text>
                  )}
                </View>
              </Pressable>
            );
          })}

          {/* Çok seçimli anket için gönder butonu */}
          {isMulti && !poll.isClosed && (
            <Pressable
              onPress={submitMulti}
              disabled={pending.length === 0 || vote.isPending}
              style={{
                marginTop: 4,
                paddingVertical: 11,
                borderRadius: 12,
                alignItems: "center",
                backgroundColor:
                  pending.length > 0 ? colors.accent : colors.surfaceAlt,
              }}
            >
              <Text
                style={{
                  fontSize: 13.5,
                  fontWeight: "700",
                  color:
                    pending.length > 0 ? colors.accentText : colors.textFaint,
                }}
              >
                {poll.hasVoted ? "Oyu güncelle" : "Oyla"}
              </Text>
            </Pressable>
          )}

          {/* Alt bilgi: toplam oy */}
          <Text
            style={{
              fontSize: 12,
              color: colors.textFaint,
              marginTop: 6,
            }}
          >
            {poll.totalVotes} oy
            {poll.hasVoted ? " · Tekrar dokunarak oyunu geri çekebilirsin" : ""}
          </Text>
        </>
      )}
    </View>
  );
}