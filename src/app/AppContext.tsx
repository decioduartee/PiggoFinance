import React, {
  createContext,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { AppContextData } from "./AppContext.types";
import { useFinanceState } from "./useFinanceState";
import { useProfileState } from "./useProfileState";
import { useThemeState } from "./useThemeState";
import type { PerfilUsuario } from "../features/perfil";

export const AppContext = createContext<AppContextData>({} as AppContextData);

type Props = {
  children: ReactNode;
  perfilInicial: PerfilUsuario;
};

export function AppProvider({ children, perfilInicial }: Props) {
  const [carregando, setCarregando] = useState(true);

  const themeState = useThemeState();
  const profileState = useProfileState(perfilInicial);
  const financeState = useFinanceState(profileState.perfilAtual);

  useEffect(() => {
    async function iniciar() {
      try {
        setCarregando(true);

        await Promise.all([
          themeState.carregarTemaSalvo(),
          financeState.carregarDadosFinanceiros(),
        ]);
      } catch (error) {
        console.error("Erro ao iniciar aplicativo:", error);
      } finally {
        setCarregando(false);
      }
    }

    iniciar();
  }, [themeState.carregarTemaSalvo, financeState.carregarDadosFinanceiros]);

  const value = useMemo<AppContextData>(
    () => ({
      ...financeState,
      carregando,
      modoEscuro: themeState.modoEscuro,
      alterarModoEscuro: themeState.alterarModoEscuro,
      perfilAtual: profileState.perfilAtual,
      trocarPerfil: profileState.trocarPerfil,
    }),
    [
      financeState,
      carregando,
      themeState.modoEscuro,
      themeState.alterarModoEscuro,
      profileState.perfilAtual,
      profileState.trocarPerfil,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
