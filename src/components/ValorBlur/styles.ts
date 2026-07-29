import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    position: "relative",
    alignSelf: "flex-start",
    maxWidth: "100%",
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
