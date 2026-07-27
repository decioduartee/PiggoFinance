import React, {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { cofrinhoInicial } from "../data/mockData";
import { buscarModoEscuro, salvarModoEscuro } from "../features/tema";
import { PerfilUsuario, salvarPerfilUsuario } from "../features/perfil";
import type {
  NovoSalario,
  Salario,
  NovaDivida,
  Divida,
  Transacao,
  OcorrenciaDivida,
  StatusOcorrenciaDivida,
} from "../features/financas";
import {
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
  ocorrenciasDividas: OcorrenciaDivida[];
  transacoes: Transacao[];
  cofrinho: number;

  carregando: boolean;

  setSalarios: React.Dispatch<React.SetStateAction<Salario[]>>;

  setDividas: React.Dispatch<React.SetStateAction<Divida[]>>;

  setOcorrenciasDividas: React.Dispatch<
    React.SetStateAction<OcorrenciaDivida[]>
  >;

  setCofrinho: React.Dispatch<React.SetStateAction<number>>;

  modoEscuro: boolean;

  alterarModoEscuro: (ativo: boolean) => Promise<void>;

  // ========================================================
  // Transações
  // ========================================================

  adicionarTransacao: (transacao: Transacao) => Promise<void>;

  carregarTransacoes: () => Promise<void>;

  // ========================================================
  // Salários
  // ========================================================

  adicionarSalario: (salario: NovoSalario) => Promise<void>;

  // ========================================================
  // Dívidas
  // ========================================================

  adicionarDivida: (divida: NovaDivida) => Promise<void>;

  editarDivida: (id: string, divida: NovaDivida) => Promise<void>;

  excluirDivida: (id: string) => Promise<void>;

  alterarStatusDivida: (id: string, ativa: boolean) => Promise<void>;

  carregarDividas: () => Promise<void>;

  // ========================================================
  // Ocorrências
  // ========================================================

  alterarStatusOcorrencia: (
    id: string,
    status: StatusOcorrenciaDivida,
  ) => Promise<void>;

  carregarOcorrenciasDividas: () => Promise<void>;

  // ========================================================
  // Totais
  // ========================================================

  totalEntradas: number;
  totalSaidas: number;
  totalDividas: number;
  saldoDisponivel: number;

  // ========================================================
  // Perfil
  // ========================================================

  perfilAtual: PerfilUsuario;

  trocarPerfil: (perfil: PerfilUsuario) => Promise<void>;
};

// ==========================================================
// Context
// ==========================================================

export const AppContext = createContext<AppContextData>({} as AppContextData);

type Props = {
  children: ReactNode;
  perfilInicial: PerfilUsuario;
};

// ==========================================================
// Helpers
// ==========================================================

function gerarIdTemporario(prefixo: string) {
  return (
    `${prefixo}_TEMP_` +
    `${Date.now()}_` +
    `${Math.random().toString(16).slice(2, 8)}`
  );
}

function normalizarCompetencia(valor?: string) {
  if (!valor) {
    return "";
  }

  const match = String(valor).match(/^(\d{4})-(\d{2})/);

  if (!match) {
    return "";
  }

  return `${match[1]}-${match[2]}`;
}

// ==========================================================
// Provider
// ==========================================================

export function AppProvider({ children, perfilInicial }: Props) {
  // ========================================================
  // Dados financeiros
  // ========================================================

  const [salarios, setSalarios] = useState<Salario[]>([]);

  const [dividas, setDividas] = useState<Divida[]>([]);

  const [ocorrenciasDividas, setOcorrenciasDividas] = useState<
    OcorrenciaDivida[]
  >([]);

  const [transacoes, setTransacoes] = useState<Transacao[]>([]);

  const [cofrinho, setCofrinho] = useState(cofrinhoInicial ?? 0);

  // ========================================================
  // Aplicativo
  // ========================================================

  const [perfilAtual, setPerfilAtual] = useState<PerfilUsuario>(perfilInicial);

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

        await adicionarTransacaoOptimistic(transacaoCompleta, setTransacoes);
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

        await adicionarSalarioOptimistic(salarioCompleto, setSalarios);
      } catch (error) {
        console.error("Erro ao adicionar salário:", error);
      }
    },
    [perfilAtual],
  );

  // ==========================================================
  // Carregar dívidas
  // ==========================================================

  const carregarDividas = useCallback(async () => {
    try {
      const lista = await FinanceService.listarDividas();

      const dividasValidas = (lista ?? []).filter(
        (divida: Divida) =>
          Boolean(divida.id) &&
          divida.valor != null &&
          !Number.isNaN(Number(divida.valor)),
      );

      setDividas(dividasValidas);
    } catch (error) {
      console.error("Erro ao carregar dívidas:", error);
    }
  }, []);

  // ==========================================================
  // Adicionar dívida - OPTIMISTIC
  // ==========================================================

  const adicionarDivida = useCallback(
    async (divida: NovaDivida) => {
      const idTemporario = gerarIdTemporario("DBT");

      const temporaria: Divida = {
        ...divida,

        id: idTemporario,

        responsavel: perfilAtual.id,

        criadoEm: new Date().toISOString(),

        atualizadoEm: new Date().toISOString(),
      };

      // ----------------------------------------------------
      // 1. Mostra imediatamente
      // ----------------------------------------------------

      setDividas((prev) => [...prev, temporaria]);

      try {
        // --------------------------------------------------
        // 2. Envia para backend
        // --------------------------------------------------

        const criada = await FinanceService.criarDivida({
          ...divida,

          responsavel: perfilAtual.id,
        });

        // --------------------------------------------------
        // 3. Troca temporária pela oficial
        // --------------------------------------------------

        setDividas((prev) =>
          prev.map((item) => (item.id === idTemporario ? criada : item)),
        );

        /*
         * O backend pode ter criado automaticamente
         * ocorrências históricas.
         *
         * Exemplo:
         *
         * 12 parcelas
         * 4 pagas
         *
         * Por isso sincronizamos somente as ocorrências
         * depois da criação.
         */

        const listaOcorrencias =
          await FinanceService.listarOcorrenciasDividas();

        setOcorrenciasDividas(listaOcorrencias ?? []);
      } catch (error) {
        // --------------------------------------------------
        // 4. Rollback
        // --------------------------------------------------

        setDividas((prev) => prev.filter((item) => item.id !== idTemporario));

        console.error("Erro ao adicionar dívida:", error);

        throw error;
      }
    },
    [perfilAtual],
  );

  // ==========================================================
  // Editar dívida - OPTIMISTIC
  // ==========================================================

  const editarDivida = useCallback(
    async (id: string, dados: NovaDivida) => {
      const anterior = dividas.find((item) => item.id === id);

      if (!anterior) {
        throw new Error("Dívida não encontrada.");
      }

      /*
       * O backend protege:
       *
       * tipo
       * parcelas
       * parcelasPagas
       * inicio
       *
       * Mesmo que estejam no objeto enviado,
       * eles não serão alterados.
       */

      const otimista: Divida = {
        ...anterior,

        nome: dados.nome,

        valor: dados.valor,

        vencimento: dados.vencimento,

        ativa: dados.ativa,

        responsavel: perfilAtual.id,

        atualizadoEm: new Date().toISOString(),
      };

      // ----------------------------------------------------
      // 1. Atualiza imediatamente
      // ----------------------------------------------------

      setDividas((prev) =>
        prev.map((item) => (item.id === id ? otimista : item)),
      );

      try {
        // --------------------------------------------------
        // 2. Backend
        // --------------------------------------------------

        const atualizada = await FinanceService.editarDivida({
          ...anterior,

          nome: dados.nome,

          valor: dados.valor,

          vencimento: dados.vencimento,

          ativa: dados.ativa,

          responsavel: perfilAtual.id,
        });

        // --------------------------------------------------
        // 3. Registro oficial
        // --------------------------------------------------

        setDividas((prev) =>
          prev.map((item) => (item.id === id ? atualizada : item)),
        );
      } catch (error) {
        // --------------------------------------------------
        // 4. Rollback
        // --------------------------------------------------

        setDividas((prev) =>
          prev.map((item) => (item.id === id ? anterior : item)),
        );

        console.error("Erro ao editar dívida:", error);

        throw error;
      }
    },
    [dividas, perfilAtual],
  );

  // ==========================================================
  // Excluir dívida - OPTIMISTIC
  // ==========================================================

  const excluirDivida = useCallback(
    async (id: string) => {
      const dividaAnterior = dividas.find((item) => item.id === id);

      if (!dividaAnterior) {
        return;
      }

      /*
       * Guardamos também as ocorrências,
       * porque o backend faz exclusão em cascata.
       */

      const ocorrenciasAnteriores = ocorrenciasDividas.filter(
        (item) => item.dividaId === id,
      );

      // ----------------------------------------------------
      // 1. Remove imediatamente
      // ----------------------------------------------------

      setDividas((prev) => prev.filter((item) => item.id !== id));

      setOcorrenciasDividas((prev) =>
        prev.filter((item) => item.dividaId !== id),
      );

      try {

        await FinanceService.excluirDivida(id);
      } catch (error) {
        setDividas((prev) => {
          if (prev.some((item) => item.id === id)) {
            return prev;
          }

          return [...prev, dividaAnterior];
        });

        setOcorrenciasDividas((prev) => {
          const idsExistentes = new Set(prev.map((item) => item.id));

          const restaurar = ocorrenciasAnteriores.filter(
            (item) => !idsExistentes.has(item.id),
          );

          return [...prev, ...restaurar];
        });

        console.error("Erro ao excluir dívida:", error);

        throw error;
      }
    },
    [dividas, ocorrenciasDividas],
  );

  // ==========================================================
  // Ativar / desativar dívida - OPTIMISTIC
  // ==========================================================

  const alterarStatusDivida = useCallback(
    async (id: string, ativa: boolean) => {
      const anterior = dividas.find((item) => item.id === id);

      if (!anterior) {
        throw new Error("Dívida não encontrada.");
      }

      // ----------------------------------------------------
      // 1. Atualiza imediatamente
      // ----------------------------------------------------

      setDividas((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                ativa,
              }
            : item,
        ),
      );

      try {
        // --------------------------------------------------
        // 2. Backend
        // --------------------------------------------------

        const atualizada = await FinanceService.editarDivida({
          ...anterior,
          ativa,
        });

        // --------------------------------------------------
        // 3. Registro oficial
        // --------------------------------------------------

        setDividas((prev) =>
          prev.map((item) => (item.id === id ? atualizada : item)),
        );
      } catch (error) {
        // --------------------------------------------------
        // 4. Rollback
        // --------------------------------------------------

        setDividas((prev) =>
          prev.map((item) => (item.id === id ? anterior : item)),
        );

        console.error("Erro ao alterar status da dívida:", error);

        throw error;
      }
    },
    [dividas],
  );

  // ==========================================================
  // Carregar ocorrências
  // ==========================================================

  const carregarOcorrenciasDividas = useCallback(async () => {
    try {
      const lista = await FinanceService.listarOcorrenciasDividas();

      setOcorrenciasDividas(lista ?? []);
    } catch (error) {
      console.error("Erro ao carregar ocorrências das dívidas:", error);
    }
  }, []);

  // ==========================================================
  // Alterar ocorrência - OPTIMISTIC
  // ==========================================================

  const alterarStatusOcorrencia = useCallback(
    async (id: string, status: StatusOcorrenciaDivida) => {
      const ocorrenciaAnterior = ocorrenciasDividas.find(
        (item) => item.id === id,
      );

      if (!ocorrenciaAnterior) {
        throw new Error("Ocorrência da dívida não encontrada.");
      }

      const agora = new Date().toISOString();

      const ocorrenciaOtimista: OcorrenciaDivida = {
        ...ocorrenciaAnterior,

        status,

        pagoEm: status === "pago" ? agora : "",

        atualizadoEm: agora,
      };

      // ----------------------------------------------------
      // Descobre dívida relacionada
      // ----------------------------------------------------

      const divida = dividas.find(
        (item) => item.id === ocorrenciaAnterior.dividaId,
      );

      /*
       * Guardamos a dívida anterior para rollback.
       */
      const dividaAnterior = divida ? { ...divida } : undefined;

      // ----------------------------------------------------
      // 1. Atualiza ocorrência imediatamente
      // ----------------------------------------------------

      setOcorrenciasDividas((prev) =>
        prev.map((item) => (item.id === id ? ocorrenciaOtimista : item)),
      );

      // ----------------------------------------------------
      // 2. Atualiza parcelasPagas imediatamente
      // ----------------------------------------------------

      if (divida && divida.tipo === "parcelada") {
        /*
         * Em vez de simplesmente +1/-1,
         * contamos as ocorrências considerando
         * o novo status.
         *
         * Isso é mais seguro se o usuário alterar
         * uma parcela antiga.
         */

        const ocorrenciasDaDivida = ocorrenciasDividas
          .filter((item) => item.dividaId === divida.id)
          .map((item) => (item.id === id ? ocorrenciaOtimista : item));

        const quantidadePagas = ocorrenciasDaDivida.filter(
          (item) => item.status === "pago",
        ).length;

        const totalParcelas = Number(divida.parcelas || 0);

        const quitada = totalParcelas > 0 && quantidadePagas >= totalParcelas;

        setDividas((prev) =>
          prev.map((item) =>
            item.id === divida.id
              ? {
                  ...item,

                  parcelasPagas: quantidadePagas,

                  /*
                   * 12/12:
                   * desativa imediatamente.
                   *
                   * Se voltar uma ocorrência
                   * para pendente:
                   * reativa imediatamente.
                   */
                  ativa: !quitada,
                }
              : item,
          ),
        );
      }

      try {
        // --------------------------------------------------
        // 3. Backend
        // --------------------------------------------------

        const atualizada =
          await FinanceService.atualizarOcorrenciaDivida(ocorrenciaOtimista);

        // --------------------------------------------------
        // 4. Registro oficial da ocorrência
        // --------------------------------------------------

        setOcorrenciasDividas((prev) =>
          prev.map((item) => (item.id === id ? atualizada : item)),
        );

        /*
         * O backend executa syncDebtProgress().
         *
         * Buscamos somente as dívidas novamente
         * para pegar o estado oficial:
         *
         * parcelasPagas
         * ativa
         */

        const listaDividas = await FinanceService.listarDividas();

        const dividasValidas = (listaDividas ?? []).filter(
          (item: Divida) =>
            Boolean(item.id) &&
            item.valor != null &&
            !Number.isNaN(Number(item.valor)),
        );

        setDividas(dividasValidas);
      } catch (error) {
        // --------------------------------------------------
        // 5. Rollback ocorrência
        // --------------------------------------------------

        setOcorrenciasDividas((prev) =>
          prev.map((item) => (item.id === id ? ocorrenciaAnterior : item)),
        );

        // --------------------------------------------------
        // 6. Rollback dívida
        // --------------------------------------------------

        if (dividaAnterior) {
          setDividas((prev) =>
            prev.map((item) =>
              item.id === dividaAnterior.id ? dividaAnterior : item,
            ),
          );
        }

        console.error("Erro ao alterar status da ocorrência:", error);

        throw error;
      }
    },
    [dividas, ocorrenciasDividas],
  );

  // ==========================================================
  // Inicialização
  // ==========================================================

  useEffect(() => {
    async function iniciar() {
      try {
        setCarregando(true);

        /*
         * Antes de buscar as ocorrências,
         * garantimos que as ocorrências
         * do mês atual existam.
         */

        const agora = new Date();

        const competenciaAtual =
          `${agora.getFullYear()}-` +
          `${String(agora.getMonth() + 1).padStart(2, "0")}`;

        await FinanceService.garantirOcorrenciasMes(competenciaAtual);

        const [
          tema,
          listaTransacoes,
          listaSalarios,
          listaDividas,
          listaOcorrencias,
        ] = await Promise.all([
          buscarModoEscuro(),

          FinanceService.listarTransacoes(),

          FinanceService.listarSalarios(),

          FinanceService.listarDividas(),

          FinanceService.listarOcorrenciasDividas(),
        ]);

        // ----------------------------------------------------
        // Tema
        // ----------------------------------------------------

        setModoEscuro(Boolean(tema));

        // ----------------------------------------------------
        // Transações
        // ----------------------------------------------------

        const transacoesValidas = (listaTransacoes ?? []).filter(
          (transacao: Transacao) =>
            Boolean(transacao.id) &&
            transacao.valor != null &&
            !Number.isNaN(Number(transacao.valor)),
        );

        setTransacoes(transacoesValidas);

        // ----------------------------------------------------
        // Salários
        // ----------------------------------------------------

        const salariosValidos = (listaSalarios ?? []).filter(
          (salario: Salario) =>
            Boolean(salario.id) &&
            salario.valor != null &&
            !Number.isNaN(Number(salario.valor)),
        );

        setSalarios(salariosValidos);

        // ----------------------------------------------------
        // Dívidas
        // ----------------------------------------------------

        const dividasValidas = (listaDividas ?? []).filter(
          (divida: Divida) =>
            Boolean(divida.id) &&
            divida.valor != null &&
            !Number.isNaN(Number(divida.valor)),
        );

        setDividas(dividasValidas);

        // ----------------------------------------------------
        // Ocorrências
        // ----------------------------------------------------

        setOcorrenciasDividas(listaOcorrencias ?? []);
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
    return salarios.reduce(
      (soma, salario) => soma + Number(salario.valor || 0),
      0,
    );
  }, [salarios]);

  const totalSaidas = useMemo(() => {
    return Math.abs(
      transacoes
        .filter((transacao) => transacao.tipo === "saida")
        .reduce((soma, transacao) => soma + Number(transacao.valor || 0), 0),
    );
  }, [transacoes]);

  const totalDividas = useMemo(() => {
    return dividas
      .filter((divida) => divida.ativa)
      .reduce((soma, divida) => soma + Number(divida.valor || 0), 0);
  }, [dividas]);

  const saldoDisponivel = totalEntradas - totalSaidas - totalDividas;

  // ==========================================================
  // Context
  // ==========================================================

  const value = useMemo<AppContextData>(
    () => ({
      salarios,
      dividas,
      ocorrenciasDividas,
      transacoes,
      cofrinho,

      carregando,

      perfilAtual,
      trocarPerfil,

      setSalarios,
      setDividas,
      setOcorrenciasDividas,
      setCofrinho,

      modoEscuro,
      alterarModoEscuro,

      adicionarTransacao,
      adicionarSalario,

      adicionarDivida,
      editarDivida,
      excluirDivida,
      alterarStatusDivida,

      alterarStatusOcorrencia,

      carregarTransacoes,
      carregarDividas,
      carregarOcorrenciasDividas,

      totalEntradas,
      totalSaidas,
      totalDividas,
      saldoDisponivel,
    }),
    [
      salarios,
      dividas,
      ocorrenciasDividas,
      transacoes,
      cofrinho,

      carregando,

      perfilAtual,
      trocarPerfil,

      modoEscuro,
      alterarModoEscuro,

      adicionarTransacao,
      adicionarSalario,

      adicionarDivida,
      editarDivida,
      excluirDivida,
      alterarStatusDivida,

      alterarStatusOcorrencia,

      carregarTransacoes,
      carregarDividas,
      carregarOcorrenciasDividas,

      totalEntradas,
      totalSaidas,
      totalDividas,
      saldoDisponivel,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
