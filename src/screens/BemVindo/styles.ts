import { StyleSheet } from "react-native";

import { LIME_DARK } from "../../theme/colors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 22,
  },

  logoArea: {
    alignItems: "center",
    marginBottom: 60,
  },

  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 30,
    backgroundColor: "#F7FDEB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
  },

  logo: {
    width: 70,
    height: 70,
  },

  titulo: {
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 8,
  },

  subtitulo: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },

  perfisArea: {
    gap: 12,
  },

  perfilButton: {
    minHeight: 78,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  avatarText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "900",
  },

  textArea: {
    flex: 1,
  },

  nome: {
    fontSize: 16,
    fontWeight: "800",
  },

  desc: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
  },

  check: {
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: LIME_DARK,
    alignItems: "center",
    justifyContent: "center",
  },

  botao: {
    height: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 26,
  },

  botaoTexto: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900",
  },
});
