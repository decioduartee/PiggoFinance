import { useCallback, useState } from "react";
import type { PerfilUsuario } from "../features/perfil/perfis";
import { salvarPerfilUsuario } from "../features/perfil/perfilStorage";

export function useProfileState(perfilInicial: PerfilUsuario) {
  const [perfilAtual, setPerfilAtual] = useState<PerfilUsuario>(perfilInicial);

  const trocarPerfil = useCallback(async (perfil: PerfilUsuario) => {
    try {
      await salvarPerfilUsuario(perfil.id);
      setPerfilAtual(perfil);
    } catch (error) {
      console.error("Erro ao trocar perfil:", error);
    }
  }, []);

  return {
    perfilAtual,
    trocarPerfil,
  };
}
