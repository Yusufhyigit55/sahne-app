// components/ui/DismissKeyboardView.tsx : İçeriğe dokununca (input dışı boş alan) klavyeyi kapatan sarmalayıcı.
import { Keyboard, TouchableWithoutFeedback, View, Platform } from "react-native";

/**
 * Çocuklarını sarar; input olmayan bir alana dokunulduğunda klavyeyi kapatır.
 * Android'de scroll/list davranışını bozmamak için sadece dokunmayı yakalar,
 * event'i tüketmez (accessible=false + input'lar normal çalışır).
 */
export function DismissKeyboardView({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: any;
}) {
  return (
    <TouchableWithoutFeedback
      onPress={Keyboard.dismiss}
      accessible={false}
    >
      <View style={[{ flex: 1 }, style]}>{children}</View>
    </TouchableWithoutFeedback>
  );
}