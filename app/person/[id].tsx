import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useLocalSearchParams, router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useTheme } from "@/lib/store/theme";
import { usePerson } from "@/lib/queries/content";
import { Chip } from "@/components/ui/Chip";
import { PosterCard } from "@/components/content/PosterCard";

type Tab = "series" | "movies";

export default function PersonScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();

  const q = usePerson(Number(id));
  const [tab, setTab] = useState<Tab>("series");
  const [bioOpen, setBioOpen] = useState(false);

  if (q.isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (q.isError || !q.data) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Text style={{ fontSize: 13, color: colors.textDim }}>
            Oyuncu bulunamadı
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const p = q.data;
  const items = tab === "series" ? p.series : p.movies;

  const age = p.birthday
    ? Math.floor(
        (Date.now() - new Date(p.birthday).getTime()) /
          (1000 * 60 * 60 * 24 * 365.25)
      )
    : null;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.bg }}
      edges={["top"]}
    >
      <FlatList
        data={items}
        keyExtractor={(i: any, idx) => `${i.type}-${i.tmdbId}-${idx}`}
        numColumns={3}
        columnWrapperStyle={{ gap: 12, paddingHorizontal: 18 }}
        contentContainerStyle={{ paddingBottom: 40, gap: 16 }}
        ListHeaderComponent={
          <View style={{ gap: 18, paddingBottom: 4 }}>
            {/* Geri */}
            <View style={{ paddingHorizontal: 18, paddingTop: 6 }}>
              <Pressable
                onPress={() => router.back()}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 100,
                  backgroundColor: colors.surface,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ChevronLeft size={19} color={colors.text} />
              </Pressable>
            </View>

            {/* Profil */}
            <View style={{ alignItems: "center", gap: 10 }}>
              <View
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 100,
                  backgroundColor: colors.surface,
                  overflow: "hidden",
                }}
              >
                {p.photo && (
                  <Image
                    source={{ uri: p.photo }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                    transition={200}
                  />
                )}
              </View>

              <View style={{ alignItems: "center", gap: 3 }}>
                <Text
                  style={{
                    fontSize: 19,
                    fontWeight: "800",
                    color: colors.text,
                  }}
                >
                  {p.name}
                </Text>

                <Text
                  style={{
                    fontSize: 12,
                    color: colors.textDim,
                    textAlign: "center",
                  }}
                >
                  {[
                    p.knownFor === "Acting" ? "Oyuncu" : p.knownFor,
                    age ? `${age} yaşında` : null,
                    p.placeOfBirth,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </Text>
              </View>
            </View>

            {/* Biyografi */}
            {p.biography ? (
              <View style={{ paddingHorizontal: 18 }}>
                <Text
                  style={{
                    fontSize: 13,
                    lineHeight: 20,
                    color: colors.textDim,
                  }}
                  numberOfLines={bioOpen ? undefined : 4}
                >
                  {p.biography}
                </Text>

                {p.biography.length > 200 && (
                  <Pressable
                    onPress={() => setBioOpen(!bioOpen)}
                    style={{ marginTop: 6 }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "700",
                        color: colors.accent,
                      }}
                    >
                      {bioOpen ? "Daha az göster" : "Devamını oku"}
                    </Text>
                  </Pressable>
                )}
              </View>
            ) : null}

            {/* Sekmeler */}
            <View
              style={{
                flexDirection: "row",
                gap: 8,
                paddingHorizontal: 18,
              }}
            >
              <Chip
                label={`Diziler (${p.series.length})`}
                active={tab === "series"}
                onPress={() => setTab("series")}
                size="sm"
              />
              <Chip
                label={`Filmler (${p.movies.length})`}
                active={tab === "movies"}
                onPress={() => setTab("movies")}
                size="sm"
              />
            </View>
          </View>
        }
        renderItem={({ item }: { item: any }) => (
          <View style={{ width: 104 }}>
            <PosterCard
              title={item.titleTr}
              poster={item.poster}
              year={item.year}
              width={104}
              onPress={() =>
                router.push(`/content/${item.type}/${item.tmdbId}`)
              }
            />

            {/* Karakter adı */}
            {item.character ? (
              <Text
                style={{
                  fontSize: 10,
                  color: colors.textFaint,
                  marginTop: 2,
                }}
                numberOfLines={1}
              >
                {item.character}
              </Text>
            ) : null}
          </View>
        )}
        ListEmptyComponent={
          <View style={{ alignItems: "center", padding: 40 }}>
            <Text style={{ fontSize: 13, color: colors.textDim }}>
              {tab === "series" ? "Dizi bulunamadı" : "Film bulunamadı"}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}