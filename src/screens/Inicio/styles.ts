import { StyleSheet } from "react-native";
import { ICON_INK } from "../../theme/colors";

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 18,
  },

  header: {
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerBoasVindas: {
    paddingTop: 70,
    marginBottom: 20,
  },

  ola: {
    fontSize: 15,
    fontWeight: "600",
  },

  subtitulo: {
    marginTop: 2,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 22 * 1.1,
  },

  headerActions: {
    position: "absolute",
    marginTop: -60,
    flexDirection: "row",
    right: 0,
    gap: 8,
  },

  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },

  topRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },

  cardHalf: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 24,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 18,
    minHeight: 150,
    elevation: 2,
  },

  rowBetweenTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },

  pigIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  fluxoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  cardLabel: {
    fontSize: 13,
    color: "#8b8f94",
    fontWeight: "500",
    marginBottom: 4,
  },

  cardValue: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 4,
  },

  miniRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },

  miniValue: {
    fontSize: 13,
    fontWeight: "700",
  },

  miniLabel: {
    fontSize: 11,
    color: "#8b8f94",
    fontWeight: "500",
  },

  barras: {
    gap: 4,
    marginTop: 10,
  },

  barra: {
    height: 5,
    borderRadius: 4,
  },

  saldoBox: {
    backgroundColor: "#edf7e6",
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  saldoIcone: {
    width: 42,
    height: 42,
    borderRadius: 999,
    backgroundColor: "#7ed957",
    alignItems: "center",
    justifyContent: "center",
  },

  saldoLabel: {
    fontSize: 12,
    color: "#5a7d52",
    fontWeight: "500",
    marginBottom: 2,
  },

  saldoValor: {
    fontSize: 20,
    fontWeight: "800",
  },

  gastosBox: {
    backgroundColor: "#f2f0eb",
    borderRadius: 24,
    paddingTop: 18,
    paddingHorizontal: 18,
    paddingBottom: 14,
    marginBottom: 14,
  },

  gastosHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },

  sectionLabel: {
    fontSize: 13,
    color: "#8b8f94",
    fontWeight: "500",
  },

  botaoGasto: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: ICON_INK,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },

  botaoGastoTexto: {
    fontSize: 12.5,
    color: "#ffff",
    fontWeight: "700",
  },

  gastosNumero: {
    fontSize: 32,
    fontWeight: "900",
    lineHeight: 34,
    marginBottom: 10,
  },

  gastosDescricao: {
    fontSize: 12.5,
    color: "#8b8f94",
    textAlign: "center",
    marginBottom: 14,
  },

  transacaoCard: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  icone: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  transacaoInfo: {
    flex: 1,
    minWidth: 0,
  },

  transacaoNome: {
    fontSize: 13,
    fontWeight: "700",
  },

  transacaoSub: {
    fontSize: 11,
    color: "#8b8f94",
  },

  transacaoValor: {
    fontSize: 13.5,
    fontWeight: "700",
  },

  verTodas: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 4,
  },

  verTodasTexto: {
    fontSize: 13.5,
    color: "#8b8f94",
    fontWeight: "700",
  },

  dividasCard: {
    borderRadius: 24,
    paddingTop: 18,
    paddingHorizontal: 18,
    paddingBottom: 14,
    marginBottom: 14,
  },

  dividasHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  dividasTitulo: {
    fontSize: 13,
    color: "#8b8f94",
    fontWeight: "500",
  },

  dividasContador: {
    fontSize: 12,
    fontWeight: "400",
  },

  // MESMO PADRÃO DO transacaoCard
  dividaItem: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  // EXATAMENTE O MESMO DO icone
  dividaIcone: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  // MESMO DO transacaoInfo
  dividaConteudo: {
    flex: 1,
    minWidth: 0,
  },

  // MESMO DO transacaoNome
  dividaNome: {
    fontSize: 13,
    fontWeight: "700",
  },

  // MESMO DO transacaoSub
  dividaValor: {
    fontSize: 11,
    fontWeight: "400",
  },

  dividaStatus: {
    minWidth: 76,
    height: 30,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  dividaStatusPago: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  dividaStatusTexto: {
    fontSize: 11,
    fontWeight: "600",
  },

  // MESMO CONCEITO DO verTodas
  verMaisDividas: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 4,
  },

  // MESMO DO verTodasTexto
  verMaisDividasTexto: {
    fontSize: 13.5,
    fontWeight: "700",
  },

  graficoBox: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    paddingTop: 18,
    paddingHorizontal: 18,
    paddingBottom: 14,
    marginBottom: 10,
    overflow: "hidden",
  },

  vazio: {
    textAlign: "center",
    fontSize: 13,
    paddingVertical: 20,
  },

  grupo: {
    marginBottom: 5,
  },

  grupoTitulo: {
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 10,
  },

  transacaoLinha: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
});
