import React from "react";
import {
  Platform,
  StyleProp,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { BlurView } from "expo-blur";

import useFinance from "../../hooks/useFinance";
import { CORAL, LIME_DARK } from "../../theme/colors";
import { fmt } from "../../utils/formatadores";
import { styles } from "./styles";

type Props = {
  valor: number;
  oculto: boolean;
  negativo?: boolean;
  cor?: string;
  style?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  shrink?: boolean;
};

export default function Valor({
  valor,
  oculto,
  negativo = false,
  cor,
  style,
  containerStyle,
  shrink = false,
}: Props) {
  const { modoEscuro } = useFinance();

  const corFinal = cor ?? (valor < 0 || negativo ? CORAL : LIME_DARK);

  const texto =
    negativo && valor > 0 ? `- ${fmt(valor).replace("-", "")}` : fmt(valor);

  return (
    <View
      style={[
        styles.container,
        shrink && styles.shrink,
        oculto && {
          backgroundColor: modoEscuro
            ? "rgba(20,20,20,0.18)"
            : "rgba(255,255,255,0.12)",
        },
        containerStyle,
      ]}
    >
      <Text style={[styles.texto, { color: corFinal }, style]}>{texto}</Text>

      {oculto && (
        <BlurView
          intensity={Platform.OS === "android" ? 75 : 100}
          tint={modoEscuro ? "dark" : "light"}
          experimentalBlurMethod="dimezisBlurView"
          style={styles.blur}
        />
      )}
    </View>
  );
}
