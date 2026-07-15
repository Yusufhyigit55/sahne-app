import { View, Text, ScrollView } from "react-native";
import { Image } from "expo-image";
import { useTheme } from "@/lib/store/theme";

type Provider = {
  id: number;
  name: string;
  logo: string;
};

export function ProviderRow({ providers }: { providers: Provider[] }) {
  const { colors } = useTheme();

  // Platform bilgisi yoksa bölümü hiç gösterme
  if (!providers?.length) return null;

  return (
    <View style={{ gap: 10 }}>
      <Text style={{ fontSize: 14, fontWeight: "700", color: colors.text }}>
        Nereden İzlenir
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {providers.map((p) => (
          <View
            key={p.id}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 10,
              paddingVertical: 8,
              paddingHorizontal: 12,
            }}
          >
            <Image
              source={{ uri: p.logo }}
              style={{ width: 22, height: 22, borderRadius: 5 }}
              contentFit="cover"
            />
            <Text
              style={{ fontSize: 12, fontWeight: "700", color: colors.text }}
            >
              {p.name}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}