import { StyleSheet } from "react-native";

import { PURPLE, PURPLELIGHT, temaCores } from "../../../theme/colors";

export const createStyles = (
  C: ReturnType<typeof temaCores>,
  bottomInset = 0,
) =>
  StyleSheet.create({
    gestureRoot: {
      flex: 1,
    },

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
      maxHeight: "92%",
    },

    modal: {
      backgroundColor: C.CARD,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      maxHeight: "100%",
    },

    scroll: {
      padding: 20,
      paddingBottom: Math.max(20, bottomInset + 16),
    },

    titulo: {
      fontSize: 24,
      fontWeight: "700",
      color: C.INK,
      marginBottom: 20,
    },

    section: {
      fontSize: 16,
      fontWeight: "600",
      color: C.INK,
      marginBottom: 12,
      marginTop: 10,
    },

    empty: {
      alignItems: "center",
      paddingVertical: 20,
    },

    emptyText: {
      color: C.GRAY,
      fontSize: 14,
    },

    card: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: C.BG,
      borderRadius: 14,
      padding: 14,
      marginBottom: 10,
    },

    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 6,
      gap: 6,
    },

    cardTitulo: {
      color: C.INK,
      fontWeight: "600",
      fontSize: 15,
    },

    cardValor: {
      color: PURPLE,
      fontWeight: "700",
      fontSize: 16,
    },

    cardInfo: {
      marginTop: 4,
      color: C.GRAY,
      fontSize: 13,
    },

    botaoVerMais: {
      height: 42,
      borderRadius: 14,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 12,
      borderWidth: 1,
      borderColor: PURPLE,
    },

    botaoVerMaisTexto: {
      color: PURPLE,
      fontSize: 14,
      fontWeight: "700",
    },

    input: {
      height: 52,
      backgroundColor: C.BG,
      borderRadius: 14,
      paddingHorizontal: 16,
      color: C.INK,
      marginBottom: 12,
      fontSize: 15,
    },

    inputData: {
      height: 52,
      backgroundColor: C.BG,
      borderRadius: 14,
      paddingHorizontal: 16,
      marginBottom: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },

    inputDataTexto: {
      flex: 1,
      color: C.INK,
      fontSize: 15,
    },

    switchRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },

    switchLabel: {
      color: C.INK,
      fontSize: 15,
      fontWeight: "500",
    },

    botaoSalvar: {
      height: 54,
      backgroundColor: C.LIME_BG === "#f1fbe2" ? PURPLELIGHT : "#2b2538",
      borderRadius: 14,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 6,
    },

    botaoSalvarTexto: {
      color: PURPLE,
      fontWeight: "700",
      fontSize: 16,
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
      color: C.GRAY,
      fontSize: 14,
    },

    resumoValor: {
      color: C.INK,
      fontWeight: "700",
      fontSize: 16,
    },

    botaoFechar: {
      height: 54,
      borderRadius: 14,
      backgroundColor: C.BG,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 6,
    },

    botaoFecharTexto: {
      color: C.INK,
      fontWeight: "600",
      fontSize: 15,
    },
  });
