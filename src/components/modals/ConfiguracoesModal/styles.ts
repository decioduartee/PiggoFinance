import { StyleSheet } from "react-native";
import { LIME_DARK, temaCores } from "../../../theme/colors";

export const createStyles = (
  cores: ReturnType<typeof temaCores>,
  bottomInset = 0,
) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(0,0,0,0.35)",
    },

    backdrop: {
      ...StyleSheet.absoluteFillObject,
    },

    modal: {
      backgroundColor: cores.CARD,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingHorizontal: 22,
      paddingTop: 22,
      paddingBottom: Math.max(34, bottomInset + 22),
    },

    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 18,
    },

    titulo: {
      fontSize: 19,
      fontWeight: "700",
      color: cores.INK,
    },

    fecharButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      justifyContent: "center",
      alignItems: "center",
    },

    card: {
      backgroundColor: cores.CARD,
      borderRadius: 22,
      padding: 16,
      marginBottom: 16,

      shadowColor: "#000",
      shadowOpacity: 0.04,
      shadowRadius: 14,
      shadowOffset: {
        width: 0,
        height: 5,
      },

      elevation: 2,
    },

    linhaPrincipal: {
      flexDirection: "row",
      alignItems: "center",
    },

    avatar: {
      width: 52,
      height: 52,
      borderRadius: 26,
      justifyContent: "center",
      alignItems: "center",
    },

    avatarTexto: {
      color: "#FFF",
      fontSize: 24,
      fontWeight: "700",
    },

    textos: {
      flex: 1,
      marginLeft: 14,
    },

    cardTitulo: {
      fontSize: 16,
      fontWeight: "700",
      color: cores.INK,
    },

    cardSubtitulo: {
      fontSize: 14,
      color: cores.GRAY,
      marginTop: 2,
    },

    botaoSecundario: {
      height: 46,
      borderRadius: 16,
      paddingHorizontal: 18,
      backgroundColor: cores.BG,

      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },

    botaoSecundarioTexto: {
      marginLeft: 8,
      fontSize: 12,
      fontWeight: "600",
      color: cores.INK,
    },

    listaPerfis: {
      marginTop: 18,
    },

    perfilOpcao: {
      height: 74,
      borderRadius: 18,
      borderWidth: 1.5,
      borderColor: cores.LINE_DASH,
      backgroundColor: cores.CARD,

      paddingHorizontal: 18,

      flexDirection: "row",
      alignItems: "center",

      marginBottom: 12,
    },

    perfilOpcaoSelecionado: {
      borderColor: LIME_DARK,
      backgroundColor: cores.LIME_BG,
    },

    avatarOpcao: {
      width: 42,
      height: 42,
      borderRadius: 21,
      justifyContent: "center",
      alignItems: "center",
    },

    avatarOpcaoTexto: {
      color: "#FFF",
      fontWeight: "700",
      fontSize: 18,
    },

    perfilNome: {
      flex: 1,
      marginLeft: 16,

      fontSize: 18,
      fontWeight: "600",
      color: cores.INK,
    },

    iconeNeutro: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: cores.BG,

      justifyContent: "center",
      alignItems: "center",
    },

    textoExplicativo: {
      color: cores.GRAY,
      fontSize: 12,
      marginBottom: 20,
      paddingHorizontal: 6,
    },

    status: {
      marginTop: 3,
      fontSize: 12,
      fontWeight: "600",
    },

    statusSincronizado: {
      color: LIME_DARK,
    },

    statusPendente: {
      color: "#D48E18",
    },

    botaoDesabilitado: {
      opacity: 0.6,
    },
  });
