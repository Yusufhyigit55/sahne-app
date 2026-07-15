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
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useTheme } from "@/lib/store/theme";
import { Chip } from "@/components/ui/Chip";
import { useBlockedUsers } from "@/lib/queries/settings";
import { useToggleBlock } from "@/lib/queries/social";

type Tab = "block" | "mute";

export default function BlockedScreen() {
  const { colors } = useTheme();
  const [tab, setTab] = useState<Tab>("block");

  const q = useBlockedUsers(tab);
  const toggle = useToggleBlock();

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

        <Text style={{ fontSize: 18, fontWeight: "800", color: colors.text }}>
          Engellenenler
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
          label="Engellenenler"
          active={tab === "block"}
          onPress={() => setTab("block")}
        />
        <Chip
          label="Sessize Alınanlar"
          active={tab === "mute"}
          onPress={() => setTab("mute")}
        />
      </View>

      {/* Açıklama */}
      <Text
        style={{
          fontSize: 11.5,
          color: colors.textDim,
          paddingHorizontal: 18,
          paddingBottom: 14,
          lineHeight: 17,
        }}
      >
        {tab === "block"
          ? "Engellediğin kişiler seni göremez, sen de onları göremezsin."
          : "Sessize aldığın kişilerin aktiviteleri akışında görünmez. Karşı taraf bunu bilmez."}
      </Text>

      {/* Liste */}
      {q.isLoading ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(u) => u.id}
          contentContainerStyle={{ paddingHorizontal: 18 }}
          renderItem={({ item }) => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <View
                style={{
                  width: 42,
                  height: 42,
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
                <Text
                  style={{
                    fontSize: 13.5,
                    fontWeight: "700",
                    color: colors.text,
                  }}
                >
                  {item.displayName}
                </Text>
                <Text style={{ fontSize: 11.5, color: colors.textDim }}>
                  @{item.username}
                </Text>
              </View>

              <Pressable
                onPress={() =>
                  toggle.mutate({ username: item.username, type: tab })
                }
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 100,
                  paddingVertical: 7,
                  paddingHorizontal: 14,
                }}
              >
                <Text
                  style={{
                    fontSize: 11.5,
                    fontWeight: "700",
                    color: colors.accent,
                  }}
                >
                  {tab === "block" ? "Kaldır" : "Aç"}
                </Text>
              </Pressable>
            </View>
          )}
          ListEmptyComponent={
            <View style={{ alignItems: "center", padding: 50 }}>
              <Text style={{ fontSize: 13, color: colors.textDim }}>
                {tab === "block"
                  ? "Engellediğin kimse yok"
                  : "Sessize aldığın kimse yok"}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}