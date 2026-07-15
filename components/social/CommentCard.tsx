import { useState } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { Image } from "expo-image";
import { ThumbsUp, ThumbsDown, Flag, AlertTriangle } from "lucide-react-native";
import { useTheme } from "@/lib/store/theme";
import { useAuth } from "@/lib/store/auth";
import {
  useVoteComment,
  useDeleteComment,
  type Comment,
} from "@/lib/queries/comment";

type Props = {
  comment: Comment;
  onReply?: (c: Comment) => void;
  onReport?: (c: Comment) => void;
  isReply?: boolean;
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "şimdi";
  if (min < 60) return `${min} dk`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} sa`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day} g`;
  return new Date(iso).toLocaleDateString("tr-TR");
}

export function CommentCard({ comment, onReply, onReport, isReply }: Props) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const vote = useVoteComment();
  const del = useDeleteComment();

  const [revealed, setRevealed] = useState(false);

  const isMine = user?.id === comment.user.id;
  const showSpoiler = comment.isHidden && !revealed;

  const handleDelete = () => {
    Alert.alert(
      "Yorumu Sil",
      "Bu yorumu ve tüm yanıtlarını silmek istediğine emin misin?",
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: () => del.mutate(comment.id),
        },
      ]
    );
  };

  if (comment.isDeleted) {
    return (
      <View
        style={{
          paddingVertical: 14,
          paddingLeft: isReply ? 47 : 0,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <Text style={{ fontSize: 12.5, color: colors.textFaint, fontStyle: "italic" }}>
          Bu yorum silindi
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flexDirection: "row",
        gap: 11,
        paddingVertical: 14,
        paddingLeft: isReply ? 47 : 0,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      {/* Avatar */}
      <View
        style={{
          width: isReply ? 28 : 36,
          height: isReply ? 28 : 36,
          borderRadius: 100,
          backgroundColor: colors.surface,
          overflow: "hidden",
        }}
      >
        {comment.user.avatar && (
          <Image
            source={{ uri: comment.user.avatar }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
          />
        )}
      </View>

      <View style={{ flex: 1 }}>
        {/* Üst satır: isim + rozet + zaman */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            flexWrap: "wrap",
          }}
        >
          <Text
            style={{
              fontSize: isReply ? 12 : 13,
              fontWeight: "800",
              color: colors.text,
            }}
          >
            {comment.user.username}
          </Text>

          {/* İzleme rozeti */}
          {comment.hasWatched ? (
            <View
              style={{
                backgroundColor: colors.accentSoft,
                borderRadius: 100,
                paddingHorizontal: 7,
                paddingVertical: 2,
              }}
            >
              <Text
                style={{ fontSize: 9.5, fontWeight: "700", color: colors.accent }}
              >
                ✓ İzledi
              </Text>
            </View>
          ) : (
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 100,
                paddingHorizontal: 7,
                paddingVertical: 2,
              }}
            >
              <Text
                style={{
                  fontSize: 9.5,
                  fontWeight: "700",
                  color: colors.textDim,
                }}
              >
                Henüz izlemedi
              </Text>
            </View>
          )}

          <Text
            style={{ fontSize: 10.5, color: colors.textFaint, marginLeft: "auto" }}
          >
            {timeAgo(comment.createdAt)}
          </Text>
        </View>

        {/* İçerik */}
        {showSpoiler ? (
          <Pressable
            onPress={() => setRevealed(true)}
            style={{
              marginTop: 7,
              backgroundColor: colors.surfaceAlt,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 10,
              padding: 13,
              gap: 10,
              alignItems: "center",
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
            >
              <AlertTriangle size={13} color={colors.warn} />
              <Text
                style={{ fontSize: 11, fontWeight: "800", color: colors.warn }}
              >
                Bu yorum spoiler içeriyor
              </Text>
            </View>

            <View
              style={{
                backgroundColor: colors.accent,
                borderRadius: 100,
                paddingVertical: 7,
                paddingHorizontal: 15,
              }}
            >
              <Text
                style={{
                  fontSize: 11.5,
                  fontWeight: "800",
                  color: colors.accentText,
                }}
              >
                Yine de Göster
              </Text>
            </View>
          </Pressable>
        ) : (
          <View style={{ marginTop: 6 }}>
            {comment.mentionedUser && (
              <Text
                style={{
                  fontSize: 12.5,
                  fontWeight: "700",
                  color: colors.accent,
                }}
              >
                @{comment.mentionedUser.username}{" "}
                <Text
                  style={{
                    fontWeight: "400",
                    color: colors.textDim,
                    lineHeight: 20,
                  }}
                >
                  {comment.body}
                </Text>
              </Text>
            )}

            {!comment.mentionedUser && comment.body && (
              <Text
                style={{
                  fontSize: 13,
                  lineHeight: 20,
                  color: colors.textDim,
                }}
              >
                {comment.body}
              </Text>
            )}

            {comment.gifUrl && (
              <Image
                source={{ uri: comment.gifUrl }}
                style={{
                  width: 150,
                  height: 90,
                  borderRadius: 10,
                  marginTop: 8,
                }}
                contentFit="cover"
              />
            )}

            {comment.editedAt && (
              <Text
                style={{ fontSize: 10, color: colors.textFaint, marginTop: 3 }}
              >
                (düzenlendi)
              </Text>
            )}
          </View>
        )}

        {/* Alt satır: oy + yanıt + şikayet */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
            marginTop: 9,
          }}
        >
          <Pressable
            onPress={() => vote.mutate({ commentId: comment.id, value: 1 })}
            style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
            hitSlop={6}
          >
            <ThumbsUp
              size={14}
              color={comment.myVote === 1 ? colors.accent : colors.textDim}
            />
            <Text
              style={{
                fontSize: 11.5,
                fontWeight: "600",
                color: comment.myVote === 1 ? colors.accent : colors.textDim,
              }}
            >
              {comment.likeCount}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => vote.mutate({ commentId: comment.id, value: -1 })}
            style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
            hitSlop={6}
          >
            <ThumbsDown
              size={14}
              color={comment.myVote === -1 ? colors.danger : colors.textDim}
            />
            <Text
              style={{
                fontSize: 11.5,
                fontWeight: "600",
                color: comment.myVote === -1 ? colors.danger : colors.textDim,
              }}
            >
              {comment.dislikeCount}
            </Text>
          </Pressable>

          {onReply && (
            <Pressable onPress={() => onReply(comment)} hitSlop={6}>
              <Text
                style={{
                  fontSize: 11.5,
                  fontWeight: "700",
                  color: colors.textDim,
                }}
              >
                Yanıtla
                {comment.replyCount > 0 ? ` (${comment.replyCount})` : ""}
              </Text>
            </Pressable>
          )}

          <View style={{ marginLeft: "auto", flexDirection: "row", gap: 12 }}>
            {isMine && (
              <Pressable onPress={handleDelete} hitSlop={6}>
                <Text style={{ fontSize: 11, color: colors.danger }}>Sil</Text>
              </Pressable>
            )}

            {!isMine && onReport && (
              <Pressable onPress={() => onReport(comment)} hitSlop={6}>
                <Flag size={13} color={colors.textFaint} />
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}