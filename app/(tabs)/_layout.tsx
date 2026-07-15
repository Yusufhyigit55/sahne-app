import { Tabs } from "expo-router";
import { View } from "react-native";
import { Home, Search, Plus, Bell, User } from "lucide-react-native";
import { useTheme } from "@/lib/store/theme";

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        animation: "shift",
        tabBarStyle: {
          backgroundColor: colors.surfaceAlt,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 88,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textDim,
        tabBarLabelStyle: { fontSize: 10, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Ana Sayfa",
          tabBarIcon: ({ color }) => <Home size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: "Keşfet",
          tabBarIcon: ({ color }) => <Search size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: "",
          tabBarIcon: () => (
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 100,
                backgroundColor: colors.accent,
                alignItems: "center",
                justifyContent: "center",
                marginTop: -6,
              }}
            >
              <Plus size={26} color={colors.accentText} strokeWidth={2.5} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Bildirimler",
          tabBarIcon: ({ color }) => <Bell size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color }) => <User size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}