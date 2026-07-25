import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

type Props = {
  children: React.ReactNode;
  onEdit: () => void;
  onDelete: () => void;
};

const LIMITE = 90;

export default function SwipeAction({
  children,
  onEdit,
  onDelete,
}: Props) {
  const translateX = useSharedValue(0);

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = Math.max(
        -120,
        Math.min(120, event.translationX)
      );
    })
    .onEnd(() => {
      if (translateX.value > LIMITE) {
        runOnJS(onEdit)();
      }

      if (translateX.value < -LIMITE) {
        runOnJS(onDelete)();
      }

      translateX.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.background}>
        <Text style={styles.edit}>Editar</Text>
        <Text style={styles.delete}>Excluir</Text>
      </View>

      <GestureDetector gesture={pan}>
        <Animated.View style={animatedStyle}>
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: -2,
  },

  background: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 22,
  },

  edit: {
    color: "#7b6ff0",
    fontWeight: "800",
  },

  delete: {
    color: "#ff5c7a",
    fontWeight: "800",
  },
});