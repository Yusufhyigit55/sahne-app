import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/store/auth";
import { useTheme } from "@/lib/store/theme";
import { IntroSplash } from "@/components/ui/IntroSplash";
import "../global.css";

function RootNavigator() {
  const { isAuthed, isLoading, loadSession } = useAuth();
  const { colors, name } = useTheme();

  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    loadSession();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inPublicGroup = segments[0] === "legal";

    if (!isAuthed && !inAuthGroup && !inPublicGroup) {
      router.replace("/(auth)/login");
    } else if (isAuthed && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [isAuthed, isLoading, segments]);

  if (isLoading) {
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

  return (
    <>
      <StatusBar style={name === "dark" ? "light" : "dark"} />

      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="share-card" />
        <Stack.Screen name="stats" />
        <Stack.Screen name="together/[username]" />
        <Stack.Screen name="content/[type]/[id]" />
        <Stack.Screen name="comments/[type]/[id]" />
        <Stack.Screen name="user/[username]" />
        <Stack.Screen name="person/[id]" />
        <Stack.Screen name="social/[username]" />
        <Stack.Screen name="settings/index" />
        <Stack.Screen name="settings/blocked" />
        <Stack.Screen name="settings/about" />
        <Stack.Screen name="lists/index" />
        <Stack.Screen name="lists/[id]" />
        <Stack.Screen name="admin/index" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [introDone, setIntroDone] = useState(false);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <RootNavigator />

          {!introDone && <IntroSplash onDone={() => setIntroDone(true)} />}
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}