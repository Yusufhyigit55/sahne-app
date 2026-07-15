import { useState } from "react";
import { View, Text, Pressable, Animated } from "react-native";
import { Image } from "expo-image";
import { useTheme } from "@/lib/store/theme";
import { radius, shadow, fontSize, fontWeight } from "@/theme";

export function PosterCard({
  title,
  poster,
  year,
  width = 112,
  onPress,
  subtitle,
}: {
  title: string;
  poster: string | null;
  year?: string | number | null;
  width?: number;
  onPress: () => void;
  subtitle?: string;
}) {
  const { colors } = useTheme();
  const height = Math.round(width * 1.46);

  const [scale] = useState(new Animated.Value(1));

  const pressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      style={{ width }}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        {/* 3D gölge katmanı */}
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
          {/* İç kart — üstte ışık, altta gölge */}
          <View
            style={{
              width: "100%",
              height: "100%",
              borderRadius: radius.lg,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: colors.borderLight,
            }}
          >
            {poster ? (
              <Image
                source={{ uri: poster }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
                transition={220}
              />
            ) : (
              <View
                style={{
                  flex: 1,
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
                  {title}
                </Text>
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
        {title}
      </Text>

      {(year || subtitle) && (
        <Text
          style={{
            fontSize: fontSize.xs,
            color: colors.textFaint,
            marginTop: 2,
          }}
          numberOfLines={1}
        >
          {subtitle ?? year}
        </Text>
      )}
    </Pressable>
  );
}