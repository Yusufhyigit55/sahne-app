import { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useLocalSearchParams, router } from "expo-router";
import { ChevronLeft, Lock } from "lucide-react-native";
import { useTheme } from "@/lib/store/theme";
import { Chip } from "@/components/ui/Chip";
import { useFollowList } from "@/lib/queries/social";

type Tab = "followers" | "following";

export default function FollowListScreen() {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{
    username: string;
    tab?: string;
  }>();

  const [tab, setTab] = useState<Tab>(
    (params.tab as Tab) ?? "followers"
  );

  const q = useFollowList(params.username, tab);
  const users = q.data ?? [];

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.bg }}
      edges={["top"]}
    >
      {/* Başlık */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          paddingHorizontal: 18,
          paddingVertical: 12,
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

        <Text style={{ fontSize: 16, fontWeight: "800", color: colors.text }}>
          @{params.username}
        </Text>
      </View>

      {/* Sekmeler */}
      <View
        style={{
          flexDirection: "row",
          gap: 8,
          paddingHorizontal: 18,
          paddingBottom: 14,
        }}
      >
        <Chip
          label="Takipçiler"
          active={tab === "followers"}
          onPress={() => setTab("followers")}
        />
        <Chip
          label="Takip Edilenler"
          active={tab === "following"}
          onPress={() => setTab("following")}
        />
      </View>

      {/* Liste */}
      {q.isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(u) => u.id}
          contentContainerStyle={{ paddingHorizontal: 18, gap: 4 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/user/${item.username}`)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                paddingVertical: 12,
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 100,
                  backgroundColor: colors.surface,
                  overflow: "hidden",
                }}
              >
                {item.avatar && (
                  <Image
                    source={{ uri: item.avatar }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                  />
                )}
              </View>

              <View style={{ flex: 1 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13.5,
                      fontWeight: "700",
                      color: colors.text,
                    }}
                  >
                    {item.displayName}
                  </Text>
                </View>

                <Text style={{ fontSize: 11.5, color: colors.textDim }}>
                  @{item.username}
                </Text>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={
            <View style={{ alignItems: "center", padding: 50 }}>
              <Text style={{ fontSize: 13, color: colors.textDim }}>
                {tab === "followers"
                  ? "Henüz takipçi yok"
                  : "Henüz kimseyi takip etmiyor"}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}