import { View, Text, ScrollView, Pressable } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useTheme } from "@/lib/store/theme";

type Cast = {
  id: number;
  name: string;
  character: string;
  photo: string | null;
};

export function CastStrip({ cast }: { cast: Cast[] }) {
  const { colors } = useTheme();

  if (!cast?.length) return null;

  return (
    <View style={{ gap: 10 }}>
      <Text style={{ fontSize: 14, fontWeight: "700", color: colors.text }}>
        Oyuncu Kadrosu
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 14 }}
      >
        {cast.map((c) => (
          <Pressable
            key={c.id}
            onPress={() => router.push(`/person/${c.id}`)}
            style={{ width: 78, alignItems: "center" }}
          >
            <View
              style={{
                width: 66,
                height: 66,
                borderRadius: 100,
                backgroundColor: colors.surface,
                overflow: "hidden",
              }}
            >
              {c.photo && (
                <Image
                  source={{ uri: c.photo }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                />
              )}
            </View>

            <Text
              style={{
                fontSize: 12,
                fontWeight: "700",
                color: colors.text,
                marginTop: 7,
                textAlign: "center",
              }}
              numberOfLines={1}
            >
              {c.character || c.name}
            </Text>

            <Text
              style={{
                fontSize: 10.5,
                color: colors.textDim,
                marginTop: 1,
                textAlign: "center",
              }}
              numberOfLines={1}
            >
              {c.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}