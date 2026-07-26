// app/setup.tsx : Yeni kullanıcı için 3 adımlı kurulum — profil (username + ad), tema, içerik seçimi.
import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Check } from "lucide-react-native";
import { useTheme } from "@/lib/store/theme";
import { useAuth } from "@/lib/store/auth";
import { api, apiError } from "@/lib/api";
import { useTrending } from "@/lib/queries/content";
import { useUpdateSettings } from "@/lib/queries/settings";
import { useCompleteOnboarding } from "@/lib/queries/onboarding";

type Selectable = {
  type: "series" | "movie";
  tmdbId: number;
  titleTr: string;
  poster: string | null;
};

type Step = "profile" | "theme" | "content";

export default function SetupScreen() {
  const { colors, name: themeName, setTheme } = useTheme();
  const { user, setUser } = useAuth();

  const update = useUpdateSettings();
  const complete = useCompleteOnboarding();

  const seriesQ = useTrending("series");
  const moviesQ = useTrending("movie");

  const [step, setStep] = useState<Step>("profile");

  // --- Profil adımı state ---
  const [username, setUsername] = useState(user?.username ?? "");
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [profileError, setProfileError] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // --- İçerik adımı state ---
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setDisplayName(user.displayName);
    }
  }, [user]);

  const series: Selectable[] = (seriesQ.data ?? []).map((s: any) => ({
    type: "series",
    tmdbId: s.tmdbId,
    titleTr: s.titleTr,
    poster: s.poster,
  }));

  const movies: Selectable[] = (moviesQ.data ?? []).map((m: any) => ({
    type: "movie",
    tmdbId: m.tmdbId,
    titleTr: m.titleTr,
    poster: m.poster,
  }));

  // ---- PROFİL ADIMI ----
  const saveProfileAndNext = async () => {
    setProfileError("");

    const uname = username.toLowerCase().trim();

    if (!/^[a-z0-9._]{3,20}$/.test(uname)) {
      setProfileError(
        "Kullanıcı adı 3-20 karakter; küçük harf, rakam, nokta ve alt çizgi olabilir"
      );
      return;
    }
    if (!displayName.trim()) {
      setProfileError("Görünen isim boş olamaz");
      return;
    }

    setSavingProfile(true);
    try {
      // Sadece değişen alanları gönder (gereksiz username 30-gün tetiklemesin)
      const patch: Record<string, any> = {};
      if (uname !== user?.username) patch.username = uname;
      if (displayName.trim() !== user?.displayName)
        patch.displayName = displayName.trim();

      if (Object.keys(patch).length > 0) {
        await update.mutateAsync(patch);
        if (user) {
          setUser({
            ...user,
            username: patch.username ?? user.username,
            displayName: patch.displayName ?? user.displayName,
          });
        }
      }
      setStep("theme");
    } catch (err) {
      setProfileError(apiError(err));
    } finally {
      setSavingProfile(false);
    }
  };

  // ---- TEMA ADIMI ----
  const chooseTheme = (next: "dark" | "beige") => {
    setTheme(next);
    update.mutate({ theme: next });
  };

  // ---- İÇERİK ADIMI ----
  const toggle = (item: Selectable) => {
    const key = `${item.type}:${item.tmdbId}`;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const finish = async (withSelections: boolean) => {
    setSaving(true);
    try {
      if (withSelections && selected.size > 0) {
        await Promise.all(
          [...selected].map((key) => {
            const [type, tmdbId] = key.split(":");
            return api
              .post("/api/watch/like", {
                type,
                id: Number(tmdbId),
                action: "like",
              })
              .catch(() => null);
          })
        );
      }
      await complete.mutateAsync();
      router.replace("/(tabs)");
    } catch {
      Alert.alert("Hata", "Bir şeyler ters gitti, tekrar dene.");
      setSaving(false);
    }
  };

  // ---- Adım göstergesi (üstte 3 nokta) ----
  const StepDots = () => {
    const steps: Step[] = ["profile", "theme", "content"];
    const idx = steps.indexOf(step);
    return (
      <View
        style={{
          flexDirection: "row",
          gap: 6,
          justifyContent: "center",
          paddingTop: 8,
        }}
      >
        {steps.map((_, i) => (
          <View
            key={i}
            style={{
              width: i === idx ? 22 : 7,
              height: 7,
              borderRadius: 4,
              backgroundColor: i <= idx ? colors.accent : colors.border,
            }}
          />
        ))}
      </View>
    );
  };

  // ============ PROFİL ADIMI ============
  if (step === "profile") {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <StepDots />
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              padding: 24,
              gap: 24,
            }}
            keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          >
            <View style={{ gap: 6 }}>
              <Text
                style={{ fontSize: 26, fontWeight: "800", color: colors.text }}
              >
                Profilini oluştur
              </Text>
              <Text style={{ fontSize: 14, color: colors.textDim, lineHeight: 20 }}>
                Kullanıcı adını ve görünen ismini belirle. Sonra istediğin zaman
                değiştirebilirsin.
              </Text>
            </View>

            <View style={{ gap: 14 }}>
              <View style={{ gap: 6 }}>
                <Text
                  style={{ fontSize: 13, fontWeight: "700", color: colors.text }}
                >
                  Kullanıcı adı
                </Text>
                <TextInput
                  value={username}
                  onChangeText={(t) => setUsername(t.toLowerCase())}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="kullanici_adi"
                  placeholderTextColor={colors.textFaint}
                  style={{
                    backgroundColor: colors.surfaceAlt,
                    borderWidth: 1.5,
                    borderColor: colors.border,
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 14,
                    fontSize: 15,
                    color: colors.text,
                  }}
                />
              </View>

              <View style={{ gap: 6 }}>
                <Text
                  style={{ fontSize: 13, fontWeight: "700", color: colors.text }}
                >
                  Görünen isim
                </Text>
                <TextInput
                  value={displayName}
                  onChangeText={(t) => {
                    const onlyLetters = t.replace(
                      /[^a-zA-ZçğıöşüÇĞİÖŞÜ\s]/g,
                      ""
                    );
                    const titleCased = onlyLetters
                      .split(" ")
                      .map((w) =>
                        w.length > 0
                          ? w[0].toLocaleUpperCase("tr-TR") +
                            w.slice(1).toLocaleLowerCase("tr-TR")
                          : w
                      )
                      .join(" ");
                    setDisplayName(titleCased);
                  }}
                  placeholder="Adın Soyadın"
                  placeholderTextColor={colors.textFaint}
                  maxLength={50}
                  style={{
                    backgroundColor: colors.surfaceAlt,
                    borderWidth: 1.5,
                    borderColor: colors.border,
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 14,
                    fontSize: 15,
                    color: colors.text,
                  }}
                />
              </View>

              {profileError ? (
                <View
                  style={{
                    backgroundColor: colors.warnSoft,
                    borderRadius: 10,
                    padding: 12,
                  }}
                >
                  <Text style={{ fontSize: 12.5, color: colors.danger }}>
                    {profileError}
                  </Text>
                </View>
              ) : null}
            </View>

            <Pressable
              onPress={saveProfileAndNext}
              disabled={savingProfile}
              style={{
                backgroundColor: colors.accent,
                borderRadius: 12,
                paddingVertical: 15,
                alignItems: "center",
                opacity: savingProfile ? 0.6 : 1,
              }}
            >
              {savingProfile ? (
                <ActivityIndicator color={colors.accentText} />
              ) : (
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "800",
                    color: colors.accentText,
                  }}
                >
                  Devam
                </Text>
              )}
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ============ TEMA ADIMI ============
  if (step === "theme") {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <StepDots />
        <View style={{ flex: 1, padding: 24, gap: 24, justifyContent: "center" }}>
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 26, fontWeight: "800", color: colors.text }}>
              Görünümü seç
            </Text>
            <Text style={{ fontSize: 14, color: colors.textDim, lineHeight: 20 }}>
              Sana en rahat geleni seç. Sonra ayarlardan değiştirebilirsin.
            </Text>
          </View>

          <View style={{ flexDirection: "row", gap: 14 }}>
            {[
              { key: "dark" as const, label: "Koyu", swatch: "#0F1116" },
              { key: "beige" as const, label: "Bej", swatch: "#F5EFE6" },
            ].map((t) => {
              const active = themeName === t.key;
              return (
                <Pressable
                  key={t.key}
                  onPress={() => chooseTheme(t.key)}
                  style={{
                    flex: 1,
                    borderWidth: 2,
                    borderColor: active ? colors.accent : colors.border,
                    borderRadius: 16,
                    padding: 16,
                    gap: 12,
                    alignItems: "center",
                    backgroundColor: colors.surface,
                  }}
                >
                  <View
                    style={{
                      width: "100%",
                      height: 90,
                      borderRadius: 10,
                      backgroundColor: t.swatch,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  />
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {active && <Check size={16} color={colors.accent} />}
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "700",
                        color: active ? colors.accent : colors.textDim,
                      }}
                    >
                      {t.label}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            onPress={() => setStep("content")}
            style={{
              backgroundColor: colors.accent,
              borderRadius: 12,
              paddingVertical: 15,
              alignItems: "center",
              marginTop: 8,
            }}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: "800",
                color: colors.accentText,
              }}
            >
              Devam
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ============ İÇERİK ADIMI ============
  const isLoading = seriesQ.isLoading || moviesQ.isLoading;

  const renderRow = (title: string, items: Selectable[]) => (
    <View style={{ gap: 12 }}>
      <Text
        style={{
          fontSize: 17,
          fontWeight: "800",
          color: colors.text,
          paddingHorizontal: 24,
        }}
      >
        {title}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
      >
        {items.map((item) => {
          const key = `${item.type}:${item.tmdbId}`;
          const isSel = selected.has(key);
          return (
            <Pressable key={key} onPress={() => toggle(item)} style={{ width: 108 }}>
              <View
                style={{
                  width: 108,
                  height: 160,
                  borderRadius: 12,
                  backgroundColor: colors.surface,
                  borderWidth: 2,
                  borderColor: isSel ? colors.accent : "transparent",
                  overflow: "hidden",
                }}
              >
                {item.poster && (
                  <Image
                    source={{ uri: item.poster }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                    transition={200}
                  />
                )}
                {isSel && (
                  <View
                    style={{
                      position: "absolute",
                      inset: 0,
                      backgroundColor: "rgba(0,0,0,0.35)",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <View
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 100,
                        backgroundColor: colors.accent,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Check size={20} color={colors.accentText} />
                    </View>
                  </View>
                )}
              </View>
              <Text
                style={{ fontSize: 11.5, color: colors.textDim, marginTop: 6 }}
                numberOfLines={1}
              >
                {item.titleTr}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <StepDots />
      <ScrollView contentContainerStyle={{ paddingBottom: 140, gap: 24, paddingTop: 8 }}>
        <View style={{ paddingHorizontal: 24, gap: 8 }}>
          <Text style={{ fontSize: 26, fontWeight: "800", color: colors.text }}>
            Neleri seviyorsun?
          </Text>
          <Text style={{ fontSize: 14, color: colors.textDim, lineHeight: 21 }}>
            İzlediğin veya beğendiğin birkaçını seç, sana daha iyi öneriler
            sunalım.
          </Text>
        </View>

        {isLoading ? (
          <View style={{ paddingVertical: 60, alignItems: "center" }}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : (
          <>
            {series.length > 0 && renderRow("Popüler Diziler", series)}
            {movies.length > 0 && renderRow("Popüler Filmler", movies)}
          </>
        )}
      </ScrollView>

      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          flexDirection: "row",
          gap: 12,
          paddingHorizontal: 24,
          paddingTop: 12,
          paddingBottom: 34,
          backgroundColor: colors.bg,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <Pressable
          onPress={() => finish(false)}
          disabled={saving}
          style={{ paddingVertical: 14, paddingHorizontal: 20 }}
        >
          <Text
            style={{ fontSize: 15, fontWeight: "700", color: colors.textDim }}
          >
            Atla
          </Text>
        </Pressable>

        <Pressable
          onPress={() => finish(true)}
          disabled={saving}
          style={{
            flex: 1,
            backgroundColor: colors.accent,
            borderRadius: 12,
            paddingVertical: 14,
            alignItems: "center",
            justifyContent: "center",
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? (
            <ActivityIndicator size="small" color={colors.accentText} />
          ) : (
            <Text
              style={{
                fontSize: 15,
                fontWeight: "800",
                color: colors.accentText,
              }}
            >
              {selected.size > 0 ? `Bitir (${selected.size})` : "Bitir"}
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
