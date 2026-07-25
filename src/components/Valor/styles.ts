import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    borderRadius: 5,
  },

  texto: {
    fontWeight: "800",
  },

  blur: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 5,
  },
});
