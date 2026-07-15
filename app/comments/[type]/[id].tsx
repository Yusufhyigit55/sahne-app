import { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { ChevronLeft, AlertTriangle } from "lucide-react-native";
import { useTheme } from "@/lib/store/theme";
import { Chip } from "@/components/ui/Chip";
import { CommentCard } from "@/components/social/CommentCard";
import { CommentInput } from "@/components/social/CommentInput";
import { ReportSheet } from "@/components/social/ReportSheet";
import {
  useComments,
  useReplies,
  type Comment,
  type CommentTarget,
  type SortMode,
} from "@/lib/queries/comment";

export default function CommentsScreen() {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{
    type: string;
    id: string;
    season?: string;
    episode?: string;
    title?: string;
  }>();

  const targetType = params.type as CommentTarget;
  const contentId = params.id;
  const season = params.season ? Number(params.season) : undefined;
  const episode = params.episode ? Number(params.episode) : undefined;

  const [sort, setSort] = useState<SortMode>("popular");
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [reportTarget, setReportTarget] = useState<Comment | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const q = useComments({ targetType, contentId, season, episode, sort });
  const repliesQ = useReplies(expandedId ?? "", !!expandedId);

  const handleReply = (c: Comment) => {
    setReplyTo(c);
    setExpandedId(c.id);
  };

  const subtitle =
    targetType === "episode"
      ? `S${season}B${episode}`
      : params.title ?? "";

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.bg }}
      edges={["top"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* Başlık */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            paddingHorizontal: 18,
            paddingVertical: 14,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <Pressable
            onPress={() => router.back()}
            style={{
              width: 32,
              height: 32,
              borderRadius: 100,
              backgroundColor: colors.surface,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ChevronLeft size={18} color={colors.text} />
          </Pressable>

          <View>
            <Text
              style={{ fontSize: 16, fontWeight: "800", color: colors.text }}
            >
              Yorumlar
            </Text>
            <Text style={{ fontSize: 11.5, color: colors.textDim, marginTop: 2 }}>
              {subtitle} · {q.data?.totalWithReplies ?? 0} yorum
            </Text>
          </View>
        </View>

        {/* Spoiler uyarı bandı */}
        {q.data && !q.data.viewerWatched && (
          <View
            style={{
              flexDirection: "row",
              gap: 10,
              alignItems: "flex-start",
              margin: 18,
              marginBottom: 0,
              backgroundColor: colors.warnSoft,
              borderWidth: 1,
              borderColor: colors.warn,
              borderRadius: 12,
              padding: 13,
            }}
          >
            <AlertTriangle size={17} color={colors.warn} />
            <Text
              style={{
                flex: 1,
                fontSize: 12.5,
                lineHeight: 18,
                fontWeight: "600",
                color: colors.warn,
              }}
            >
              {targetType === "episode"
                ? "Bu bölümü henüz izlemediniz. Yorumlar spoiler içerebilir."
                : "Bu içeriği henüz izlemediniz. Yorumlar spoiler içerebilir."}
            </Text>
          </View>
        )}

        {/* Sıralama */}
        <View
          style={{
            flexDirection: "row",
            gap: 8,
            paddingHorizontal: 18,
            paddingVertical: 12,
          }}
        >
          <Chip
            label="En Popüler"
            active={sort === "popular"}
            onPress={() => setSort("popular")}
            size="sm"
          />
          <Chip
            label="En Yeni"
            active={sort === "new"}
            onPress={() => setSort("new")}
            size="sm"
          />
        </View>

        {/* Yorum listesi */}
        {q.isLoading ? (
          <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : (
          <FlatList
            data={q.data?.comments ?? []}
            keyExtractor={(c) => c.id}
            contentContainerStyle={{ paddingHorizontal: 18 }}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <View>
                <CommentCard
                  comment={item}
                  onReply={handleReply}
                  onReport={setReportTarget}
                />

                {/* Yanıtlar */}
                {expandedId === item.id && (
                  <View>
                    {repliesQ.isLoading ? (
                      <View style={{ padding: 12, paddingLeft: 47 }}>
                        <ActivityIndicator
                          size="small"
                          color={colors.accent}
                        />
                      </View>
                    ) : (
                      repliesQ.data?.map((r) => (
                        <CommentCard
                          key={r.id}
                          comment={r}
                          onReport={setReportTarget}
                          isReply
                        />
                      ))
                    )}
                  </View>
                )}

                {/* Yanıtları göster / gizle */}
                {item.replyCount > 0 && (
                  <Pressable
                    onPress={() =>
                      setExpandedId(expandedId === item.id ? null : item.id)
                    }
                    style={{ paddingLeft: 47, paddingVertical: 8 }}
                  >
                    <Text
                      style={{
                        fontSize: 11.5,
                        fontWeight: "700",
                        color: colors.accent,
                      }}
                    >
                      {expandedId === item.id
                        ? "Yanıtları gizle"
                        : `${item.replyCount} yanıtı göster`}
                    </Text>
                  </Pressable>
                )}
              </View>
            )}
            ListEmptyComponent={
              <View style={{ alignItems: "center", padding: 50 }}>
                <Text
                  style={{
                    fontSize: 13,
                    color: colors.textDim,
                    textAlign: "center",
                    lineHeight: 20,
                  }}
                >
                  Henüz yorum yok.{"\n"}İlk yorumu sen yaz.
                </Text>
              </View>
            }
          />
        )}

        {/* Yorum girişi */}
        <CommentInput
          targetType={targetType}
          contentId={contentId}
          season={season}
          episode={episode}
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
        />
      </KeyboardAvoidingView>

      {/* Şikayet paneli */}
      <ReportSheet
        comment={reportTarget}
        onClose={() => setReportTarget(null)}
      />
    </SafeAreaView>
  );
}