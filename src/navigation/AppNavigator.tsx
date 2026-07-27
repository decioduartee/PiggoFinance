import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import Inicio from "../screens/Inicio";
import Historico from "../screens/Historico";
import { defaultScreenOptions } from "./options";

export type RootStackParamList = {
  Home: undefined;
  Historico: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={defaultScreenOptions}
      >
        <Stack.Screen
          name="Home"
          component={Inicio}
        />

        <Stack.Screen
          name="Historico"
          component={Historico}
          options={{
            gestureEnabled: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}