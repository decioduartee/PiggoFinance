import React, {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  salarios as salariosMock,
  dividas as dividasMock,
  cofrinhoInicial,
} from "../data/mockData";

import { buscarModoEscuro, salvarModoEscuro } from "../features/tema";
import { salvarPerfilUsuario } from "../features/perfil";

import { PerfilUsuario } from "../features/perfil";
import { NovoSalario, Salario, Divida, Transacao } from "../features/financas";

import { FinanceService } from "../features/financas";
import {
  adicionarTransacaoOptimistic,
  adicionarSalarioOptimistic,
} from "../features/financas";

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

export const AppContext = createContext<AppContextData>({} as AppContextData);

type Props = {
  children: ReactNode;
  perfilInicial: PerfilUsuario;
};

export function AppProvider({ children, perfilInicial }: Props) {
  const [salarios, setSalarios] = useState(salariosMock);
  const [dividas, setDividas] = useState(dividasMock);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [cofrinho, setCofrinho] = useState(cofrinhoInicial);

  const [perfilAtual, setPerfilAtual] = useState(perfilInicial);

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

  const trocarPerfil = useCallback(async (perfil: PerfilUsuario) => {
    try {
      await salvarPerfilUsuario(perfil.id);
      setPerfilAtual(perfil);
    } catch (error) {
      console.error("Erro ao trocar perfil:", error);
    }
  }, []);

  const carregarTransacoes = useCallback(async () => {
    try {
      const lista = await FinanceService.listarTransacoes();
      setTransacoes(lista);
    } catch (error) {
      console.error("Erro ao carregar transações:", error);
    }
  }, []);

  const adicionarSalario = useCallback(
    async (salario: NovoSalario) => {
      try {
        const salarioCompleto: NovoSalario = {
          ...salario,
          responsavel: perfilAtual.id,
        };

        await adicionarSalarioOptimistic(salarioCompleto, setSalarios);
      } catch (error) {
        console.error("Erro ao adicionar salário:", error);
      }
    },
    [perfilAtual],
  );

  const adicionarTransacao = useCallback(
    async (transacao: Transacao) => {
      try {
        const transacaoCompleta: Transacao = {
          ...transacao,
          responsavel: perfilAtual.id,
        };

        await adicionarTransacaoOptimistic(transacaoCompleta, setTransacoes);
      } catch (error) {
        console.error("Erro ao adicionar transação:", error);
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

        const [tema, listaTransacoes, listaSalarios] = await Promise.all([
          buscarModoEscuro(),
          FinanceService.listarTransacoes(),
          FinanceService.listarSalarios(),
        ]);

        setModoEscuro(tema);
        setTransacoes(
          listaTransacoes.filter(
            (t: Transacao) =>
              Boolean(t.id) &&
              t.valor != null &&
              !Number.isNaN(Number(t.valor)),
          ),
        );
        setSalarios(listaSalarios);

        /*
        Futuramente:

        const [
          tema,
          transacoes,
          salarios,
          dividas,
          cofrinho
        ] = await Promise.all([
          buscarModoEscuro(),
          FinanceService.listarTransacoes(),
          FinanceService.listarSalarios(),
          FinanceService.listarDividas(),
          FinanceService.listarCofrinho(),
        ]);

        setModoEscuro(tema);
        setTransacoes(transacoes);
        setSalarios(salarios);
        setDividas(dividas);
        setCofrinho(cofrinho);
        */
      } catch (error) {
        console.error("Erro ao iniciar aplicativo:", error);
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
    return salarios.reduce((soma, item) => soma + Number(item.valor || 0), 0);
  }, [salarios]);

  const totalSaidas = useMemo(() => {
    return Math.abs(
      transacoes
        .filter((t) => t.tipo === "saida")
        .reduce((soma, item) => soma + Number(item.valor || 0), 0),
    );
  }, [transacoes]);

  const totalDividas = useMemo(() => {
    return dividas
      .filter((d) => d.ativa)
      .reduce((soma, item) => soma + Number(item.valor || 0), 0);
  }, [dividas]);

  const saldoDisponivel = totalEntradas - totalSaidas - totalDividas;

  const value = useMemo(
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

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
