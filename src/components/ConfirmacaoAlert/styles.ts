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
      padding: 28,
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
      maxWidth: 420,
      borderRadius: 30,
      paddingHorizontal: 34,
      paddingTop: 36,
      paddingBottom: 26,
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
      width: 84,
      height: 84,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 32,
      backgroundColor: fundoIcone,
      borderWidth: 1,
      borderColor: `${cor}22`,
    },

    titulo: {
      color: cores.INK,
      fontSize: 28,
      fontWeight: "800",
      marginBottom: 18,
    },

    mensagem: {
      color: cores.INK,
      fontSize: 20,
      lineHeight: 30,
      marginBottom: 34,
    },

    acoes: {
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
      gap: 18,
    },

    botao: {
      minHeight: 44,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 4,
    },

    textoAcao: {
      fontSize: 18,
      fontWeight: "800",
    },
  });
}
