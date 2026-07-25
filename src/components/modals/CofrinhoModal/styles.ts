import { StyleSheet } from "react-native";

import { LIME, temaCores } from "../../../theme/colors";

export function createStyles(modoEscuro: boolean, bottomInset = 0) {
  const cores = temaCores(modoEscuro);
  const paddingBottom = Math.max(24, bottomInset + 14);

  const modalBg = cores.CARD;
  const mutedBg = cores.BG;
  const textMuted = cores.GRAY;
  const inputText = modoEscuro ? cores.INK : "#171717";

  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(23,23,23,.60)",
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
      width: "100%",
      backgroundColor: modalBg,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      overflow: "hidden",
      maxHeight: "100%",
    },

    modalContent: {
      paddingBottom,
    },

    header: {
      paddingHorizontal: 22,
      paddingTop: 22,
    },

    headerTitulo: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },

    titulo: {
      fontSize: 22,
      fontWeight: "700",
      color: cores.INK,
    },

    tabsArea: {
      paddingHorizontal: 22,
      paddingTop: 20,
    },

    tabs: {
      flexDirection: "row",
      backgroundColor: mutedBg,
      borderRadius: 14,
      padding: 4,
    },

    tabBotao: {
      flex: 1,
      height: 44,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },

    tabSelecionada: {
      backgroundColor: modalBg,
      elevation: modoEscuro ? 0 : 2,
    },

    tabTexto: {
      color: textMuted,
      fontSize: 14,
      fontWeight: "600",
    },

    tabTextoSelecionado: {
      color: LIME,
    },

    descricao: {
      paddingHorizontal: 22,
      paddingTop: 16,
      color: textMuted,
      fontSize: 15,
      lineHeight: 21,
    },

    saldoCard: {
      marginHorizontal: 22,
      marginTop: 16,
      borderRadius: 14,
      backgroundColor: cores.BG,
      paddingHorizontal: 16,
      paddingVertical: 18,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 14,
    },

    saldoInfo: {
      flex: 1,
    },

    saldoTitulo: {
      color: textMuted,
      fontSize: 14,
    },

    saldoValor: {
      color: LIME,
      fontSize: 30,
      fontWeight: "700",
      marginTop: 4,
    },

    iconeGrande: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: cores.LIME_BG,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },

    moedaBadge: {
      position: "absolute",
      top: -4,
      right: -4,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: modalBg,
      borderWidth: 2,
      borderColor: LIME,
      alignItems: "center",
      justifyContent: "center",
    },

    campoArea: {
      paddingHorizontal: 22,
      marginTop: 24,
    },

    label: {
      color: cores.INK,
      fontSize: 15,
      fontWeight: "600",
    },

    valorBox: {
      marginTop: 8,
      height: 54,
      borderRadius: 14,
      backgroundColor: cores.BG,
      paddingHorizontal: 16,
      flexDirection: "row",
      alignItems: "center",
    },

    valorInput: {
      flex: 1,
      color: inputText,
      fontSize: 17,
      fontWeight: "600",
      paddingVertical: 0,
    },

    motivoInput: {
      marginTop: 8,
      minHeight: 88,
      borderRadius: 14,
      backgroundColor: cores.BG,
      paddingHorizontal: 16,
      paddingVertical: 12,
      color: inputText,
      fontSize: 15,
    },

    placeholder: {
      color: modoEscuro ? "#777b82" : "#a3a3a3",
    },

    botoes: {
      paddingHorizontal: 22,
      marginTop: 28,
    },

    botaoPrincipal: {
      width: "100%",
      height: 54,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
    },

    botaoPrincipalTexto: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "700",
    },

    botaoCancelar: {
      width: "100%",
      height: 54,
      borderRadius: 14,
      backgroundColor: mutedBg,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 12,
    },

    botaoCancelarTexto: {
      color: cores.INK,
      fontSize: 15,
      fontWeight: "600",
    },
  });
}
