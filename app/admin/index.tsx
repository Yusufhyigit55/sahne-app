// app/admin/index.tsx : Moderatör paneli — bekleyen şikayetler ve aktif ban'lar; iki sekme, moderasyon kararları.
import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useTheme } from "@/lib/store/theme";
import { useAuth } from "@/lib/store/auth";
import {
  useReports,
  useBans,
  useModerate,
  useLiftBan,
  REASON_LABELS,
  BAN_REASONS,
  ReportItem,
  BanItem,
} from "@/lib/queries/admin";

type Tab = "reports" | "bans";

export default function AdminScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("reports");

  const isMod =
    user?.role === "moderator" || user?.role === "admin";

  if (!isMod) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bg,
          alignItems: "center",
          justifyContent: "center",
          padding: 22,
        }}
      >
        <Text style={{ color: colors.textDim, fontSize: 14 }}>
          Bu sayfaya erişim yetkin yok.
        </Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 12 }}>
          <Text style={{ color: colors.accent, fontWeight: "700" }}>Geri</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Başlık */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          paddingHorizontal: 18,
          paddingTop: 56,
          paddingBottom: 12,
        }}
      >
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ChevronLeft size={24} color={colors.text} />
        </Pressable>
        <Text style={{ fontSize: 19, fontWeight: "800", color: colors.text }}>
          Moderasyon
        </Text>
      </View>

      {/* Sekmeler */}
      <View
        style={{
          flexDirection: "row",
          gap: 8,
          paddingHorizontal: 18,
          marginBottom: 12,
        }}
      >
        {(["reports", "bans"] as Tab[]).map((t) => {
          const active = tab === t;
          return (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              style={{
                paddingVertical: 9,
                paddingHorizontal: 16,
                borderRadius: 100,
                backgroundColor: active ? colors.accent : colors.surface,
                borderWidth: 1,
                borderColor: active ? colors.accent : colors.border,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  color: active ? colors.accentText : colors.textDim,
                }}
              >
                {t === "reports" ? "Şikayetler" : "Ban'lar"}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {tab === "reports" ? <ReportsTab /> : <BansTab />}
    </View>
  );
}

// ─────────────────────────────────────────
// ŞİKAYETLER SEKMESİ
// ─────────────────────────────────────────
function ReportsTab() {
  const { colors } = useTheme();
  const { data, isLoading } = useReports("pending");
  const moderate = useModerate();

  const decide = (
    report: ReportItem,
    action: "mark_spoiler" | "delete" | "dismiss"
  ) => {
    if (!report.comment) return;

    if (action === "dismiss") {
      moderate.mutate({ commentId: report.comment.id, action });
      return;
    }

    // Ceza uygulansın mı diye sor
    Alert.alert(
      action === "delete" ? "Yorumu sil" : "Spoiler işaretle",
      "Kullanıcıya ceza (kademeli ban) uygulansın mı?",
      [
        {
          text: "Cezasız",
          onPress: () =>
            moderate.mutate({
              commentId: report.comment!.id,
              action,
              reason: report.reason,
              applyPenalty: false,
            }),
        },
        {
          text: "Ceza uygula",
          style: "destructive",
          onPress: () =>
            moderate.mutate({
              commentId: report.comment!.id,
              action,
              reason: report.reason,
              applyPenalty: true,
            }),
        },
        { text: "Vazgeç", style: "cancel" },
      ]
    );
  };

  if (isLoading) {
    return <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />;
  }

  if (!data || data.length === 0) {
    return (
      <Text
        style={{
          color: colors.textFaint,
          textAlign: "center",
          marginTop: 40,
          fontSize: 14,
        }}
      >
        Bekleyen şikayet yok.
      </Text>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 18, paddingTop: 0, gap: 12 }}>
      {data.map((r) => (
        <View
          key={r.id}
          style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 14,
          }}
        >
          {/* Sebep + tarih */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 100,
                backgroundColor: colors.warnSoft,
              }}
            >
              <Text
                style={{ fontSize: 11, fontWeight: "700", color: colors.warn }}
              >
                {REASON_LABELS[r.reason] ?? r.reason}
              </Text>
            </View>
            <Text style={{ fontSize: 11, color: colors.textFaint }}>
              @{r.reporter.username} bildirdi
            </Text>
          </View>

          {/* Yorum içeriği */}
          {r.comment ? (
            <>
              <Text
                style={{
                  fontSize: 14,
                  color: colors.text,
                  lineHeight: 20,
                  marginBottom: 8,
                }}
              >
                {r.comment.body}
              </Text>

              <Text
                style={{
                  fontSize: 12,
                  color: colors.textDim,
                  marginBottom: 12,
                }}
              >
                @{r.comment.author.username}
                {r.comment.author.previousBans > 0
                  ? ` · ${r.comment.author.previousBans} önceki ceza`
                  : " · ilk şikayet"}
                {r.comment.isSpoiler ? " · zaten spoiler" : ""}
              </Text>

              {/* Kararlar */}
              <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                <ActionBtn
                  label="Spoiler işaretle"
                  color={colors.warn}
                  onPress={() => decide(r, "mark_spoiler")}
                  disabled={moderate.isPending}
                />
                <ActionBtn
                  label="Sil"
                  color={colors.danger}
                  onPress={() => decide(r, "delete")}
                  disabled={moderate.isPending}
                />
                <ActionBtn
                  label="Reddet"
                  color={colors.textDim}
                  onPress={() => decide(r, "dismiss")}
                  disabled={moderate.isPending}
                />
              </View>
            </>
          ) : (
            <Text style={{ fontSize: 13, color: colors.textFaint }}>
              Yorum silinmiş.
            </Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

// ─────────────────────────────────────────
// BAN'LAR SEKMESİ
// ─────────────────────────────────────────
function BansTab() {
  const { colors } = useTheme();
  const { data, isLoading } = useBans();
  const lift = useLiftBan();

  const confirmLift = (ban: BanItem) => {
    Alert.alert(
      "Ban'ı kaldır",
      `@${ban.user.username} kullanıcısının yorum yazma hakkı geri verilecek.`,
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Kaldır",
          onPress: () => lift.mutate(ban.id),
        },
      ]
    );
  };

  if (isLoading) {
    return <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />;
  }

  if (!data || data.length === 0) {
    return (
      <Text
        style={{
          color: colors.textFaint,
          textAlign: "center",
          marginTop: 40,
          fontSize: 14,
        }}
      >
        Aktif ban yok.
      </Text>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 18, paddingTop: 0, gap: 12 }}>
      {data.map((b) => (
        <View
          key={b.id}
          style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 14,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{ fontSize: 14, fontWeight: "700", color: colors.text }}
              >
                {b.user.displayName}
              </Text>
              <Text style={{ fontSize: 12, color: colors.textDim, marginTop: 2 }}>
                @{b.user.username}
              </Text>
            </View>

            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 100,
                backgroundColor: colors.dangerSoft,
              }}
            >
              <Text
                style={{ fontSize: 11, fontWeight: "700", color: colors.danger }}
              >
                {b.durationDays ? `${b.durationDays} gün` : "Kalıcı"}
              </Text>
            </View>
          </View>

          <Text style={{ fontSize: 12, color: colors.textDim, marginTop: 10 }}>
            {REASON_LABELS[b.reason] ?? b.reason} · {b.banCount}. ceza ·{" "}
            {b.moderator} tarafından
          </Text>

          {b.expiresAt && (
            <Text style={{ fontSize: 11, color: colors.textFaint, marginTop: 2 }}>
              Bitiş: {new Date(b.expiresAt).toLocaleDateString("tr-TR")}
              {b.isExpired ? " (süresi doldu)" : ""}
            </Text>
          )}

          <Pressable
            onPress={() => confirmLift(b)}
            disabled={lift.isPending}
            style={{
              marginTop: 12,
              paddingVertical: 9,
              borderRadius: 10,
              alignItems: "center",
              backgroundColor: colors.surfaceAlt,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text
              style={{ fontSize: 13, fontWeight: "700", color: colors.accent }}
            >
              Ban'ı Kaldır
            </Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}

// ─────────────────────────────────────────
// Yardımcı: karar butonu
// ─────────────────────────────────────────
function ActionBtn({
  label,
  color,
  onPress,
  disabled,
}: {
  label: string;
  color: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 10,
        backgroundColor: colors.surfaceAlt,
        borderWidth: 1,
        borderColor: color,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <Text style={{ fontSize: 12.5, fontWeight: "700", color }}>{label}</Text>
    </Pressable>
  );
}