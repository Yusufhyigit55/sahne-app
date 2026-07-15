// app/legal/privacy.tsx : Gizlilik Politikası metnini gösteren kaydırılabilir ekran (yayın öncesi hukuki onay gerektiren taslak).
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useTheme } from "@/lib/store/theme";

function H({ children }: { children: string }) {
  const { colors } = useTheme();
  return (
    <Text
      style={{
        fontSize: 15,
        fontWeight: "800",
        color: colors.text,
        marginTop: 20,
        marginBottom: 6,
      }}
    >
      {children}
    </Text>
  );
}

function P({ children }: { children: string }) {
  const { colors } = useTheme();
  return (
    <Text
      style={{
        fontSize: 13.5,
        color: colors.textDim,
        lineHeight: 21,
        marginBottom: 8,
      }}
    >
      {children}
    </Text>
  );
}

export default function PrivacyScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          paddingHorizontal: 18,
          paddingVertical: 12,
        }}
      >
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ChevronLeft size={24} color={colors.text} />
        </Pressable>
        <Text style={{ fontSize: 18, fontWeight: "800", color: colors.text }}>
          Gizlilik Politikası
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 22, paddingTop: 6 }}>
        <P>Son güncelleme: 15 Temmuz 2026</P>

        <H>1. Genel</H>
        <P>
          Bu Gizlilik Politikası, Sahne uygulamasının hangi kişisel verileri
          topladığını, nasıl kullandığını ve koruduğunu açıklar. Uygulamayı
          kullanarak bu politikayı kabul etmiş olursun.
        </P>

        <H>2. Topladığımız Veriler</H>
        <P>
          Hesap bilgileri: e-posta adresin, kullanıcı adın ve görünen ismin.
        </P>
        <P>
          Kullanım verileri: izlediğin dizi ve filmler, okuduğun kitaplar,
          bölüm işaretlemelerin, puanların, favorilerin, oluşturduğun listeler ve
          anketler, yazdığın yorumlar.
        </P>
        <P>
          Sosyal veriler: takip ettiğin ve seni takip eden kullanıcılar,
          engelleme ve sessize alma tercihlerin.
        </P>
        <P>
          İsteğe bağlı veriler: doğum tarihi gibi kayıt sırasında paylaşmayı
          seçtiğin bilgiler.
        </P>

        <H>3. Verileri Ne İçin Kullanıyoruz</H>
        <P>
          Verilerini; hesabını oluşturmak ve yönetmek, izleme geçmişini
          saklamak, sana içerik önerileri sunmak, istatistiklerini hesaplamak,
          zevk uyumu gibi sosyal özellikleri sağlamak ve topluluk kurallarını
          uygulamak için kullanırız. Verilerini pazarlama amacıyla üçüncü
          taraflara satmayız.
        </P>

        <H>4. Üçüncü Taraf Servisler</H>
        <P>
          Dizi ve film bilgileri için TMDB, kitap bilgileri için Google Books
          servislerini kullanırız. Bu servislere içerik ararken sorgu gönderilir,
          ancak kişisel hesap bilgilerin bu servislerle paylaşılmaz.
        </P>

        <H>5. Veri Saklama ve Güvenlik</H>
        <P>
          Verilerin güvenli sunucularda saklanır. Şifreler geri döndürülemez
          şekilde şifrelenerek tutulur. Verilerine yetkisiz erişimi önlemek için
          makul teknik önlemler alınır.
        </P>

        <H>6. Hesap ve Veri Silme</H>
        <P>
          Hesabını uygulama içindeki Ayarlar bölümünden kalıcı olarak
          silebilirsin. Hesap silindiğinde izleme geçmişin, yorumların ve
          diğer tüm verilerin kalıcı olarak kaldırılır.
        </P>

        <H>7. Çocukların Gizliliği</H>
        <P>
          Uygulama 13 yaşından küçüklere yönelik değildir. 13 yaşından küçük
          olduğunu tespit ettiğimiz hesapları kapatırız.
        </P>

        <H>8. Değişiklikler</H>
        <P>
          Bu politika güncellenebilir. Önemli değişikliklerde kullanıcılar
          bilgilendirilir.
        </P>

        <H>9. İletişim</H>
        <P>
          Kişisel verilerinle ilgili taleplerin için uygulama üzerinden bizimle
          iletişime geçebilirsin.
        </P>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}