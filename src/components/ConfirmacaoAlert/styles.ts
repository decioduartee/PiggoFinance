import { StyleSheet } from "react-native";

import {
  CORAL,
  LIME_DARK,
  PURPLE,
  type ThemeColors,
} from "../../theme/colors";

import type { ConfirmacaoAlertTipo } from ".";

export function createStyles(cores: ThemeColors, tipo: ConfirmacaoAlertTipo) {
  const cor =
    tipo === "danger" ? CORAL : tipo === "success" ? LIME_DARK : PURPLE;

  const fundoIcone =
    tipo === "danger"
      ? cores.CORAL_BG
      : tipo === "success"
        ? cores.LIME_BG
        : cores.SUB_CARD;

  return StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
      backgroundColor: "rgba(18,18,18,0.34)",
    },

    blur: {
      ...StyleSheet.absoluteFillObject,
    },

    backdrop: {
      ...StyleSheet.absoluteFillObject,
    },

    alert: {
      width: "100%",
      maxWidth: 360,
      borderRadius: 24,
      paddingHorizontal: 24,
      paddingTop: 24,
      paddingBottom: 18,
      backgroundColor: cores.CARD,
      borderWidth: 1,
      borderColor: cores.LINE_DASH,
      shadowColor: "#000",
      shadowOpacity: 0.22,
      shadowRadius: 28,
      shadowOffset: {
        width: 0,
        height: 16,
      },
      elevation: 18,
    },

    iconeBox: {
      width: 42,
      height: 42,
      borderRadius: 14,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 20,
      backgroundColor: fundoIcone,
      borderWidth: 1,
      borderColor: `${cor}22`,
    },

    titulo: {
      color: cores.INK,
      fontSize: 20,
      fontWeight: "800",
      marginBottom: 10,
    },

    mensagem: {
      color: cores.INK,
      fontSize: 15,
      lineHeight: 22,
      marginBottom: 22,
    },

    acoes: {
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
      gap: 14,
    },

    botao: {
      minHeight: 36,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 4,
    },

    textoAcao: {
      fontSize: 15,
      fontWeight: "800",
    },
  });
}
