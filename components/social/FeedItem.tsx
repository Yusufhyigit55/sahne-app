import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { AlertTriangle } from "lucide-react-native";
import { useTheme } from "@/lib/store/theme";
import type { FeedItem as FeedItemType } from "@/lib/queries/social";

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

export function FeedItem({ item }: { item: FeedItemType }) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={() =>
        router.push(`/content/${item.content.type}/${item.content.id}`)
      }
      style={{
        flexDirection: "row",
        gap: 12,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      {/* Avatar */}
      <Pressable
        onPress={(e) => {
          e.stopPropagation();
          router.push(`/user/${item.user.username}`);
        }}
      >
        <View
          style={{
            width: 38,
            height: 38,
            borderRadius: 100,
            backgroundColor: colors.surface,
            overflow: "hidden",
          }}
        >
          {item.user.avatar && (
            <Image
              source={{ uri: item.user.avatar }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
            />
          )}
        </View>
      </Pressable>

      {/* İçerik */}
      <View style={{ flex: 1, gap: 4 }}>
        <View
          style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
        >
          <Text
            style={{ fontSize: 13, fontWeight: "800", color: colors.text }}
          >
            {item.user.displayName}
          </Text>
          <Text
            style={{
              fontSize: 10.5,
              color: colors.textFaint,
              marginLeft: "auto",
            }}
          >
            {timeAgo(item.createdAt)}
          </Text>
        </View>

        {item.isSpoiler ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              backgroundColor: colors.warnSoft,
              borderRadius: 8,
              paddingVertical: 7,
              paddingHorizontal: 10,
              marginTop: 2,
            }}
          >
            <AlertTriangle size={12} color={colors.warn} />
            <Text
              style={{ fontSize: 11.5, color: colors.warn, fontWeight: "600" }}
            >
              Bu aktivite senin için spoiler içerebilir
            </Text>
          </View>
        ) : (
          <Text
            style={{ fontSize: 12.5, color: colors.textDim, lineHeight: 18 }}
          >
            <Text style={{ fontWeight: "700", color: colors.text }}>
              {item.content.titleTr}
            </Text>{" "}
            {item.groupCount && item.groupCount > 1
              ? `· ${item.groupCount} aktivite`
              : item.text}
          </Text>
        )}
      </View>

      {/* Poster */}
      <View
        style={{
          width: 42,
          height: 62,
          borderRadius: 7,
          backgroundColor: colors.surface,
          overflow: "hidden",
        }}
      >
        {item.content.poster && (
          <Image
            source={{ uri: item.content.poster }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
          />
        )}
      </View>
    </Pressable>
  );
}