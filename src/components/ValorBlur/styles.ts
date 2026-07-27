import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    position: "relative",
  },

  texto: {
    flexShrink: 0,
  },

  blur: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 4,
    overflow: "hidden",
  },
});