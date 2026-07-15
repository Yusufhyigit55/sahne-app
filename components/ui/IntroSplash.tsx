import { useEffect } from "react";
import { View, Text, Dimensions, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  runOnJS,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

const BG = "#0B0D0E";
const ACCENT = "#2DD4BF";
const ACCENT_BRIGHT = "#5EEAD4";
const CURTAIN = "#15181A";
const CURTAIN_LIGHT = "#1D2124";

export function IntroSplash({ onDone }: { onDone: () => void }) {
  // Perde
  const leftX = useSharedValue(0);
  const rightX = useSharedValue(0);

  // Kemer çizgisi
  const archOpacity = useSharedValue(0);

  // Spot ışığı
  const glowOpacity = useSharedValue(0);

  // Logo
  const logoOpacity = useSharedValue(0);
  const logoSpacing = useSharedValue(18);
  const lineWidth = useSharedValue(0);

  useEffect(() => {
    // 1) Kemer + spot belirir
    archOpacity.value = withTiming(1, { duration: 500 });
    glowOpacity.value = withDelay(200, withTiming(1, { duration: 800 }));

    // 2) Perde açılır
    leftX.value = withDelay(
      400,
      withTiming(-width * 0.62, {
        duration: 1200,
        easing: Easing.bezier(0.65, 0, 0.35, 1),
      })
    );

    rightX.value = withDelay(
      400,
      withTiming(width * 0.62, {
        duration: 1200,
        easing: Easing.bezier(0.65, 0, 0.35, 1),
      })
    );

    // 3) Logo belirir
    logoOpacity.value = withDelay(1100, withTiming(1, { duration: 700 }));

    logoSpacing.value = withDelay(
      1100,
      withTiming(4, {
        duration: 1000,
        easing: Easing.out(Easing.cubic),
      })
    );

    // 4) Alt çizgi
    lineWidth.value = withDelay(
      1400,
      withTiming(220, {
        duration: 800,
        easing: Easing.out(Easing.cubic),
      })
    );

    // 5) Kapanış
    logoOpacity.value = withDelay(
      2600,
      withTiming(0, { duration: 500 }, (finished) => {
        if (finished) {
          runOnJS(onDone)();
        }
      })
    );
  }, []);

  const leftStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: leftX.value }],
  }));

  const rightStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: rightX.value }],
  }));

  const archStyle = useAnimatedStyle(() => ({
    opacity: archOpacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    letterSpacing: logoSpacing.value,
  }));

  const lineStyle = useAnimatedStyle(() => ({
    width: lineWidth.value,
    opacity: logoOpacity.value,
  }));

  return (
    <View style={styles.container}>
      {/* Spot ışığı */}
      <Animated.View style={[styles.glowWrap, glowStyle]}>
        <LinearGradient
          colors={[
            "rgba(45, 212, 191, 0.14)",
            "rgba(45, 212, 191, 0.04)",
            "rgba(11, 13, 14, 0)",
          ]}
          locations={[0, 0.35, 0.7]}
          style={styles.glow}
        />
      </Animated.View>

      {/* Kemer çizgisi */}
      <Animated.View style={[styles.archWrap, archStyle]}>
        <LinearGradient
          colors={[
            "transparent",
            ACCENT,
            ACCENT_BRIGHT,
            ACCENT,
            "transparent",
          ]}
          locations={[0, 0.2, 0.5, 0.8, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.arch}
        />
      </Animated.View>

      {/* Logo */}
      <View style={styles.logoWrap}>
        <Animated.Text style={[styles.logo, logoStyle]}>SAHNE</Animated.Text>

        <Animated.View style={[styles.lineWrap, lineStyle]}>
          <LinearGradient
            colors={[
              "transparent",
              ACCENT,
              ACCENT_BRIGHT,
              ACCENT,
              "transparent",
            ]}
            locations={[0, 0.15, 0.5, 0.85, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.line}
          />
        </Animated.View>
      </View>

      {/* Sol perde */}
      <Animated.View style={[styles.curtain, styles.leftCurtain, leftStyle]}>
        <LinearGradient
          colors={[CURTAIN, CURTAIN_LIGHT, CURTAIN]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.curtainEdgeRight} />
      </Animated.View>

      {/* Sağ perde */}
      <Animated.View style={[styles.curtain, styles.rightCurtain, rightStyle]}>
        <LinearGradient
          colors={[CURTAIN, CURTAIN_LIGHT, CURTAIN]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.curtainEdgeLeft} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: BG,
    overflow: "hidden",
  },

  glowWrap: {
    position: "absolute",
    left: -width * 0.2,
    top: -height * 0.1,
    width: width * 1.4,
    height: height * 0.7,
  },
  glow: {
    flex: 1,
  },

  archWrap: {
    position: "absolute",
    left: "10%",
    right: "10%",
    top: "12%",
    height: 2,
  },
  arch: {
    flex: 1,
  },

  logoWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "44%",
    alignItems: "center",
  },
  logo: {
    fontSize: 40,
    fontWeight: "300",
    color: ACCENT_BRIGHT,
    textShadowColor: "rgba(45, 212, 191, 0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 22,
  },
  lineWrap: {
    height: 1,
    marginTop: 20,
  },
  line: {
    flex: 1,
  },

  curtain: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: width * 0.54,
  },
  leftCurtain: {
    left: 0,
  },
  rightCurtain: {
    right: 0,
  },
  curtainEdgeRight: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: "rgba(45, 212, 191, 0.35)",
  },
  curtainEdgeLeft: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: "rgba(45, 212, 191, 0.35)",
  },
});