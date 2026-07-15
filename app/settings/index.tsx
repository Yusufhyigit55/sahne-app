import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  Trash2,
  Camera,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { useTheme } from "@/lib/store/theme";
import { useAuth } from "@/lib/store/auth";
import {
  useSettings,
  useUpdateSettings,
  useDeleteAccount,
} from "@/lib/queries/settings";
import { uploadToCloudinary } from "@/lib/cloudinary";

function Section({ title, children }: { title: string; children: any }) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: 8 }}>
      <Text
        style={{
          fontSize: 12,
          fontWeight: "800",
          color: colors.textDim,
          paddingHorizontal: 18,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        {title}
      </Text>
      <View
        style={{
          backgroundColor: colors.surface,
          marginHorizontal: 18,
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        {children}
      </View>
    </View>
  );
}

function Row({
  label,
  desc,
  value,
  onToggle,
  onPress,
  danger,
  last,
}: {
  label: string;
  desc?: string;
  value?: boolean;
  onToggle?: (v: boolean) => void;
  onPress?: () => void;
  danger?: boolean;
  last?: boolean;
}) {
  const { colors } = useTheme();

  const content = (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: colors.border,
      }}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <Text
          style={{
            fontSize: 13.5,
            fontWeight: "600",
            color: danger ? colors.danger : colors.text,
          }}
        >
          {label}
        </Text>
        {desc && (
          <Text style={{ fontSize: 11.5, color: colors.textDim, lineHeight: 16 }}>
            {desc}
          </Text>
        )}
      </View>

      {onToggle && (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: colors.border, true: colors.accent }}
          thumbColor="#fff"
        />
      )}

      {onPress && !onToggle && (
        <ChevronRight size={17} color={colors.textFaint} />
      )}
    </View>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }

  return content;
}

export default function SettingsScreen() {
  const { colors, name: themeName, setTheme } = useTheme();
  const { logout, user, setUser } = useAuth();

  const q = useSettings();
  const update = useUpdateSettings();
  const deleteAcc = useDeleteAccount();

  const s = q.data;

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (s) {
      setDisplayName(s.displayName);
      setBio(s.bio);
    }
  }, [s]);

  const handleChangeAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        "İzin gerekli",
        "Fotoğraf seçmek için galeri erişimine izin ver."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;

    setUploadingAvatar(true);
    try {
      const url = await uploadToCloudinary(result.assets[0].uri);
      await update.mutateAsync({ avatar: url });
      if (user) setUser({ ...user, avatar: url });
    } catch (err) {
      Alert.alert("Hata", "Fotoğraf yüklenemedi, tekrar dene.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = () => {
    update.mutate(
      { displayName, bio },
      {
        onSuccess: () => Alert.alert("Kaydedildi", "Profilin güncellendi."),
        onError: (err: any) =>
          Alert.alert(
            "Hata",
            err?.response?.data?.error ?? "Kaydedilemedi"
          ),
      }
    );
  };

  const handleTheme = (next: "dark" | "beige") => {
    setTheme(next);
    update.mutate({ theme: next });
  };

  const handleDelete = () => {
    Alert.prompt(
      "Hesabı Sil",
      "Bu işlem GERİ ALINAMAZ. Tüm verilerin kalıcı olarak silinecek.\n\nOnaylamak için şifreni gir:",
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Hesabı Sil",
          style: "destructive",
          onPress: (password?: string) => {
            if (!password) return;

            deleteAcc.mutate(password, {
              onSuccess: () => {
                Alert.alert("Hesap silindi", "Tüm verilerin kaldırıldı.");
                logout();
              },
              onError: (err: any) =>
                Alert.alert(
                  "Hata",
                  err?.response?.data?.error ?? "Silinemedi"
                ),
            });
          },
        },
      ],
      "secure-text"
    );
  };

  if (q.isLoading || !s) {
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
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.bg }}
      edges={["top"]}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 40, gap: 24 }}>
        {/* Başlık */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            paddingHorizontal: 18,
            paddingTop: 8,
          }}
        >
          <Pressable
            onPress={() => router.back()}
            style={{
              width: 32,
              height: 32,
              borderRadius: 100,
              backgroundColor: colors.surface,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ChevronLeft size={18} color={colors.text} />
          </Pressable>

          <Text
            style={{ fontSize: 20, fontWeight: "800", color: colors.text }}
          >
            Ayarlar
          </Text>
        </View>

        {/* PROFİL */}
        <Section title="Profil">
          <View
            style={{
              padding: 16,
              gap: 14,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            {/* Avatar */}
            <View style={{ alignItems: "center", gap: 10 }}>
              <Pressable
                onPress={handleChangeAvatar}
                disabled={uploadingAvatar}
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: 44,
                  backgroundColor: colors.surfaceAlt,
                  overflow: "hidden",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                {uploadingAvatar ? (
                  <ActivityIndicator color={colors.accent} />
                ) : user?.avatar ? (
                  <Image
                    source={{ uri: user.avatar }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                  />
                ) : (
                  <Camera size={28} color={colors.textFaint} />
                )}
              </Pressable>
              <Pressable
                onPress={handleChangeAvatar}
                disabled={uploadingAvatar}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "700",
                    color: colors.accent,
                  }}
                >
                  {uploadingAvatar ? "Yükleniyor..." : "Fotoğrafı Değiştir"}
                </Text>
              </Pressable>
            </View>

            <View style={{ gap: 6 }}>
              <Text
                style={{
                  fontSize: 11.5,
                  fontWeight: "700",
                  color: colors.textDim,
                }}
              >
                Görünen İsim
              </Text>
              <TextInput
                value={displayName}
                onChangeText={setDisplayName}
                maxLength={50}
                style={{
                  backgroundColor: colors.surfaceAlt,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 10,
                  paddingVertical: 11,
                  paddingHorizontal: 13,
                  fontSize: 13.5,
                  color: colors.text,
                }}
              />
            </View>

            <View style={{ gap: 6 }}>
              <Text
                style={{
                  fontSize: 11.5,
                  fontWeight: "700",
                  color: colors.textDim,
                }}
              >
                Biyografi ({bio.length}/200)
              </Text>
              <TextInput
                value={bio}
                onChangeText={setBio}
                maxLength={200}
                multiline
                placeholder="Kendinden bahset..."
                placeholderTextColor={colors.textFaint}
                style={{
                  backgroundColor: colors.surfaceAlt,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 10,
                  paddingVertical: 11,
                  paddingHorizontal: 13,
                  fontSize: 13.5,
                  color: colors.text,
                  minHeight: 70,
                  textAlignVertical: "top",
                }}
              />
            </View>

            <Pressable
              onPress={handleSaveProfile}
              disabled={update.isPending}
              style={{
                backgroundColor: colors.accent,
                borderRadius: 10,
                paddingVertical: 12,
                alignItems: "center",
                opacity: update.isPending ? 0.6 : 1,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "800",
                  color: colors.accentText,
                }}
              >
                {update.isPending ? "Kaydediliyor..." : "Kaydet"}
              </Text>
            </Pressable>
          </View>

          <Row
            label="Kullanıcı Adı"
            desc={
              s.canChangeUsername
                ? `@${s.username} · 30 günde bir değiştirilebilir`
                : `@${s.username} · ${new Date(
                    s.usernameChangeDate!
                  ).toLocaleDateString("tr-TR")} tarihinden sonra değiştirilebilir`
            }
            last
          />
        </Section>

        {/* GÖRÜNÜM */}
        <Section title="Görünüm">
          <View style={{ padding: 16, gap: 10 }}>
            <Text
              style={{
                fontSize: 11.5,
                fontWeight: "700",
                color: colors.textDim,
              }}
            >
              Tema
            </Text>

            <View style={{ flexDirection: "row", gap: 10 }}>
              {[
                { key: "dark" as const, label: "Koyu" },
                { key: "beige" as const, label: "Bej" },
              ].map((t) => (
                <Pressable
                  key={t.key}
                  onPress={() => handleTheme(t.key)}
                  style={{
                    flex: 1,
                    backgroundColor:
                      themeName === t.key ? colors.accentSoft : colors.surfaceAlt,
                    borderWidth: 1,
                    borderColor:
                      themeName === t.key ? colors.accent : colors.border,
                    borderRadius: 10,
                    paddingVertical: 12,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "700",
                      color:
                        themeName === t.key ? colors.accent : colors.textDim,
                    }}
                  >
                    {t.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </Section>

        {/* GİZLİLİK */}
        <Section title="Gizlilik">
          <Row
            label="Herkes Takip Edebilsin"
            desc="Kapalıysa takip istekleri onayını bekler"
            value={!s.isPrivate}
            onToggle={(v) => update.mutate({ isPrivate: !v })}
          />
          <Row
            label="Aktivite Gizleme"
            desc="İzlediklerin arkadaşlarının akışında görünmez"
            value={s.activityHidden}
            onToggle={(v) => update.mutate({ activityHidden: v })}
          />
          <Row
            label="İstatistikler Herkese Açık"
            desc="İzleme istatistiklerin profilinde görünür"
            value={s.statsPublic}
            onToggle={(v) => update.mutate({ statsPublic: v })}
          />
          <Row
            label="Engellenenler"
            onPress={() => router.push("/settings/blocked")}
            last
          />
        </Section>

        {/* MODERASYON — sadece moderatör/admin görür */}
        {(user?.role === "moderator" || user?.role === "admin") && (
          <Section title="Moderasyon">
            <Row
              label="Moderasyon Paneli"
              desc="Şikayetleri incele, ban yönet"
              onPress={() => router.push("/admin")}
              last
            />
          </Section>
        )}

        {/* BİLDİRİMLER */}
        <Section title="Bildirimler">
          <Row
            label="Push Bildirimleri"
            value={s.notifPrefs.push}
            onToggle={(v) =>
              update.mutate({ notifPrefs: { ...s.notifPrefs, push: v } })
            }
          />
          <Row
            label="Yeni Bölüm"
            desc="Takip ettiğin dizilerin yeni bölümleri"
            value={s.notifPrefs.newEpisode}
            onToggle={(v) =>
              update.mutate({ notifPrefs: { ...s.notifPrefs, newEpisode: v } })
            }
          />
          <Row
            label="Takipler"
            value={s.notifPrefs.follows}
            onToggle={(v) =>
              update.mutate({ notifPrefs: { ...s.notifPrefs, follows: v } })
            }
          />
          <Row
            label="Yorum Yanıtları"
            value={s.notifPrefs.commentReplies}
            onToggle={(v) =>
              update.mutate({
                notifPrefs: { ...s.notifPrefs, commentReplies: v },
              })
            }
          />
          <Row
            label="Beğeniler"
            value={s.notifPrefs.likes}
            onToggle={(v) =>
              update.mutate({ notifPrefs: { ...s.notifPrefs, likes: v } })
            }
            last
          />
        </Section>

        {/* HAKKINDA */}
        <Section title="Hakkında">
          <Row
            label="Uygulama Bilgileri"
            desc="Sürüm, veri kaynakları, yasal"
            onPress={() => router.push("/settings/about")}
            last
          />
        </Section>

        {/* HESAP */}
        <Section title="Hesap">
          <Pressable
            onPress={logout}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 11,
              paddingVertical: 14,
              paddingHorizontal: 16,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <LogOut size={16} color={colors.textDim} />
            <Text
              style={{ fontSize: 13.5, fontWeight: "600", color: colors.text }}
            >
              Çıkış Yap
            </Text>
          </Pressable>

          <Pressable
            onPress={handleDelete}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 11,
              paddingVertical: 14,
              paddingHorizontal: 16,
            }}
          >
            <Trash2 size={16} color={colors.danger} />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 13.5,
                  fontWeight: "600",
                  color: colors.danger,
                }}
              >
                Hesabı Sil
              </Text>
              <Text
                style={{ fontSize: 11.5, color: colors.textDim, marginTop: 2 }}
              >
                Tüm verilerin kalıcı olarak silinir
              </Text>
            </View>
          </Pressable>
        </Section>

        {/* Sürüm */}
        <Text
          style={{
            fontSize: 11,
            color: colors.textFaint,
            textAlign: "center",
            marginTop: 8,
          }}
        >
          Sahne v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}