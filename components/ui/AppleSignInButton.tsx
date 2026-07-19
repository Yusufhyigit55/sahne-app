import { useState } from "react";
import { Platform, View } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { router } from "expo-router";
import { useAuth } from "@/lib/store/auth";

type Props = {
  onError?: (message: string) => void;
};

export function AppleSignInButton({ onError }: Props) {
  const { appleLogin } = useAuth();
  const [busy, setBusy] = useState(false);

  // Apple Sign In sadece iOS'ta
  if (Platform.OS !== "ios") return null;

  const handlePress = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        onError?.("Apple kimliği alınamadı");
        return;
      }

      await appleLogin(credential.identityToken, credential.fullName);
      router.replace("/(tabs)");
    } catch (e: any) {
      // Kullanıcı iptal ettiyse sessiz geç
      if (e?.code === "ERR_REQUEST_CANCELED") return;
      onError?.("Apple ile giriş başarısız oldu");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ width: "100%", height: 48 }}>
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
        buttonStyle={
          AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
        }
        cornerRadius={12}
        style={{ width: "100%", height: 48 }}
        onPress={handlePress}
      />
    </View>
  );
}