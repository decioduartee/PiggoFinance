import {
  CardStyleInterpolators,
  TransitionPresets,
} from "@react-navigation/stack";

export const defaultScreenOptions = {
  ...TransitionPresets.SlideFromRightIOS,
  headerShown: false,
  gestureEnabled: true,
  detachPreviousScreen: false,
  cardStyleInterpolator:
    CardStyleInterpolators.forHorizontalIOS,
  cardStyle: {
    backgroundColor: "#F3F2EE",
  },
};