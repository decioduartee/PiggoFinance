import { useCallback, useState } from "react";
import { buscarModoEscuro, salvarModoEscuro } from "../features/tema";

export function useThemeState() {
  const [modoEscuro, setModoEscuro] = useState(false);

  const carregarTemaSalvo = useCallback(async () => {
    const tema = await buscarModoEscuro();
    setModoEscuro(Boolean(tema));
    return Boolean(tema);
  }, []);

  const alterarModoEscuro = useCallback(async (ativo: boolean) => {
    try {
      await salvarModoEscuro(ativo);
      setModoEscuro(ativo);
    } catch (error) {
      console.error("Erro ao salvar tema:", error);
    }
  }, []);

  return {
    modoEscuro,
    alterarModoEscuro,
    carregarTemaSalvo,
  };
}
