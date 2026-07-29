import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    position: "relative",
    maxWidth: "100%",
  },

  shrink: {
    alignSelf: "flex-start",
  },

  texto: {
    flexShrink: 1,
  },

  blur: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 4,
    overflow: "hidden",
  },
});
