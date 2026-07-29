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
      padding: 26,
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
      maxWidth: 320,
      borderRadius: 22,
      paddingHorizontal: 20,
      paddingTop: 18,
      paddingBottom: 14,
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
      width: 36,
      height: 36,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: fundoIcone,
      borderWidth: 1,
      borderColor: `${cor}22`,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 12,
    },

    titulo: {
      flex: 1,
      color: cores.INK,
      fontSize: 18,
      fontWeight: "800",
    },

    mensagem: {
      color: cores.INK,
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 16,
    },

    acoes: {
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
      gap: 12,
    },

    botao: {
      minHeight: 32,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 4,
    },

    textoAcao: {
      fontSize: 14,
      fontWeight: "800",
    },
  });
}
