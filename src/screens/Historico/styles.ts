import { StyleSheet } from "react-native";
import { LIME_DARK, ICON_INK } from "../../theme/colors";

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fafaf8",
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
    color: "#16181a",
  },

  subtitulo: {
    marginTop: 2,
    fontSize: 13,
    color: "#8b8f94",
    marginBottom: 25,
  },

  olhoBotao: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ececec",
  },

  olhoTexto: {
    fontWeight: "700",
    color: "#16181a",
  },

  buscaBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingHorizontal: 16,
    height: 54,
    borderWidth: 1,
    borderColor: "#ececec",
    marginBottom: 10,
  },

  buscaInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: "#16181a",
  },

  resumo: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 5,
  },

  resumoCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ececec",
  },

  resumoIconeEntrada: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#eefbe9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  resumoIconeSaida: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ffecef",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  resumoLabel: {
    fontSize: 12,
    color: "#8b8f94",
    marginBottom: 4,
  },

  resumoValor: {
    fontSize: 18,
    fontWeight: "800",
  },

  grupo: {
    marginBottom: 22,
  },

  grupoTitulo: {
    fontSize: 14,
    fontWeight: "800",
    color: "#8b8f94",
    marginBottom: 10,
  },

  linha: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#efefef",
  },

  icone: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  info: {
    flex: 1,
  },

  nome: {
    fontSize: 15,
    fontWeight: "700",
    color: "#16181a",
  },

  categoria: {
    marginTop: 2,
    fontSize: 12,
    color: "#8b8f94",
  },

  valor: {
    fontSize: 15,
    fontWeight: "800",
    marginRight: 14,
  },

  deleteButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#fff4f5",
    justifyContent: "center",
    alignItems: "center",
  },

  vazio: {
    marginTop: 40,
    textAlign: "center",
    color: "#8b8f94",
    fontSize: 15,
  },

  editButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#f2efff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  //
  backButton: {
    width: 80,
    height: 38,
    borderRadius: 21,
    flexDirection: "row",
    gap: 2,
    paddingRight: 5,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    borderWidth: 1,
    borderColor: "#ececec",
  },

  tituloButton: {
    color: ICON_INK,
    fontSize: 14,
  },

  meses: {
    flexDirection: "row",
    marginBottom: 10,
  },

  mesButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#ececec",
  },

  mesTexto: {
    fontWeight: "700",
    color: "#16181a",
  },

  mesButtonSelecionado: {
    backgroundColor: ICON_INK,
    borderColor: ICON_INK,
  },

  mesTextoSelecionado: {
    color: "#fff",
  },

  ordenacao: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    height: 42,
    marginBottom: 5,
  },

  ordenacaoTexto: {
    color: "#8b8f94",
    fontSize: 14,
    fontWeight: "700",
  },
});
