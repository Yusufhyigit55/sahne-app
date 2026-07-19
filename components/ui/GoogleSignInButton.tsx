import { useEffect, useState } from "react";
import { Pressable, Text, View, ActivityIndicator } from "react-native";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { router } from "expo-router";
import { useTheme } from "@/lib/store/theme";
import { useAuth } from "@/lib/store/auth";

WebBrowser.maybeCompleteAuthSession();

const IOS_CLIENT_ID =
  "1018077345707-7rb7ofqta87sehilk6t96h66mnko573v.apps.googleusercontent.com";
const WEB_CLIENT_ID =
  "1018077345707-1cun29le2h37arvkrsu9t7ritfl1j548.apps.googleusercontent.com";

type Props = {
  onError?: (message: string) => void;
};

export function GoogleSignInButton({ onError }: Props) {
  const { colors } = useTheme();
  const { googleLogin } = useAuth();
  const [busy, setBusy] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: IOS_CLIENT_ID,
    webClientId: WEB_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === "success") {
      const idToken = response.authentication?.idToken;
      if (idToken) {
        setBusy(true);
        googleLogin(idToken)
          .then(() => router.replace("/(tabs)"))
          .catch(() => onError?.("Google ile giriş başarısız oldu"))
          .finally(() => setBusy(false));
      } else {
        onError?.("Google kimliği alınamadı");
      }
    }
  }, [response]);

  return (
    <Pressable
      onPress={() => promptAsync()}
      disabled={!request || busy}
      style={{
        width: "100%",
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
      }}
    >
      {busy ? (
        <ActivityIndicator color={colors.text} />
      ) : (
        <>
          <GoogleLogo />
          <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }}>
            Google ile devam et
          </Text>
        </>
      )}
    </Pressable>
  );
}

/** Basit Google "G" logosu (renkli) */
function GoogleLogo() {
  return (
    <View style={{ width: 18, height: 18 }}>
      <Text style={{ fontSize: 16, fontWeight: "800", color: "#4285F4" }}>
        G
      </Text>
    </View>
  );
}