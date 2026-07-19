import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { api } from "@/lib/api";

// Bildirim geldiğinde nasıl davransın (uygulama açıkken)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Push izni ister, Expo push token alır ve backend'e kaydeder.
 * Giriş yapıldıktan sonra çağrılmalı.
 */
export async function registerForPush(): Promise<void> {
  try {
    // Simülatörde push çalışmaz
    if (!Device.isDevice) return;

    // İzin durumu
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;

    if (existing !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // İzin verilmediyse çık
    if (finalStatus !== "granted") return;

    // Android için kanal (iOS'ta gerekmez ama zararsız)
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    // Expo push token al
    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData.data;

    if (token) {
      // Backend'e kaydet
      await api.post("/api/push/register", { token });
    }
  } catch (err) {
    console.error("Push kayıt hatası:", err);
    // Sessiz geç — push kaydı başarısız olsa da uygulama çalışsın
  }
}