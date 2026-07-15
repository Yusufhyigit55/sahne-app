// app/legal/terms.tsx : Kullanım Koşulları metnini gösteren kaydırılabilir ekran (yayın öncesi hukuki onay gerektiren taslak).
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

export default function TermsScreen() {
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
          Kullanım Koşulları
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 22, paddingTop: 6 }}>
        <P>Son güncelleme: 15 Temmuz 2026</P>

        <H>1. Taraflar ve Kabul</H>
        <P>
          Bu Kullanım Koşulları, Sahne mobil uygulamasını ("Uygulama") kullanan
          kişi ("Kullanıcı") ile Uygulamanın geliştiricisi arasındaki ilişkiyi
          düzenler. Uygulamaya kayıt olarak bu koşulları kabul etmiş olursun.
          Koşulları kabul etmiyorsan Uygulamayı kullanmamalısın.
        </P>

        <H>2. Hizmetin Tanımı</H>
        <P>
          Sahne; dizi, film ve kitapları takip etmeni, değerlendirmeni, listeler
          oluşturmanı ve diğer kullanıcılarla etkileşime geçmeni sağlayan bir
          içerik takip platformudur. Dizi ve film bilgileri TMDB, kitap
          bilgileri Google Books servislerinden alınır. Sahne bu içerikleri
          barındırmaz, yalnızca referans gösterir.
        </P>

        <H>3. Hesap ve Yaş Sınırı</H>
        <P>
          Uygulamayı kullanmak için en az 13 yaşında olmalısın. Hesabının
          güvenliğinden ve şifrenin gizliliğinden sen sorumlusun. Hesabınla
          yapılan tüm işlemlerden sen sorumlu tutulursun.
        </P>

        <H>4. Kullanıcı İçeriği ve Davranış Kuralları</H>
        <P>
          Yazdığın yorumlar, oluşturduğun listeler ve anketler senin
          sorumluluğundadır. Aşağıdakiler yasaktır: başkalarını taciz etmek,
          nefret söylemi, spam, yasa dışı içerik paylaşımı ve işaretlenmemiş
          spoiler yaymak. Bu kurallara uymayan içerikler kaldırılabilir ve
          hesabın kademeli olarak kısıtlanabilir veya kapatılabilir.
        </P>

        <H>5. Spoiler Politikası</H>
        <P>
          Sahne, izleme deneyimini korumak için spoiler yönetimi uygular. Spoiler
          içeren yorumları işaretlemen beklenir. İşaretlenmemiş spoiler paylaşımı,
          topluluk bildirimi ve moderatör onayı sonrası yaptırıma tabi tutulabilir.
        </P>

        <H>6. Fikri Mülkiyet</H>
        <P>
          Uygulamanın tasarımı, logosu ve yazılımı geliştiriciye aittir. Dizi,
          film ve kitaplara ait görsel ve bilgiler ilgili hak sahiplerine ve
          kaynak servislere (TMDB, Google Books) aittir.
        </P>

        <H>7. Sorumluluğun Sınırlandırılması</H>
        <P>
          Uygulama "olduğu gibi" sunulur. Dış servislerden gelen bilgilerin
          doğruluğu garanti edilmez. Hizmetin kesintisiz veya hatasız olacağı
          taahhüt edilmez.
        </P>

        <H>8. Hesabın Sonlandırılması</H>
        <P>
          Hesabını dilediğin zaman uygulama içinden kalıcı olarak silebilirsin.
          Koşulların ihlali durumunda geliştirici, hesabını askıya alma veya
          kapatma hakkını saklı tutar.
        </P>

        <H>9. Değişiklikler</H>
        <P>
          Bu koşullar zaman zaman güncellenebilir. Önemli değişikliklerde
          kullanıcılar bilgilendirilir. Güncelleme sonrası Uygulamayı kullanmaya
          devam etmen, yeni koşulları kabul ettiğin anlamına gelir.
        </P>

        <H>10. İletişim</H>
        <P>
          Sorularınız için uygulama üzerinden bizimle iletişime geçebilirsiniz.
        </P>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}