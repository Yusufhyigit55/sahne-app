import { useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useTheme } from "@/lib/store/theme";
import { useAuth } from "@/lib/store/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { apiError } from "@/lib/api";

export default function ForgotPasswordScreen() {
  const { colors } = useTheme();
  const { forgotPassword, resetPassword } = useAuth();

  // step 1: mail gir, step 2: kod + yeni şifre
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    setError("");
    if (!email.includes("@") || !email.includes(".")) {
      setError("Geçerli bir e-posta gir");
      return;
    }
    setLoading(true);
    try {
      await forgotPassword(email);
      setStep(2);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setError("");
    if (code.length !== 6) {
      setError("6 haneli kodu gir");
      return;
    }
    if (newPassword.length < 8) {
      setError("Yeni şifre en az 8 karakter olmalı");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email, code, newPassword);
      router.replace("/(auth)/login");
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
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

        <ScrollView
          contentContainerStyle={{ padding: 24, gap: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 26, fontWeight: "800", color: colors.text }}>
              Şifreni sıfırla
            </Text>
            <Text style={{ fontSize: 14, color: colors.textDim, lineHeight: 20 }}>
              {step === 1
                ? "E-posta adresini gir, sana sıfırlama kodu gönderelim."
                : `${email} adresine gönderdiğimiz kodu ve yeni şifreni gir.`}
            </Text>
          </View>

          {step === 1 ? (
            <Input
              label="E-posta"
              value={email}
              onChangeText={setEmail}
              placeholder="ornek@mail.com"
              keyboardType="email-address"
            />
          ) : (
            <View style={{ gap: 14 }}>
              <Input
                label="Doğrulama kodu"
                value={code}
                onChangeText={(t) =>
                  setCode(t.replace(/[^0-9]/g, "").slice(0, 6))
                }
                placeholder="6 haneli kod"
                keyboardType="number-pad"
              />
              <Input
                label="Yeni şifre"
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="••••••••"
                secure
              />
            </View>
          )}

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

          <Button
            label={step === 1 ? "Kod Gönder" : "Şifreyi Sıfırla"}
            onPress={step === 1 ? handleSendCode : handleReset}
            loading={loading}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}