import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppleSignInButton } from "@/components/ui/AppleSignInButton";
import { GoogleSignInButton } from "@/components/ui/GoogleSignInButton";
import { router } from "expo-router";
import { useTheme } from "@/lib/store/theme";
import { useAuth } from "@/lib/store/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { apiError } from "@/lib/api";

export default function LoginScreen() {
  const { colors } = useTheme();
  const { login, isLoading } = useAuth();

  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    if (!emailOrUsername || !password) {
      setError("Tüm alanları doldurun");
      return;
    }

    try {
      await login(emailOrUsername, password);
      router.replace("/(tabs)");
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
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            padding: 24,
            gap: 28,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={{ alignItems: "center", gap: 8 }}>
            <Text
              style={{
                fontSize: 34,
                fontWeight: "800",
                color: colors.accent,
                letterSpacing: 2,
              }}
            >
              Tracks
            </Text>
            <Text style={{ fontSize: 13, color: colors.textDim }}>
              İzlediklerini takip et, keşfet, paylaş
            </Text>
          </View>

          {/* Form */}
          <View style={{ gap: 14 }}>
            <Input
              label="E-posta veya kullanıcı adı"
              value={emailOrUsername}
              onChangeText={setEmailOrUsername}
              placeholder="ornek@mail.com"
              keyboardType="email-address"
            />

            <Input
              label="Şifre"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secure
            />

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

            <View style={{ marginTop: 6 }}>
              <Button
                label="Giriş Yap"
                onPress={handleLogin}
                loading={isLoading}
              />
            </View>

            <Pressable
              onPress={() => router.push("/(auth)/forgot-password")}
              style={{ alignSelf: "center", marginTop: 2 }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  color: colors.textDim,
                }}
              >
                Şifremi unuttum
              </Text>
            </Pressable>

            {/* Ayraç */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                marginTop: 4,
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
            <AppleSignInButton onError={setError} />

            {/* Google ile giriş */}
            <GoogleSignInButton onError={setError} />
          </View>

          {/* Kayıt linki */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Text style={{ fontSize: 13, color: colors.textDim }}>
              Hesabın yok mu?
            </Text>
            <Pressable onPress={() => router.push("/(auth)/register")}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "800",
                  color: colors.accent,
                }}
              >
                Kayıt Ol
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}