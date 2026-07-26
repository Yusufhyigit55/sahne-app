import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Check, X, Bell ,ChevronRight} from "lucide-react-native";
import { useTheme } from "@/lib/store/theme";
import {
  useNotifications,
  useMarkRead,
  useDeleteNotification,
  type Notification,
} from "@/lib/queries/notifications";
import { useFollowRequests, useHandleRequest } from "@/lib/queries/social";

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

const NOTIF_TEXT: Record<string, (n: Notification) => string> = {
  follow: () => "seni takip etmeye başladı",
  follow_request: () => "takip isteği gönderdi",
  follow_accepted: () => "takip isteğini kabul etti",
  comment_reply: () => "yorumuna yanıt verdi",
  comment_like: () => "yorumunu beğendi",
  new_episode: (n) =>
    n.content
      ? `${n.content.titleTr} yeni bölümü yayınlandı`
      : "yeni bölüm yayınlandı",
  friend_watched: (n) =>
    n.content ? `${n.content.titleTr} izledi` : "bir şey izledi",
  friend_commented: (n) =>
    n.content ? `${n.content.titleTr} yorum yaptı` : "yorum yaptı",
  poll_result: () => "oy verdiğin anket kapandı",
  ban: (n) => n.message || "hesabına ceza uygulandı",
  spoiler_flagged: (n) => n.message || "yorumun spoiler olarak işaretlendi",
};

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const [tab, setTab] = useState<"notifications" | "activity">("notifications");
  const q = useNotifications(tab);
  const requestsQ = useFollowRequests();
  const markRead = useMarkRead();
  const del = useDeleteNotification();
  const handleReq = useHandleRequest();

  const requests = requestsQ.data ?? [];
  const items = q.data?.items ?? [];
  const unread = q.data?.unreadCount ?? 0;
  // İsme/avatara dokununca → profil
  const handlePressActor = (n: Notification) => {
    if (n.actor) {
      router.push(`/user/${n.actor.username}`);
    }
  };
  const handlePress = (n: Notification) => {
    if (!n.isRead) {
      markRead.mutate(n.id);
    }

    if (
      ["follow", "follow_request", "follow_accepted"].includes(n.type) &&
      n.actor
    ) {
      router.push(`/user/${n.actor.username}`);
      return;
    }

    if (n.type === "comment_reply" || n.type === "comment_like") {
      if (n.content) {
        const target = n.season != null ? "episode" : n.content.type;
        const qs =
          n.season != null
            ? `?season=${n.season}&episode=${n.episode}`
            : `?title=${encodeURIComponent(n.content.titleTr)}`;
        router.push(`/comments/${target}/${n.content.id}${qs}`);
      }
      return;
    }

    if (n.content) {
      router.push(`/content/${n.content.type}/${n.content.id}`);
    }
  };

  const handleClearAll = () => {
    Alert.alert("Tümünü Temizle", "Tüm bildirimleri silmek istiyor musun?", [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: () => del.mutate(undefined),
      },
    ]);
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.bg }}
      edges={["top"]}
    >
      <FlatList
        data={items}
        keyExtractor={(n) => n.id}
        contentContainerStyle={{ paddingBottom: 110 }}
        refreshControl={
          <RefreshControl
            refreshing={q.isRefetching}
            onRefresh={() => {
              q.refetch();
              requestsQ.refetch();
            }}
            tintColor={colors.accent}
          />
        }
        ListHeaderComponent={
          <View>
            {/* Başlık */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 18,
                paddingTop: 8,
                paddingBottom: 16,
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: "800",
                    color: colors.text,
                  }}
                >
                  Bildirimler
                </Text>

                {unread > 0 && (
                  <View
                    style={{
                      backgroundColor: colors.accent,
                      borderRadius: 100,
                      paddingHorizontal: 7,
                      paddingVertical: 2,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "800",
                        color: colors.accentText,
                      }}
                    >
                      {unread}
                    </Text>
                  </View>
                )}
              </View>

              {items.length > 0 && (
                <View style={{ flexDirection: "row", gap: 14 }}>
                  {unread > 0 && (
                    <Pressable onPress={() => markRead.mutate(undefined)}>
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "700",
                          color: colors.accent,
                        }}
                      >
                        Okundu
                      </Text>
                    </Pressable>
                  )}

                  <Pressable onPress={handleClearAll}>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "700",
                        color: colors.textDim,
                      }}
                    >
                      Temizle
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
            {/* Sekmeler: Bildirimler / Etkinlikler */}
            <View
              style={{
                flexDirection: "row",
                gap: 8,
                paddingHorizontal: 18,
                paddingBottom: 14,
              }}
            >
              <Pressable
                onPress={() => setTab("notifications")}
                style={{
                  flex: 1,
                  backgroundColor:
                    tab === "notifications" ? colors.accent : colors.surface,
                  borderRadius: 100,
                  paddingVertical: 9,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "800",
                    color:
                      tab === "notifications"
                        ? colors.accentText
                        : colors.textDim,
                  }}
                >
                  Bildirimler
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setTab("activity")}
                style={{
                  flex: 1,
                  backgroundColor:
                    tab === "activity" ? colors.accent : colors.surface,
                  borderRadius: 100,
                  paddingVertical: 9,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "800",
                    color:
                      tab === "activity" ? colors.accentText : colors.textDim,
                  }}
                >
                  Arkadaş Etkinliği
                </Text>
              </Pressable>
            </View>

{/* Takip İstekleri — kalıcı ayrı ekrana git */}
            {requests.length > 0 && (
              <Pressable
                onPress={() => router.push("/follow-requests")}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  marginHorizontal: 18,
                  marginBottom: 18,
                  padding: 14,
                  backgroundColor: colors.accentSoft,
                  borderRadius: 12,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: colors.accent,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      color: colors.accentText,
                      fontWeight: "800",
                      fontSize: 15,
                    }}
                  >
                    {requests.length}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: colors.text,
                    }}
                  >
                    Takip İstekleri
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textDim }}>
                    {requests.length} bekleyen istek
                  </Text>
                </View>
                <ChevronRight size={20} color={colors.textDim} />
              </Pressable>
            )}          </View>
        }
        renderItem={({ item }) => {
          const textFn = NOTIF_TEXT[item.type];
          const text = textFn ? textFn(item) : item.message;

          return (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 11,
                paddingHorizontal: 18,
                paddingVertical: 13,
                backgroundColor: item.isRead
                  ? "transparent"
                  : colors.accentSoft,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              {/* Avatar → profile (isme/avatara dokununca) */}
              <Pressable onPress={() => handlePressActor(item)}>
                {item.actor ? (
                  <View
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 100,
                      backgroundColor: colors.surface,
                      overflow: "hidden",
                    }}
                  >
                    {item.actor.avatar && (
                      <Image
                        source={{ uri: item.actor.avatar }}
                        style={{ width: "100%", height: "100%" }}
                        contentFit="cover"
                      />
                    )}
                  </View>
                ) : (
                  <View
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 100,
                      backgroundColor: colors.surface,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Bell size={16} color={colors.textDim} />
                  </View>
                )}
              </Pressable>

              {/* Mesaj → içerik (mesaja/postere dokununca) */}
              <Pressable
                onPress={() => handlePress(item)}
                style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 11 }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 13,
                      lineHeight: 19,
                      color: colors.textDim,
                    }}
                  >
                    {item.actor && (
                      <Text
                        style={{ fontWeight: "800", color: colors.text }}
                        onPress={() => handlePressActor(item)}
                      >
                        {item.actor.displayName}{" "}
                      </Text>
                    )}
                    {text}
                  </Text>

                  <Text
                    style={{
                      fontSize: 10.5,
                      color: colors.textFaint,
                      marginTop: 3,
                    }}
                  >
                    {timeAgo(item.createdAt)}
                  </Text>
                </View>

                {item.content?.poster && (
                  <View
                    style={{
                      width: 36,
                      height: 52,
                      borderRadius: 6,
                      backgroundColor: colors.surface,
                      overflow: "hidden",
                    }}
                  >
                    <Image
                      source={{ uri: item.content.poster }}
                      style={{ width: "100%", height: "100%" }}
                      contentFit="cover"
                    />
                  </View>
                )}

                {!item.isRead && (
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 100,
                      backgroundColor: colors.accent,
                    }}
                  />
                )}
              </Pressable>
            </View>
          );
        }}
        ListEmptyComponent={
          q.isLoading ? (
            <View style={{ paddingVertical: 40, alignItems: "center" }}>
              <ActivityIndicator color={colors.accent} />
            </View>
          ) : requests.length === 0 ? (
            <View
              style={{
                paddingVertical: 60,
                paddingHorizontal: 40,
                alignItems: "center",
                gap: 10,
              }}
            >
              <Bell size={30} color={colors.textFaint} />
              <Text
                style={{
                  fontSize: 13,
                  color: colors.textDim,
                  textAlign: "center",
                  lineHeight: 20,
                }}
              >
                Henüz bildirimin yok.{"\n"}
                Arkadaşlarını takip et, hareketlenmeye başlasın.
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}