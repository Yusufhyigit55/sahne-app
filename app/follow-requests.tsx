// app/follow-requests.tsx : Kalıcı Takip İstekleri ekranı — kabul/reddet + geri takip.
import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ChevronLeft, Check, X, UserPlus } from "lucide-react-native";
import { useTheme } from "@/lib/store/theme";
import {
  useFollowRequests,
  useHandleRequest,
  useToggleFollow,
} from "@/lib/queries/social";
import { SCREEN_PADDING, spacing, fontSize, fontWeight, radius } from "@/theme";

export default function FollowRequestsScreen() {
  const { colors } = useTheme();
  const q = useFollowRequests();
  const handle = useHandleRequest();
  const follow = useToggleFollow();

  // Kabul edilip geri takip edilenleri işaretle (UI için)
  const [followedBack, setFollowedBack] = useState<Set<string>>(new Set());
  const [accepted, setAccepted] = useState<Set<string>>(new Set());

  const requests = q.data ?? [];

  const onAccept = (requestId: string, username: string) => {
    setAccepted((s) => new Set(s).add(requestId));
    handle.mutate({ requestId, action: "accept" });
  };

  const onReject = (requestId: string) => {
    handle.mutate({ requestId, action: "reject" });
  };

  const onFollowBack = (username: string) => {
    setFollowedBack((s) => new Set(s).add(username));
    follow.mutate(username);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      {/* Başlık */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.sm,
          paddingHorizontal: SCREEN_PADDING,
          paddingVertical: spacing.md,
        }}
      >
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ChevronLeft size={26} color={colors.text} />
        </Pressable>
        <Text
          style={{
            fontSize: fontSize.xl,
            fontWeight: fontWeight.heavy,
            color: colors.text,
          }}
        >
          Takip İstekleri
        </Text>
      </View>

      {q.isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : requests.length === 0 ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: SCREEN_PADDING,
          }}
        >
          <Text
            style={{
              fontSize: fontSize.md,
              color: colors.textDim,
              textAlign: "center",
            }}
          >
            Bekleyen takip isteğin yok.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{
            padding: SCREEN_PADDING,
            gap: spacing.sm,
          }}
        >
          {requests.map((req) => {
            const isAccepted = accepted.has(req.id);
            const didFollowBack = followedBack.has(req.user.username);
            return (
              <View
                key={req.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: spacing.md,
                  backgroundColor: colors.surface,
                  borderRadius: radius.lg,
                  padding: spacing.md,
                }}
              >
                <Pressable
                  onPress={() => router.push(`/user/${req.user.username}`)}
                  style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}
                >
                  {req.user.avatar ? (
                    <Image
                      source={{ uri: req.user.avatar }}
                      style={{ width: 44, height: 44, borderRadius: 22 }}
                    />
                  ) : (
                    <View
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        backgroundColor: colors.surfaceAlt,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ color: colors.textDim, fontSize: 18 }}>
                        {req.user.displayName?.[0] ?? req.user.username[0]}
                      </Text>
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: fontSize.md,
                        fontWeight: fontWeight.bold,
                        color: colors.text,
                      }}
                      numberOfLines={1}
                    >
                      {req.user.displayName || req.user.username}
                    </Text>
                    <Text
                      style={{ fontSize: fontSize.sm, color: colors.textDim }}
                      numberOfLines={1}
                    >
                      @{req.user.username}
                    </Text>
                  </View>
                </Pressable>

                {/* Aksiyonlar */}
                {isAccepted ? (
                  <Pressable
                    onPress={() => onFollowBack(req.user.username)}
                    disabled={didFollowBack}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 5,
                      backgroundColor: didFollowBack
                        ? colors.surfaceAlt
                        : colors.accent,
                      borderRadius: radius.md,
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                    }}
                  >
                    {!didFollowBack && (
                      <UserPlus size={14} color={colors.accentText} />
                    )}
                    <Text
                      style={{
                        fontSize: fontSize.sm,
                        fontWeight: fontWeight.bold,
                        color: didFollowBack ? colors.textDim : colors.accentText,
                      }}
                    >
                      {didFollowBack ? "Takip ediliyor" : "Geri takip et"}
                    </Text>
                  </Pressable>
                ) : (
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <Pressable
                      onPress={() => onAccept(req.id, req.user.username)}
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 19,
                        backgroundColor: colors.accent,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Check size={18} color={colors.accentText} strokeWidth={2.5} />
                    </Pressable>
                    <Pressable
                      onPress={() => onReject(req.id)}
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 19,
                        backgroundColor: colors.surfaceAlt,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <X size={18} color={colors.textDim} strokeWidth={2.5} />
                    </Pressable>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}