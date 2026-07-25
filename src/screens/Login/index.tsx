import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Logo from "../../assets/logo-piggo.png";

import { buscarModoEscuro } from "../../features/tema";
import { temaCores } from "../../theme/colors";
import { styles } from "./styles";

export default function LoadingScreen() {
  const [modoEscuro, setModoEscuro] = useState(false);

  const pulse = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const entranceScale = useRef(new Animated.Value(0.98)).current;

  useEffect(() => {
    buscarModoEscuro().then(setModoEscuro);
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),

      Animated.timing(entranceScale, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 1800,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      {
        resetBeforeIteration: true,
      },
    );

    animation.start();

    return () => animation.stop();
  }, []);

  const cores = temaCores(modoEscuro);

  const pulseScale = pulse.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.05, 1],
  });

  const pulseOpacity = pulse.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.88, 1, 0.88],
  });

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: cores.BG,
        },
      ]}
    >
      <Animated.Image
        source={Logo}
        resizeMode="contain"
        style={[
          styles.logo,
          {
            opacity: Animated.multiply(fade, pulseOpacity),
            transform: [{ scale: entranceScale }, { scale: pulseScale }],
          },
        ]}
      />
    </SafeAreaView>
  );
}
