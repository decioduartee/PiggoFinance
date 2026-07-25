import { useContext } from "react";

import { AppContext } from "./AppContext";

import LoadingScreen from "../screens/Login";
import AppNavigator from "../navigation/AppNavigator";

export default function AppContent() {
  const { carregando } = useContext(AppContext);

  if (carregando) {
    return <LoadingScreen />;
  }

  return <AppNavigator />;
}
