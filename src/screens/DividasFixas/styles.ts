import { StyleSheet } from "react-native";
import { CORAL, temaCores, PURPLE } from "../../theme/colors";

export function createStyles(modoEscuro: boolean) {
  const cores = temaCores(modoEscuro);

  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: cores.BG,
    },

    content: {
      padding: 18,
      paddingBottom: 40,
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

    backButton: {
      width: 80,
      height: 38,
      borderRadius: 21,
      flexDirection: "row",
      gap: 2,
      paddingRight: 5,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: cores.CARD,
      marginRight: 14,
    },

    tituloButton: {
      color: cores.INK,
      fontSize: 14,
    },

    olhoBotao: {
      width: 42,
      height: 42,
      borderRadius: 21,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: cores.CARD,
    },

    buscaBox: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: cores.CARD,
      borderRadius: 18,
      paddingHorizontal: 16,
      height: 54,
      marginBottom: 10,
    },

    buscaInput: {
      flex: 1,
      marginLeft: 10,
      fontSize: 15,
      color: cores.INK,
    },

    modoLista: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: cores.CARD,
      borderRadius: 18,
      padding: 4,
      marginBottom: 16,
    },

    modoListaBotao: {
      flex: 1,
      height: 38,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
    },

    modoListaBotaoAtivo: {
      backgroundColor: PURPLE,
    },

    modoListaTexto: {
      color: cores.GRAY,
      fontSize: 13,
      fontWeight: "800",
    },

    modoListaTextoAtivo: {
      color: "#fff",
    },

    resumo: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 14,
    },

    resumoCard: {
      flex: 1,
      backgroundColor: cores.CARD,
      borderRadius: 22,
      padding: 16,
    },

    resumoIcone: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 12,
    },

    resumoTitulo: {
      fontSize: 12,
      color: cores.GRAY,
      marginBottom: 4,
    },

    resumoValor: {
      fontSize: 18,
      fontWeight: "800",
    },

    ordenacao: {
      alignSelf: "flex-end",
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 18,
      height: 42,
      paddingHorizontal: 14,
      marginBottom: 12,
    },

    ordenacaoTexto: {
      color: cores.GRAY,
      fontSize: 14,
      fontWeight: "700",
    },

    grupo: {
      marginBottom: 8,
    },

    grupoTitulo: {
      fontSize: 14,
      fontWeight: "800",
      color: cores.GRAY,
      marginBottom: 10,
    },

    separadorCard: {
      height: 10,
    },

    card: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: cores.CARD,
      borderRadius: 18,
      paddingHorizontal: 14,
      paddingVertical: 16,
    },

    iconeDivida: {
      width: 46,
      height: 46,
      borderRadius: 23,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 14,
      backgroundColor: cores.SUB_CARD,
    },

    conteudoDivida: {
      flex: 1,
      justifyContent: "center",
      paddingRight: 12,
    },

    nomeDivida: {
      fontSize: 15,
      fontWeight: "700",
      color: cores.INK,
    },

    valorDivida: {
      marginTop: 4,
      fontSize: 18,
      fontWeight: "800",
      color: CORAL,
    },

    tipoDivida: {
      marginTop: 5,
      fontSize: 12,
      color: cores.GRAY,
    },

    statusButton: {
      minWidth: 88,
      height: 36,
      borderRadius: 18,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 16,
    },

    statusPagoBadge: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
    },

    statusButtonPendente: {
      backgroundColor: PURPLE,
    },

    statusButtonAtrasada: {
      backgroundColor: CORAL,
    },

    statusButtonInativa: {
      backgroundColor: cores.GRAY,
    },

    statusTexto: {
      fontSize: 13,
      fontWeight: "700",
    },

    vazio: {
      marginTop: 40,
      textAlign: "center",
      color: cores.GRAY,
      fontSize: 15,
    },
  });
}
