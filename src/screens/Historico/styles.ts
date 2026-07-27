import { StyleSheet } from "react-native";
import {
  ICON_INK,
  LIME_DARK,
  CORAL,
  PURPLE,
  temaCores,
} from "../../theme/colors";

export function createStyles(modoEscuro: boolean) {
  const cores = temaCores(modoEscuro);

  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: cores.BG,
    },

    content: {
      padding: 18,
    },

    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 15,
    },

    titulo: {
      fontSize: 28,
      fontWeight: "800",
      color: cores.INK,
    },

    subtitulo: {
      marginTop: 2,
      fontSize: 13,
      color: cores.GRAY,
      marginBottom: 25,
    },

    olhoBotao: {
      width: 42,
      height: 42,
      borderRadius: 21,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: cores.CARD,
      borderWidth: 1,
      borderColor: cores.SUB_CARD,
    },

    buscaBox: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: cores.CARD,
      borderRadius: 18,
      paddingHorizontal: 16,
      height: 54,
      borderWidth: 1,
      borderColor: cores.SUB_CARD,
      marginBottom: 10,
    },

    buscaInput: {
      flex: 1,
      marginLeft: 10,
      fontSize: 15,
      color: cores.INK,
    },

    resumo: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 5,
    },

    resumoCard: {
      flex: 1,
      backgroundColor: cores.CARD,
      borderRadius: 22,
      padding: 16,
      borderWidth: 1,
      borderColor: cores.SUB_CARD,
    },

    resumoIconeEntrada: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: cores.LIME_BG,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 12,
    },

    resumoIconeSaida: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: cores.CORAL_BG,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 12,
    },

    resumoLabel: {
      fontSize: 12,
      color: cores.GRAY,
      marginBottom: 4,
    },

    resumoValor: {
      fontSize: 18,
      fontWeight: "800",
    },

    grupo: {
      marginBottom: 5,
    },

    grupoTitulo: {
      fontSize: 14,
      fontWeight: "800",
      color: cores.GRAY,
      marginBottom: 10,
    },

    linha: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: cores.CARD,
      borderRadius: 18,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: cores.SUB_CARD,
    },

    icone: {
      width: 46,
      height: 46,
      borderRadius: 23,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 14,
      backgroundColor: cores.SUB_CARD,
    },

    info: {
      flex: 1,
    },

    nome: {
      fontSize: 15,
      fontWeight: "700",
      color: cores.INK,
    },

    categoria: {
      marginTop: 2,
      fontSize: 12,
      color: cores.GRAY,
    },

    valor: {
      fontSize: 15,
      fontWeight: "800",
      marginRight: 14,
    },

    vazio: {
      marginTop: 40,
      textAlign: "center",
      color: cores.GRAY,
      fontSize: 15,
    },

    backButton: {
      width: 80,
      height: 38,
      borderRadius: 21,
      flexDirection: "row",
      gap: 2,
      paddingRight: 5,
      backgroundColor: cores.CARD,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 14,
      borderWidth: 1,
      borderColor: cores.SUB_CARD,
    },

    tituloButton: {
      color: cores.INK,
      fontSize: 14,
    },

    meses: {
      flexDirection: "row",
      marginBottom: 10,
      paddingRight: 18,
    },

    mesButton: {
      backgroundColor: cores.CARD,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      marginRight: 10,
      borderWidth: 1,
      borderColor: cores.SUB_CARD,
    },

    mesTexto: {
      fontWeight: "700",
      color: cores.INK,
    },

    mesButtonSelecionado: {
      backgroundColor: modoEscuro ? cores.LIMEBOTAO : ICON_INK,
      borderColor: modoEscuro ? cores.LIMEBOTAO : ICON_INK,
    },

    mesTextoSelecionado: {
      color: modoEscuro ? "#16181a" : "#ffffff",
    },

    previsaoBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 4,
      marginBottom: 12,
    },

    previsaoTexto: {
      fontSize: 12,
      fontWeight: "600",
      color: cores.GRAY,
    },

    iconeDivida: {
      width: 46,
      height: 46,
      borderRadius: 23,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 14,
      backgroundColor: modoEscuro ? cores.SUB_CARD : "#f2efff",
    },

    dividaDetalhes: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      marginTop: 2,
    },

    dividaSeparador: {
      marginHorizontal: 5,
      fontSize: 12,
      color: cores.GRAY,
    },

    dividaStatus: {
      fontSize: 12,
      fontWeight: "700",
    },

    statusPrevisto: {
      color: PURPLE,
    },

    statusPago: {
      color: LIME_DARK,
    },

    statusPendente: {
      color: PURPLE,
    },

    ordenacao: {
      alignSelf: "flex-end",
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 18,
      height: 42,
      marginBottom: 5,
    },

    ordenacaoTexto: {
      color: cores.GRAY,
      fontSize: 14,
      fontWeight: "700",
    },
  });
}
