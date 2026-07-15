// components/social/CommentInput.tsx : Yorum yazma alanı — metin, spoiler anahtarı, GIF ekleme ve yanıt modu.
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { X, Film } from "lucide-react-native";
import { useTheme } from "@/lib/store/theme";
import { useCreateComment, type Comment } from "@/lib/queries/comment";
import { GifPicker } from "@/components/social/GifPicker";

type Props = {
  targetType: "series" | "movie" | "book" | "episode";
  contentId: string | number;
  season?: number;
  episode?: number;
  replyTo?: Comment | null;
  onCancelReply?: () => void;
};

export function CommentInput({
  targetType,
  contentId,
  season,
  episode,
  replyTo,
  onCancelReply,
}: Props) {
  const { colors } = useTheme();
  const create = useCreateComment({
    targetType,
    contentId,
    season,
    episode,
  });

  const [text, setText] = useState("");
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [gifPickerOpen, setGifPickerOpen] = useState(false);

  // Metin veya GIF varsa gönderilebilir
  const canSend = text.trim().length > 0 || !!gifUrl;

  const handleSend = () => {
    if (!canSend) return;

    create.mutate(
      {
        body: text.trim(),
        isSpoiler,
        gifUrl: gifUrl ?? undefined,
        parentId: replyTo?.id,
      },
      {
        onSuccess: () => {
          setText("");
          setIsSpoiler(false);
          setGifUrl(null);
          onCancelReply?.();
        },
        onError: (err: any) => {
          const msg = err?.response?.data?.error ?? "Yorum gönderilemedi";
          Alert.alert("Hata", msg);
        },
      }
    );
  };

  return (
    <View
      style={{
        backgroundColor: colors.bg,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingHorizontal: 18,
        paddingTop: 12,
        paddingBottom: 24,
        gap: 10,
      }}
    >
      {/* Yanıt modu göstergesi */}
      {replyTo && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: colors.surface,
            borderRadius: 8,
            paddingVertical: 7,
            paddingHorizontal: 11,
          }}
        >
          <Text style={{ fontSize: 11.5, color: colors.textDim }}>
            <Text style={{ fontWeight: "700", color: colors.accent }}>
              @{replyTo.user.username}
            </Text>{" "}
            kullanıcısına yanıt veriyorsun
          </Text>

          <Pressable onPress={onCancelReply} hitSlop={8}>
            <X size={14} color={colors.textDim} />
          </Pressable>
        </View>
      )}

      {/* Seçilen GIF önizlemesi */}
      {gifUrl && (
        <View
          style={{
            alignSelf: "flex-start",
            borderRadius: 10,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <Image
            source={{ uri: gifUrl }}
            style={{ width: 120, height: 120, borderRadius: 10 }}
            contentFit="cover"
          />
          <Pressable
            onPress={() => setGifUrl(null)}
            hitSlop={6}
            style={{
              position: "absolute",
              top: 6,
              right: 6,
              width: 24,
              height: 24,
              borderRadius: 100,
              backgroundColor: "rgba(0,0,0,0.7)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={14} color="#fff" />
          </Pressable>
        </View>
      )}

      {/* Giriş alanı */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-end",
          gap: 10,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 14,
          paddingHorizontal: 14,
          paddingVertical: 4,
        }}
      >
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Yorumunu yaz..."
          placeholderTextColor={colors.textFaint}
          multiline
          maxLength={2000}
          style={{
            flex: 1,
            paddingVertical: 10,
            fontSize: 13,
            color: colors.text,
            maxHeight: 100,
          }}
        />

        {/* GIF butonu */}
        <Pressable
          onPress={() => setGifPickerOpen(true)}
          hitSlop={6}
          style={{
            paddingVertical: 8,
            paddingHorizontal: 8,
            marginBottom: 4,
          }}
        >
          <Film size={20} color={colors.textDim} />
        </Pressable>

        <Pressable
          onPress={handleSend}
          disabled={!canSend || create.isPending}
          style={{
            paddingVertical: 8,
            paddingHorizontal: 14,
            borderRadius: 10,
            backgroundColor: canSend ? colors.accent : colors.border,
            marginBottom: 4,
          }}
        >
          {create.isPending ? (
            <ActivityIndicator size="small" color={colors.accentText} />
          ) : (
            <Text
              style={{
                fontSize: 12,
                fontWeight: "800",
                color: canSend ? colors.accentText : colors.textFaint,
              }}
            >
              Gönder
            </Text>
          )}
        </Pressable>
      </View>

      {/* Spoiler anahtarı */}
      <Pressable
        onPress={() => setIsSpoiler(!isSpoiler)}
        style={{ flexDirection: "row", alignItems: "center", gap: 9 }}
      >
        <View
          style={{
            width: 34,
            height: 19,
            borderRadius: 100,
            backgroundColor: isSpoiler ? colors.accent : colors.border,
            justifyContent: "center",
            paddingHorizontal: 2,
          }}
        >
          <View
            style={{
              width: 15,
              height: 15,
              borderRadius: 100,
              backgroundColor: isSpoiler ? colors.accentText : colors.textFaint,
              alignSelf: isSpoiler ? "flex-end" : "flex-start",
            }}
          />
        </View>

        <Text
          style={{
            fontSize: 11.5,
            fontWeight: "600",
            color: isSpoiler ? colors.warn : colors.textDim,
          }}
        >
          Yorumum spoiler içeriyor
        </Text>
      </Pressable>

      {/* GIF seçici */}
      <GifPicker
        visible={gifPickerOpen}
        onClose={() => setGifPickerOpen(false)}
        onSelect={(url) => setGifUrl(url)}
      />
    </View>
  );
}