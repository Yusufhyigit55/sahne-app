// app/stats.tsx : TV Time tarzı detaylı istatistikler ekranı (Diziler/Filmler sekmeli).
import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useTheme } from "@/lib/store/theme";
import { useAuth } from "@/lib/store/auth";
import {
  useStats,
  formatDuration,
  type MediaStats,
} from "@/lib/queries/stats";
import { BarChart } from "@/components/stats/BarChart";
import { BadgeGrid } from "@/components/stats/BadgeGrid";
import { SCREEN_PADDING, spacing, fontSize, fontWeight, radius } from "@/theme";

type Tab = "series" | "movies";

export default function StatsScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ username?: string }>();

  const username = params.username ?? user?.username ?? "";
  const [tab, setTab] = useState<Tab>("series");

  const statsQ = useStats(username);
  const stats = statsQ.data?.stats;
  const isPrivate = statsQ.data?.isPrivate;

  const media: MediaStats | null = stats
    ? tab === "series"
      ? stats.series
      : stats.movies
    : null;

  const isSeries = tab === "series";

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.bg }}
      edges={["top"]}
    >
      {/* Üst bar */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.md,
          paddingHorizontal: SCREEN_PADDING,
          paddingBottom: spacing.sm,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{
            width: 36,
            height: 36,
            borderRadius: radius.pill,
            backgroundColor: colors.surface,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ChevronLeft size={19} color={colors.text} />
        </Pressable>
        <Text
          style={{
            fontSize: 18,
            fontWeight: fontWeight.heavy,
            color: colors.text,
          }}
        >
          İstatistikler
        </Text>
      </View>

      {/* Sekmeler */}
      <View
        style={{
          flexDirection: "row",
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        {(["series", "movies"] as Tab[]).map((t) => {
          const active = tab === t;
          return (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              style={{
                flex: 1,
                alignItems: "center",
                paddingVertical: 12,
                borderBottomWidth: 2,
                borderBottomColor: active ? colors.text : "transparent",
              }}
            >
              <Text
                style={{
                  fontSize: fontSize.md,
                  fontWeight: fontWeight.heavy,
                  color: active ? colors.text : colors.textDim,
                  letterSpacing: 0.5,
                }}
              >
                {t === "series" ? "DİZİLER" : "FİLMLER"}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {statsQ.isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : isPrivate ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: SCREEN_PADDING,
          }}
        >
          <Text style={{ color: colors.textDim, fontSize: fontSize.md }}>
            Bu istatistikler gizli.
          </Text>
        </View>
      ) : !media || !stats ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Text style={{ color: colors.textDim }}>Veri yok</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{
            padding: SCREEN_PADDING,
            gap: spacing.md,
            paddingBottom: 40,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* İzleme süresi */}
          <DurationCard minutes={media.totalMinutes} colors={colors} />

          {/* Haftalık izlenen */}
          <Card colors={colors}>
            <CardTitle colors={colors}>
              {isSeries ? "İzlenen bölümler" : "İzlenen filmler"}
            </CardTitle>
            <BarChart
              data={media.weeklyWatched}
              unit={isSeries ? "BÖLÜM" : "FİLM"}
            />
            <CardHint colors={colors}>Haftalık</CardHint>
          </Card>

          {/* Haftalık saat */}
          <Card colors={colors}>
            <CardTitle colors={colors}>
              {isSeries ? "Bölüm izleme süresi" : "Film izleme süresi"}
            </CardTitle>
            <BarChart data={media.weeklyHours} unit="SAAT" />
            <CardHint colors={colors}>Haftalık</CardHint>
          </Card>

          {/* Sayı kartları */}
          <View style={{ flexDirection: "row", gap: spacing.md }}>
            <MiniStat
              colors={colors}
              value={String(media.totalWatched)}
              label={isSeries ? "Toplam Bölüm" : "Toplam Film"}
            />
            <MiniStat
              colors={colors}
              value={String(media.totalAdded)}
              label={isSeries ? "Eklenen Dizi" : "Eklenen Film"}
              sub={
                isSeries && media.stillAiring > 0
                  ? `${media.stillAiring} yapımda`
                  : undefined
              }
            />
          </View>

          {/* Kalan bölümler (sadece dizi) */}
          {isSeries && media.remainingFromCount > 0 && (
            <Card colors={colors}>
              <CardTitle colors={colors}>Kalan bölümler</CardTitle>
              <Text
                style={{
                  fontSize: 34,
                  fontWeight: fontWeight.heavy,
                  color: colors.text,
                }}
              >
                {media.remaining}
              </Text>
              <CardHint colors={colors}>
                Başladığın {media.remainingFromCount} dizide
              </CardHint>
            </Card>
          )}

          {/* En iyi türler */}
          {media.topGenres.length > 0 && (
            <Card colors={colors}>
              <CardTitle colors={colors}>
                {isSeries
                  ? "En çok izlediğin dizi türleri"
                  : "En çok izlediğin film türleri"}
              </CardTitle>
              <View style={{ gap: 2 }}>
                {media.topGenres.map((g, i) => (
                  <Row
                    key={i}
                    colors={colors}
                    left={g.name}
                    right={String(g.count)}
                    last={i === media.topGenres.length - 1}
                  />
                ))}
              </View>
            </Card>
          )}

          {/* En çok verdiğin puan */}
          {media.topRated.length > 0 && (
            <Card colors={colors}>
              <CardTitle colors={colors}>En Beğendiklerin</CardTitle>
              <View style={{ gap: 2 }}>
                {media.topRated.map((r, i) => (
                  <Row
                    key={i}
                    colors={colors}
                    left={r.title}
                    right={`${r.rating}/10`}
                    last={i === media.topRated.length - 1}
                  />
                ))}
              </View>
            </Card>
          )}

          {/* Yorum + beğeni */}
          <View style={{ flexDirection: "row", gap: spacing.md }}>
            <MiniStat
              colors={colors}
              value={String(media.commentCount)}
              label="Yorum"
            />
            <MiniStat
              colors={colors}
              value={String(media.likesReceived)}
              label="Kazanılan Beğeni"
            />
          </View>

          {/* Karakter oyları */}
          {media.characterVotes > 0 && (
            <Card colors={colors}>
              <CardTitle colors={colors}>Karakter oyları</CardTitle>
              <Text
                style={{
                  fontSize: 34,
                  fontWeight: fontWeight.heavy,
                  color: colors.text,
                }}
              >
                {media.characterVotes}
              </Text>
              <CardHint colors={colors}>
                {media.characterVotedContent}{" "}
                {isSeries ? "dizide" : "filmde"}
              </CardHint>
            </Card>
          )}

          {/* Rozetler (her iki sekmede aynı — genel) */}
          <Card colors={colors}>
            <CardTitle colors={colors}>
              Uygulama rozetleri · {stats.earnedBadgeCount}
            </CardTitle>
            <View style={{ marginTop: 8 }}>
              <BadgeGrid badges={stats.badges} />
            </View>
          </Card>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

/* ── Yardımcı bileşenler ── */

function Card({ children, colors }: any) {
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: radius.xl,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.lg,
        gap: 6,
      }}
    >
      {children}
    </View>
  );
}

function CardTitle({ children, colors }: any) {
  return (
    <Text
      style={{
        fontSize: fontSize.lg,
        fontWeight: fontWeight.heavy,
        color: colors.text,
      }}
    >
      {children}
    </Text>
  );
}

function CardHint({ children, colors }: any) {
  return (
    <Text
      style={{
        fontSize: 11,
        color: colors.textDim,
        letterSpacing: 0.5,
        textTransform: "uppercase",
      }}
    >
      {children}
    </Text>
  );
}

function DurationCard({ minutes, colors }: { minutes: number; colors: any }) {
  const { months, days, hours } = formatDuration(minutes);
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: radius.xl,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.lg,
        gap: 6,
      }}
    >
      <CardTitle colors={colors}>İzlemek için harcanan vakit</CardTitle>
      <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 4 }}>
        <BigUnit n={months} u="ay" colors={colors} />
        <BigUnit n={days} u="gün" colors={colors} />
        <BigUnit n={hours} u="saat" colors={colors} />
      </View>
    </View>
  );
}

function BigUnit({ n, u, colors }: { n: number; u: string; colors: any }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 2 }}>
      <Text
        style={{
          fontSize: 30,
          fontWeight: fontWeight.heavy,
          color: colors.text,
        }}
      >
        {n}
      </Text>
      <Text
        style={{
          fontSize: fontSize.sm,
          color: colors.textDim,
          marginBottom: 5,
          marginRight: 6,
        }}
      >
        {u}
      </Text>
    </View>
  );
}

function MiniStat({
  colors,
  value,
  label,
  sub,
}: {
  colors: any;
  value: string;
  label: string;
  sub?: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: radius.xl,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.lg,
        gap: 2,
      }}
    >
      <Text
        style={{
          fontSize: 28,
          fontWeight: fontWeight.heavy,
          color: colors.text,
        }}
      >
        {value}
      </Text>
      <Text style={{ fontSize: 12, color: colors.textDim }}>{label}</Text>
      {sub ? (
        <Text style={{ fontSize: 10, color: colors.textDim }}>{sub}</Text>
      ) : null}
    </View>
  );
}

function Row({
  colors,
  left,
  right,
  last,
}: {
  colors: any;
  left: string;
  right: string;
  last?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 10,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: colors.border,
      }}
    >
      <Text
        style={{ fontSize: fontSize.md, color: colors.text, flex: 1 }}
        numberOfLines={1}
      >
        {left}
      </Text>
      <Text
        style={{
          fontSize: fontSize.md,
          fontWeight: fontWeight.bold,
          color: colors.textDim,
          marginLeft: 12,
        }}
      >
        {right}
      </Text>
    </View>
  );
}
