import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { AppleSignInButton } from "@/components/ui/AppleSignInButton";
import { GoogleSignInButton } from "@/components/ui/GoogleSignInButton";
import { ChevronLeft, Check, Calendar } from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTheme } from "@/lib/store/theme";
import { useAuth } from "@/lib/store/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { apiError } from "@/lib/api";

type Gender = "male" | "female" | "unspecified";

const GENDER_OPTIONS: { key: Gender; label: string }[] = [
  { key: "male", label: "Erkek" },
  { key: "female", label: "Kadın" },
  { key: "unspecified", label: "Belirtmek istemiyorum" },
];

/** Date → "GG.AA.YYYY" gösterim */
function formatDate(d: Date): string {
  const gg = String(d.getDate()).padStart(2, "0");
  const aa = String(d.getMonth() + 1).padStart(2, "0");
  return `${gg}.${aa}.${d.getFullYear()}`;
}

export default function RegisterScreen() {
  const { colors } = useTheme();
  const { register, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [gender, setGender] = useState<Gender | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [error, setError] = useState("");

  // Varsayılan picker tarihi: 18 yıl önce
  const defaultDate = new Date();
  defaultDate.setFullYear(defaultDate.getFullYear() - 18);

  // Maksimum tarih: bugün (gelecek tarih seçilemez)
  const maxDate = new Date();

  const handleRegister = async () => {
    setError("");

    if (!email || !username || !displayName || !password) {
      setError("Tüm alanları doldurun");
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      setError("Geçerli bir e-posta girin (örn. ornek@mail.com)");
      return;
    }

    if (password.length < 8) {
      setError("Şifre en az 8 karakter olmalı");
      return;
    }

    if (!/^[a-z0-9._]+$/.test(username)) {
      setError(
        "Kullanıcı adı yalnızca küçük harf, rakam, nokta ve alt çizgi içerebilir"
      );
      return;
    }

    if (!birthDate) {
      setError("Doğum tarihini seç");
      return;
    }

    // 13 yaş kontrolü (istemci tarafı)
    const age =
      (Date.now() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    if (age < 13) {
      setError("Sahne'yi kullanmak için en az 13 yaşında olmalısın");
      return;
    }

    if (!acceptedTerms || !acceptedPrivacy) {
      setError("Devam etmek için koşulları ve gizlilik politikasını onayla");
      return;
    }

    try {
      const result = await register({
        email,
        username,
        displayName,
        password,
        birthDate: birthDate.toISOString(),
        gender: gender ?? undefined,
        acceptedTerms,
        acceptedPrivacy,
      });
      // E-posta doğrulama ekranına yönlendir
      router.push({
        pathname: "/(auth)/verify-email",
        params: { email: result.email },
      });
    } catch (err) {
      setError(apiError(err));
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Geri */}
        <Pressable
          onPress={() => router.back()}
          style={{
            width: 38,
            height: 38,
            borderRadius: 100,
            backgroundColor: colors.surface,
            alignItems: "center",
            justifyContent: "center",
            marginLeft: 18,
            marginTop: 8,
          }}
        >
          <ChevronLeft size={20} color={colors.text} />
        </Pressable>

        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            padding: 24,
            gap: 24,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ gap: 6 }}>
            <Text
              style={{ fontSize: 26, fontWeight: "800", color: colors.text }}
            >
              Hesap Oluştur
            </Text>
            <Text style={{ fontSize: 13, color: colors.textDim }}>
              Sahne'ye katıl, izlediklerini takip etmeye başla
            </Text>
          </View>

          <View style={{ gap: 14 }}>
            <Input
              label="E-posta"
              value={email}
              onChangeText={setEmail}
              placeholder="ornek@mail.com"
              keyboardType="email-address"
            />

            <Input
              label="Kullanıcı adı"
              value={username}
              onChangeText={(t) => setUsername(t.toLowerCase())}
              placeholder="kullanici_adi"
            />

            <Input
              label="Görünen isim"
              value={displayName}
              onChangeText={(t) => {
                // Rakam ve özel karakterleri engelle (sadece harf + boşluk)
                const onlyLetters = t.replace(
                  /[^a-zA-ZçğıöşüÇĞİÖŞÜ\s]/g,
                  ""
                );
                // Her kelimenin ilk harfini büyüt
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
              autoCapitalize="sentences"
            />

            <Input
              label="Şifre"
              value={password}
              onChangeText={setPassword}
              placeholder="En az 8 karakter"
              secure
            />

            {/* Doğum tarihi (zorunlu) */}
            <View style={{ gap: 6 }}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  color: colors.text,
                }}
              >
                Doğum tarihi
              </Text>
              <Pressable
                onPress={() => setShowPicker(true)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderWidth: 1.5,
                  borderColor: birthDate ? colors.accent : colors.border,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 15,
                  backgroundColor: colors.surfaceAlt,
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: birthDate ? "600" : "400",
                    color: birthDate ? colors.text : colors.textDim,
                  }}
                >
                  {birthDate ? formatDate(birthDate) : "Doğum tarihini seç"}
                </Text>
                <Calendar size={18} color={colors.textDim} />
              </Pressable>
            </View>

            {showPicker && (
              <View>
                <DateTimePicker
                  value={birthDate ?? defaultDate}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  maximumDate={maxDate}
                  onChange={(event, selected) => {
                    if (Platform.OS === "android") {
                      setShowPicker(false);
                    }
                    if (event.type === "set" && selected) {
                      setBirthDate(selected);
                    }
                  }}
                />
                {Platform.OS === "ios" && (
                  <Pressable
                    onPress={() => setShowPicker(false)}
                    style={{
                      alignSelf: "flex-end",
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                    }}
                  >
                    <Text
                      style={{
                        color: colors.accent,
                        fontWeight: "700",
                        fontSize: 15,
                      }}
                    >
                      Tamam
                    </Text>
                  </Pressable>
                )}
              </View>
            )}

            {/* Cinsiyet (opsiyonel) */}
            <View style={{ gap: 6 }}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  color: colors.text,
                }}
              >
                Cinsiyet{" "}
                <Text style={{ color: colors.textFaint, fontWeight: "400" }}>
                  (isteğe bağlı)
                </Text>
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {GENDER_OPTIONS.map((g) => {
                  const active = gender === g.key;
                  return (
                    <Pressable
                      key={g.key}
                      onPress={() => setGender(active ? null : g.key)}
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: active ? colors.accent : colors.border,
                        backgroundColor: active
                          ? colors.accentSoft
                          : colors.surface,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: active ? "700" : "500",
                          color: active ? colors.accent : colors.textDim,
                        }}
                      >
                        {g.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Onay kutuları */}
            <Pressable
              onPress={() => setAcceptedTerms(!acceptedTerms)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                marginTop: 4,
              }}
            >
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  borderWidth: 2,
                  borderColor: acceptedTerms ? colors.accent : colors.border,
                  backgroundColor: acceptedTerms
                    ? colors.accent
                    : "transparent",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {acceptedTerms && (
                  <Check size={14} color={colors.accentText} strokeWidth={3} />
                )}
              </View>
              <Text
                style={{
                  fontSize: 12.5,
                  color: colors.textDim,
                  flex: 1,
                  lineHeight: 17,
                }}
              >
                <Text
                  style={{ color: colors.accent, fontWeight: "700" }}
                  onPress={() => router.push("/legal/terms")}
                >
                  Kullanım Koşulları
                </Text>
                'nı okudum ve kabul ediyorum
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setAcceptedPrivacy(!acceptedPrivacy)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              }}
            >
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  borderWidth: 2,
                  borderColor: acceptedPrivacy ? colors.accent : colors.border,
                  backgroundColor: acceptedPrivacy
                    ? colors.accent
                    : "transparent",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {acceptedPrivacy && (
                  <Check size={14} color={colors.accentText} strokeWidth={3} />
                )}
              </View>
              <Text
                style={{
                  fontSize: 12.5,
                  color: colors.textDim,
                  flex: 1,
                  lineHeight: 17,
                }}
              >
                <Text
                  style={{ color: colors.accent, fontWeight: "700" }}
                  onPress={() => router.push("/legal/privacy")}
                >
                  Gizlilik Politikası
                </Text>
                'nı okudum ve kabul ediyorum
              </Text>
            </Pressable>

            {error ? (
              <View
                style={{
                  backgroundColor: colors.warnSoft,
                  borderRadius: 10,
                  padding: 12,
                }}
              >
                <Text style={{ fontSize: 12.5, color: colors.danger }}>
                  {error}
                </Text>
              </View>
            ) : null}

            <Text
              style={{
                fontSize: 11,
                color: colors.textFaint,
                lineHeight: 16,
                marginTop: 2,
              }}
            >
              En az 13 yaşında olmalısın.
            </Text>

            <View style={{ marginTop: 6 }}>
              <Button
                label="Kayıt Ol"
                onPress={handleRegister}
                loading={isLoading}
              />
            </View>

            {/* Ayraç */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                marginTop: 8,
              }}
            >
              <View
                style={{ flex: 1, height: 1, backgroundColor: colors.border }}
              />
              <Text style={{ fontSize: 12, color: colors.textDim }}>veya</Text>
              <View
                style={{ flex: 1, height: 1, backgroundColor: colors.border }}
              />
            </View>

            {/* Apple ile giriş */}
            <View style={{ marginTop: 8 }}>
              <AppleSignInButton onError={setError} />
            </View>

            {/* Google ile giriş */}
            <View style={{ marginTop: 8 }}>
              <GoogleSignInButton onError={setError} />
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Text style={{ fontSize: 13, color: colors.textDim }}>
              Zaten hesabın var mı?
            </Text>
            <Pressable onPress={() => router.replace("/(auth)/login")}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "800",
                  color: colors.accent,
                }}
              >
                Giriş Yap
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}