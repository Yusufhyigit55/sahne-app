import { useState } from "react";
import { View, Text, Pressable, Animated } from "react-native";
import { Image } from "expo-image";
import { Check, Star, Bookmark } from "lucide-react-native";
import { useTheme } from "@/lib/store/theme";
import { radius, shadow, fontSize, fontWeight } from "@/theme";
import type { LibraryItem } from "@/lib/queries/library";

const STATUS_COLOR: Record<string, "accent" | "warn" | "dim"> = {
  completed: "accent",
  up_to_date: "accent",
  watching: "warn",
  reading: "warn",
  paused: "dim",
  dropped: "dim",
  watchlist: "dim",
};

export function LibraryCard({
  item,
  onPress,
  width = 112,
}: {
  item: LibraryItem;
  onPress: () => void;
  width?: number;
}) {
  const { colors } = useTheme();
  const height = Math.round(width * 1.46);

  const [scale] = useState(new Animated.Value(1));

  const pressIn = () =>
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 50,
    }).start();

  const pressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
    }).start();

  const showProgress =
    item.progress > 0 && item.progress < 100 && item.type !== "movie";

  return (
    <Pressable
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      style={{ width }}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <View
          style={{
            width,
            height,
            borderRadius: radius.lg,
            backgroundColor: colors.surface,
            ...shadow.lg,
            shadowColor: colors.shadowColor,
          }}
        >
          <View
            style={{
              width: "100%",
              height: "100%",
              borderRadius: radius.lg,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: colors.borderLight,
              justifyContent: "flex-end",
            }}
          >
            {item.poster ? (
              <Image
                source={{ uri: item.poster }}
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                }}
                contentFit="cover"
                transition={220}
              />
            ) : (
              <View
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 10,
                  backgroundColor: colors.surfaceAlt,
                }}
              >
                <Text
                  style={{
                    fontSize: fontSize.xs,
                    color: colors.textFaint,
                    textAlign: "center",
                  }}
                  numberOfLines={3}
                >
                  {item.titleTr}
                </Text>
              </View>
            )}

            {/* Sağ üst rozetler */}
            <View
              style={{
                position: "absolute",
                top: 7,
                right: 7,
                flexDirection: "row",
                gap: 4,
              }}
            >
              {item.isFavorite && (
                <View
                  style={{
                    width: 23,
                    height: 23,
                    borderRadius: radius.pill,
                    backgroundColor: "rgba(0,0,0,0.7)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Star size={11} color={colors.accent} />
                </View>
              )}

              {item.status === "watchlist" && (
                <View
                  style={{
                    width: 23,
                    height: 23,
                    borderRadius: radius.pill,
                    backgroundColor: "rgba(0,0,0,0.7)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Bookmark size={11} color="#fff" />
                </View>
              )}

              {(item.status === "completed" ||
                item.status === "up_to_date") && (
                <View
                  style={{
                    width: 23,
                    height: 23,
                    borderRadius: radius.pill,
                    backgroundColor: colors.accent,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Check size={12} color={colors.accentText} strokeWidth={3} />
                </View>
              )}
            </View>

            {/* Puan */}
            {item.rating && (
              <View
                style={{
                  position: "absolute",
                  top: 7,
                  left: 7,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 2,
                  backgroundColor: "rgba(0,0,0,0.75)",
                  borderRadius: radius.sm,
                  paddingHorizontal: 6,
                  paddingVertical: 3,
                }}
              >
                <Text style={{ fontSize: 9, color: colors.accent }}>★</Text>
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: fontWeight.heavy,
                    color: "#fff",
                  }}
                >
                  {item.rating}
                </Text>
              </View>
            )}

            {/* İlerleme çubuğu */}
            {showProgress && (
              <View
                style={{
                  height: 3,
                  backgroundColor: "rgba(255,255,255,0.25)",
                }}
              >
                <View
                  style={{
                    height: "100%",
                    width: `${item.progress}%`,
                    backgroundColor: colors.accent,
                  }}
                />
              </View>
            )}
          </View>
        </View>
      </Animated.View>

      <Text
        style={{
          fontSize: fontSize.sm,
          fontWeight: fontWeight.bold,
          color: colors.text,
          marginTop: 9,
        }}
        numberOfLines={1}
      >
        {item.titleTr}
      </Text>

      {item.type === "series" && item.totalEpisodes > 0 && (
        <Text
          style={{
            fontSize: fontSize.xs,
            color: colors.textFaint,
            marginTop: 2,
          }}
        >
          {item.watchedEpisodes}/{item.totalEpisodes} bölüm
        </Text>
      )}

      {item.type === "book" && item.progress > 0 && (
        <Text
          style={{
            fontSize: fontSize.xs,
            color: colors.textFaint,
            marginTop: 2,
          }}
        >
          %{item.progress} okundu
        </Text>
      )}
    </Pressable>
  );
}