import { StyleSheet } from "react-native";

import {
  CORAL,
  LIME,
  PURPLE,
  PURPLELIGHT,
  temaCores,
} from "../../../theme/colors";

export function createStyles(modoEscuro: boolean, bottomInset = 0) {
  const C = temaCores(modoEscuro);
  const paddingBottom = Math.max(22, bottomInset + 14);

  return StyleSheet.create({
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

    modalContent: {
      paddingHorizontal: 22,
      paddingTop: 22,
      paddingBottom,
    },

    titulo: {
      fontSize: 24,
      fontWeight: "700",
      color: C.INK,
      marginBottom: 20,
    },

    input: {
      height: 54,
      borderRadius: 14,
      backgroundColor: C.BG,
      paddingHorizontal: 16,
      color: C.INK,
      fontSize: 16,
      marginBottom: 12,
    },

    inputValor: {
      fontSize: 20,
      fontWeight: "700",
      letterSpacing: 0,
    },

    valoresRapidos: {
      flexDirection: "row",
      gap: 8,
      marginTop: -2,
      marginBottom: 14,
    },

    valorRapidoBotao: {
      flex: 1,
      height: 38,
      borderRadius: 12,
      backgroundColor: C.BG,
      borderWidth: 1,
      borderColor: C.LINE_DASH,
      justifyContent: "center",
      alignItems: "center",
    },

    valorRapidoSelecionado: {
      backgroundColor: C.PURPLELIGHT ?? PURPLELIGHT,
      borderColor: PURPLE,
    },

    valorRapidoTexto: {
      color: C.GRAY,
      fontSize: 13,
      fontWeight: "700",
    },

    valorRapidoTextoSelecionado: {
      color: PURPLE,
    },

    dataBox: {
      height: 54,
      borderRadius: 14,
      backgroundColor: C.BG,
      paddingHorizontal: 16,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },

    dataTexto: {
      flex: 1,
      marginLeft: 10,
      color: C.INK,
      fontSize: 15,
    },

    ajudaData: {
      color: C.GRAY,
      fontSize: 12,
      lineHeight: 17,
      marginBottom: 16,
    },

    botaoDividaParcelada: {
      height: 46,
      borderRadius: 14,
      backgroundColor: C.PURPLELIGHT ?? PURPLELIGHT,
      borderWidth: 1,
      borderColor: PURPLE,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
      marginBottom: 16,
    },

    botaoDividaParceladaTexto: {
      color: PURPLE,
      fontSize: 15,
      fontWeight: "700",
    },

    label: {
      color: C.INK,
      fontSize: 15,
      fontWeight: "600",
      marginTop: 8,
      marginBottom: 12,
    },

    categorias: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      marginBottom: 20,
    },

    categoriaBotao: {
      width: "47%",
      height: 50,
      borderRadius: 14,
      backgroundColor: C.BG,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: "transparent",
    },

    categoriaSelecionada: {
      borderColor: LIME,
      backgroundColor: C.LIME_BG,
    },

    categoriaTexto: {
      marginLeft: 8,
      color: C.INK,
      fontSize: 14,
      fontWeight: "600",
    },

    categoriaTextoSelecionada: {
      color: C.INK,
    },

    botaoSalvar: {
      height: 54,
      borderRadius: 14,
      backgroundColor: CORAL,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 10,
    },

    botaoSalvarTexto: {
      color: "#FFF",
      fontSize: 16,
      fontWeight: "700",
    },

    botaoCancelar: {
      height: 54,
      borderRadius: 14,
      backgroundColor: C.BG,
      justifyContent: "center",
      alignItems: "center",
    },

    botaoCancelarTexto: {
      color: C.INK,
      fontSize: 15,
      fontWeight: "600",
    },

    placeholder: {
      color: C.GRAY,
    },
  });
}
