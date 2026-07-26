import React, {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  dividas as dividasMock,
  cofrinhoInicial,
} from "../data/mockData";

import { buscarModoEscuro, salvarModoEscuro } from "../features/tema";
import {
  PerfilUsuario,
  salvarPerfilUsuario,
} from "../features/perfil";

import {
  NovoSalario,
  Salario,
  Divida,
  Transacao,
  FinanceService,
  adicionarTransacaoOptimistic,
  adicionarSalarioOptimistic,
} from "../features/financas";

// ==========================================================
// Tipos
// ==========================================================

type AppContextData = {
  salarios: Salario[];
  dividas: Divida[];
  transacoes: Transacao[];
  cofrinho: number;

  carregando: boolean;

  setSalarios: React.Dispatch<React.SetStateAction<Salario[]>>;
  setDividas: React.Dispatch<React.SetStateAction<Divida[]>>;
  setCofrinho: React.Dispatch<React.SetStateAction<number>>;

  modoEscuro: boolean;
  alterarModoEscuro: (ativo: boolean) => Promise<void>;

  adicionarTransacao: (transacao: Transacao) => Promise<void>;
  adicionarSalario: (salario: NovoSalario) => Promise<void>;
  carregarTransacoes: () => Promise<void>;

  totalEntradas: number;
  totalSaidas: number;
  totalDividas: number;
  saldoDisponivel: number;

  perfilAtual: PerfilUsuario;
  trocarPerfil: (perfil: PerfilUsuario) => Promise<void>;
};

export const AppContext = createContext<AppContextData>(
  {} as AppContextData,
);

type Props = {
  children: ReactNode;
  perfilInicial: PerfilUsuario;
};

// ==========================================================
// Provider
// ==========================================================

export function AppProvider({ children, perfilInicial }: Props) {
  /*
   * Salários e transações não utilizam mais mock.
   * Eles começam vazios e são carregados pelo Google Sheets.
   *
   * Dívidas e cofrinho continuam utilizando mock temporariamente.
   */

  const [salarios, setSalarios] = useState<Salario[]>([]);

  const [dividas, setDividas] = useState<Divida[]>(
    dividasMock ?? [],
  );

  const [transacoes, setTransacoes] = useState<Transacao[]>([]);

  const [cofrinho, setCofrinho] = useState(
    cofrinhoInicial ?? 0,
  );

  const [perfilAtual, setPerfilAtual] =
    useState<PerfilUsuario>(perfilInicial);

  const [modoEscuro, setModoEscuro] = useState(false);

  const [carregando, setCarregando] = useState(true);

  // ==========================================================
  // Tema
  // ==========================================================

  const alterarModoEscuro = useCallback(async (ativo: boolean) => {
    try {
      await salvarModoEscuro(ativo);

      setModoEscuro(ativo);
    } catch (error) {
      console.error("Erro ao salvar tema:", error);
    }
  }, []);

  // ==========================================================
  // Perfil
  // ==========================================================

  const trocarPerfil = useCallback(
    async (perfil: PerfilUsuario) => {
      try {
        await salvarPerfilUsuario(perfil.id);

        setPerfilAtual(perfil);
      } catch (error) {
        console.error("Erro ao trocar perfil:", error);
      }
    },
    [],
  );

  // ==========================================================
  // Transações
  // ==========================================================

  const carregarTransacoes = useCallback(async () => {
    try {
      const lista = await FinanceService.listarTransacoes();

      const transacoesValidas = (lista ?? []).filter(
        (transacao: Transacao) =>
          Boolean(transacao.id) &&
          transacao.valor != null &&
          !Number.isNaN(Number(transacao.valor)),
      );

      setTransacoes(transacoesValidas);
    } catch (error) {
      console.error("Erro ao carregar transações:", error);
    }
  }, []);

  const adicionarTransacao = useCallback(
    async (transacao: Transacao) => {
      try {
        const transacaoCompleta: Transacao = {
          ...transacao,
          responsavel: perfilAtual.id,
        };

        await adicionarTransacaoOptimistic(
          transacaoCompleta,
          setTransacoes,
        );
      } catch (error) {
        console.error("Erro ao adicionar transação:", error);
      }
    },
    [perfilAtual],
  );

  // ==========================================================
  // Salários
  // ==========================================================

  const adicionarSalario = useCallback(
    async (salario: NovoSalario) => {
      try {
        const salarioCompleto: NovoSalario = {
          ...salario,
          responsavel: perfilAtual.id,
        };

        await adicionarSalarioOptimistic(
          salarioCompleto,
          setSalarios,
        );
      } catch (error) {
        console.error("Erro ao adicionar salário:", error);
      }
    },
    [perfilAtual],
  );

  // ==========================================================
  // Inicialização
  // ==========================================================

  useEffect(() => {
    async function iniciar() {
      try {
        setCarregando(true);

        const [
          tema,
          listaTransacoes,
          listaSalarios,
        ] = await Promise.all([
          buscarModoEscuro(),
          FinanceService.listarTransacoes(),
          FinanceService.listarSalarios(),
        ]);

        // ------------------------------------------------------
        // Tema
        // ------------------------------------------------------

        setModoEscuro(Boolean(tema));

        // ------------------------------------------------------
        // Transações
        // ------------------------------------------------------

        const transacoesValidas = (
          listaTransacoes ?? []
        ).filter(
          (transacao: Transacao) =>
            Boolean(transacao.id) &&
            transacao.valor != null &&
            !Number.isNaN(Number(transacao.valor)),
        );

        setTransacoes(transacoesValidas);

        // ------------------------------------------------------
        // Salários
        // ------------------------------------------------------

        const salariosValidos = (
          listaSalarios ?? []
        ).filter(
          (salario: Salario) =>
            Boolean(salario.id) &&
            salario.valor != null &&
            !Number.isNaN(Number(salario.valor)),
        );

        setSalarios(salariosValidos);

        /*
         * Futuramente, quando Dívidas Fixas e Cofrinho
         * estiverem integrados ao Google Sheets:
         *
         * const [
         *   tema,
         *   listaTransacoes,
         *   listaSalarios,
         *   listaDividas,
         *   dadosCofrinho,
         * ] = await Promise.all([
         *   buscarModoEscuro(),
         *   FinanceService.listarTransacoes(),
         *   FinanceService.listarSalarios(),
         *   FinanceService.listarDividas(),
         *   FinanceService.listarCofrinho(),
         * ]);
         *
         * setModoEscuro(Boolean(tema));
         * setTransacoes(listaTransacoes ?? []);
         * setSalarios(listaSalarios ?? []);
         * setDividas(listaDividas ?? []);
         * setCofrinho(dadosCofrinho ?? 0);
         */
      } catch (error) {
        console.error(
          "Erro ao iniciar aplicativo:",
          error,
        );
      } finally {
        setCarregando(false);
      }
    }

    iniciar();
  }, []);

  // ==========================================================
  // Totais
  // ==========================================================

  const totalEntradas = useMemo(() => {
    return salarios.reduce(
      (soma, salario) =>
        soma + Number(salario.valor || 0),
      0,
    );
  }, [salarios]);

  const totalSaidas = useMemo(() => {
    return Math.abs(
      transacoes
        .filter(
          (transacao) => transacao.tipo === "saida",
        )
        .reduce(
          (soma, transacao) =>
            soma + Number(transacao.valor || 0),
          0,
        ),
    );
  }, [transacoes]);

  const totalDividas = useMemo(() => {
    return dividas
      .filter((divida) => divida.ativa)
      .reduce(
        (soma, divida) =>
          soma + Number(divida.valor || 0),
        0,
      );
  }, [dividas]);

  const saldoDisponivel =
    totalEntradas -
    totalSaidas -
    totalDividas;

  // ==========================================================
  // Context
  // ==========================================================

  const value = useMemo<AppContextData>(
    () => ({
      salarios,
      dividas,
      transacoes,
      cofrinho,

      carregando,

      perfilAtual,
      trocarPerfil,

      setSalarios,
      setDividas,
      setCofrinho,

      modoEscuro,
      alterarModoEscuro,

      adicionarTransacao,
      adicionarSalario,
      carregarTransacoes,

      totalEntradas,
      totalSaidas,
      totalDividas,
      saldoDisponivel,
    }),
    [
      salarios,
      dividas,
      transacoes,
      cofrinho,

      carregando,

      perfilAtual,
      trocarPerfil,

      modoEscuro,
      alterarModoEscuro,

      adicionarTransacao,
      adicionarSalario,
      carregarTransacoes,

      totalEntradas,
      totalSaidas,
      totalDividas,
      saldoDisponivel,
    ],
  );

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}