import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import type { PerfilUsuario } from "./src/features/perfil";
import { buscarPerfilUsuario } from "./src/features/perfil";

import { AppProvider } from "./src/app/AppContext";
import AppContent from "./src/app/AppContent";

import LoadingScreen from "./src/screens/Login";
import WelcomeScreen from "./src/screens/BemVindo";

import AsyncStorage from "@react-native-async-storage/async-storage";

export default function App() {
  //AsyncStorage.clear();

  const [carregando, setCarregando] = useState(true);
  const [perfilSalvo, setPerfilSalvo] = useState<PerfilUsuario | null>(null);

  useEffect(() => {
    async function iniciarApp() {
      try {
        setCarregando(true);

        const perfil = await buscarPerfilUsuario();

        setPerfilSalvo(perfil ?? null);
      } catch (error) {
        console.error("Erro ao iniciar o aplicativo:", error);
        setPerfilSalvo(null);
      } finally {
        setCarregando(false);
      }
    }

    iniciarApp();
  }, []);

  function concluirSelecaoPerfil(perfil: PerfilUsuario) {
    setPerfilSalvo(perfil);
  }

  if (carregando) {
    return <LoadingScreen />;
  }

  if (!perfilSalvo) {
    return <WelcomeScreen onPerfilSelecionado={concluirSelecaoPerfil} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider perfilInicial={perfilSalvo}>
        <AppContent />
      </AppProvider>
    </GestureHandlerRootView>
  );
}
