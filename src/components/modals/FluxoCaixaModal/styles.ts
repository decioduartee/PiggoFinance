import { StyleSheet } from "react-native";

import { LIME, PURPLE, PURPLELIGHT, temaCores } from "../../../theme/colors";

export const createStyles = (
  cores: ReturnType<typeof temaCores>,
  bottomInset = 0,
) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,.35)",
      justifyContent: "flex-end",
    },

    backdrop: {
      ...StyleSheet.absoluteFillObject,
    },

    modalWrapper: {
      width: "100%",
      justifyContent: "flex-end",
      maxHeight: "90%",
    },

    modal: {
      backgroundColor: cores.CARD,
      borderTopLeftRadius: 26,
      borderTopRightRadius: 26,
      maxHeight: "100%",
    },

    scroll: {
      padding: 20,
      paddingBottom: Math.max(30, bottomInset + 20),
    },

    titulo: {
      fontSize: 24,
      fontWeight: "700",
      color: cores.INK,
      marginBottom: 20,
    },

    section: {
      fontSize: 16,
      fontWeight: "600",
      color: cores.INK,
      marginBottom: 12,
      marginTop: 12,
    },

    empty: {
      paddingVertical: 20,
      alignItems: "center",
    },

    emptyText: {
      color: cores.GRAY,
      fontSize: 14,
    },

    card: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: cores.BG,
      borderRadius: 14,
      padding: 14,
      marginBottom: 10,
    },

    cardTitulo: {
      color: cores.INK,
      fontWeight: "600",
      fontSize: 15,
    },

    cardValor: {
      marginTop: 4,
      color: LIME,
      fontWeight: "700",
      fontSize: 16,
    },

    input: {
      backgroundColor: cores.BG,
      borderRadius: 12,
      paddingHorizontal: 14,
      height: 50,
      color: cores.INK,
      marginBottom: 12,
      fontSize: 15,
    },

    botaoSalvar: {
      height: 52,
      backgroundColor: LIME,
      borderRadius: 14,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
      gap: 8,
      marginTop: 6,
    },

    botaoSalvarTexto: {
      color: "#FFF",
      fontWeight: "700",
      fontSize: 15,
    },

    resumo: {
      marginTop: 24,
      marginBottom: 20,
    },

    resumoLinha: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 10,
    },

    resumoLabel: {
      color: cores.GRAY,
      fontSize: 14,
    },

    resumoValor: {
      fontWeight: "700",
      fontSize: 16,
    },

    containerBotaoDividas: {
      flexDirection: "row",
      gap: 5,
    },

    botaoDividas: {
      height: 54,
      borderRadius: 14,
      backgroundColor: cores.LIME_BG === "#f1fbe2" ? PURPLELIGHT : "#2b2538",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 18,
      marginBottom: 12,
    },

    botaoDividasTexto: {
      color: PURPLE,
      fontWeight: "600",
      fontSize: 15,
    },

    botaoFechar: {
      height: 54,
      borderRadius: 14,
      backgroundColor: cores.BG,
      justifyContent: "center",
      alignItems: "center",
    },

    botaoFecharTexto: {
      color: cores.INK,
      fontWeight: "600",
      fontSize: 15,
    },
  });
