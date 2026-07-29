import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    width: "100%",
    overflow: "visible",
  },

  vazioContainer: {
    alignItems: "center",
    height: 190,
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  headerInfo: {
    flex: 1,
    paddingRight: 16,
  },

  eyebrow: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0,
    marginBottom: 6,
  },

  tituloLinha: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 4,
  },

  titulo: {
    fontSize: 19,
    fontWeight: "700",
    lineHeight: 24,
  },

  valorPill: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  valorPillTexto: {
    fontSize: 14,
    fontWeight: "800",
  },

  subtitulo: {
    fontSize: 12,
    lineHeight: 17,
  },

  iconeCard: {
    alignItems: "center",
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    width: 44,
  },

  chart: {
    marginLeft: -16,
    overflow: "visible",
  },

  labelMes: {
    fontSize: 8,
    fontWeight: "600",
    marginLeft: -6,
    textAlign: "center",
    width: 14,
  },

  legenda: {
    alignItems: "center",
    flexDirection: "row",
    columnGap: 18,
    rowGap: 8,
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 14,
  },

  legendaItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
  },

  legendaPonto: {
    borderRadius: 5,
    height: 10,
    width: 10,
  },

  legendaTitulo: {
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
  },

  vazio: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
  },
});
