import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useTheme } from "@/lib/store/theme";
import { useAuth } from "@/lib/store/auth";
import { Button } from "@/components/ui/Button";
import { apiError } from "@/lib/api";

export default function VerifyEmailScreen() {
  const { colors } = useTheme();
  const { verifyEmail, resendCode } = useAuth();
  const params = useLocalSearchParams<{ email: string }>();
  const email = params.email ?? "";

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const inputRef = useRef<TextInput>(null);

  // Geri sayım (yeniden gönder için)
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const handleVerify = async () => {
    setError("");
    if (code.length !== 6) {
      setError("6 haneli kodu gir");
      return;
    }
    setLoading(true);
    try {
      await verifyEmail(email, code);
      router.replace("/(tabs)");
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setError("");
    try {
      await resendCode(email);
      setResendTimer(60);
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
        <Pressable
          onPress={() => router.back()}
          style={{ padding: 16, alignSelf: "flex-start" }}
        >
          <ChevronLeft color={colors.text} size={26} />
        </Pressable>

        <View style={{ flex: 1, padding: 24, gap: 28 }}>
          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 26, fontWeight: "800", color: colors.text }}>
              E-postanı doğrula
            </Text>
            <Text style={{ fontSize: 14, color: colors.textDim, lineHeight: 20 }}>
              {email} adresine 6 haneli bir kod gönderdik. Kodu aşağıya gir.
            </Text>
          </View>

          <Pressable onPress={() => inputRef.current?.focus()}>
            <TextInput
              ref={inputRef}
              value={code}
              onChangeText={(t) => setCode(t.replace(/[^0-9]/g, "").slice(0, 6))}
              keyboardType="number-pad"
              autoFocus
              maxLength={6}
              style={{
                fontSize: 32,
                fontWeight: "700",
                letterSpacing: 12,
                textAlign: "center",
                color: colors.text,
                backgroundColor: colors.surface,
                borderRadius: 14,
                paddingVertical: 18,
              }}
              placeholder="______"
              placeholderTextColor={colors.textDim}
            />
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

          <Button label="Doğrula" onPress={handleVerify} loading={loading} />

          <View style={{ flexDirection: "row", justifyContent: "center", gap: 6 }}>
            <Text style={{ fontSize: 13, color: colors.textDim }}>
              Kod gelmedi mi?
            </Text>
            <Pressable onPress={handleResend} disabled={resendTimer > 0}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "800",
                  color: resendTimer > 0 ? colors.textDim : colors.accent,
                }}
              >
                {resendTimer > 0
                  ? `Yeniden gönder (${resendTimer})`
                  : "Yeniden gönder"}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}