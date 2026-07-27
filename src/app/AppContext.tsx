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

  adicionarTransacao: (transacao: Transacao) => Promise<void>;
  editarTransacao: (transacao: Transacao) => Promise<void>;
  excluirTransacao: (id: string) => Promise<void>;
  carregarTransacoes: () => Promise<void>;

  adicionarSalario: (salario: NovoSalario) => Promise<void>;
  editarSalario: (id: string, salario: NovoSalario) => Promise<void>;
  excluirSalario: (id: string) => Promise<void>;

  adicionarDivida: (divida: NovaDivida) => Promise<void>;
  editarDivida: (id: string, divida: NovaDivida) => Promise<void>;
  excluirDivida: (id: string) => Promise<void>;
  alterarStatusDivida: (id: string, ativa: boolean) => Promise<void>;
  carregarDividas: () => Promise<void>;

  alterarStatusOcorrencia: (
    id: string,
    status: StatusOcorrenciaDivida,
  ) => Promise<void>;
  carregarOcorrenciasDividas: () => Promise<void>;

  competenciaAtual: string;

  totalEntradasMes: number;
  totalSaidasMes: number;
  totalDividasMes: number;
  saldoDisponivelMes: number;

  // Compatibilidade com as telas atuais: agora são mensais.
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

function obterCompetenciaAtual() {
  const agora = new Date();

  return (
    `${agora.getFullYear()}-` +
    `${String(agora.getMonth() + 1).padStart(2, "0")}`
  );
}

function calcularNumeroParcela(inicio: string, competencia: string) {
  const inicioNormalizado = normalizarCompetencia(inicio);
  const competenciaNormalizada = normalizarCompetencia(competencia);

  if (!inicioNormalizado || !competenciaNormalizada) {
    return null;
  }

  const [anoInicio, mesInicio] = inicioNormalizado.split("-").map(Number);
  const [anoCompetencia, mesCompetencia] = competenciaNormalizada
    .split("-")
    .map(Number);

  return (anoCompetencia - anoInicio) * 12 + (mesCompetencia - mesInicio) + 1;
}

function montarVencimento(competencia: string, dia?: number) {
  if (dia == null || Number.isNaN(Number(dia))) {
    return "";
  }

  const [ano, mes] = competencia.split("-").map(Number);

  if (!ano || !mes) {
    return "";
  }

  const ultimoDia = new Date(ano, mes, 0).getDate();
  const diaFinal = Math.min(Math.max(Number(dia), 1), ultimoDia);

  return (
    `${ano}-` +
    `${String(mes).padStart(2, "0")}-` +
    `${String(diaFinal).padStart(2, "0")}`
  );
}

function criarOcorrenciaTemporaria(
  divida: Divida,
  competencia: string,
): OcorrenciaDivida | null {
  const inicio = normalizarCompetencia(divida.inicio);

  if (!inicio || competencia < inicio || !divida.ativa) {
    return null;
  }

  let numeroParcela: number | undefined;
  let status: StatusOcorrenciaDivida = "pendente";

  if (divida.tipo === "parcelada") {
    const totalParcelas = Number(divida.parcelas || 0);
    const numero = calcularNumeroParcela(divida.inicio, competencia);

    if (!numero || numero < 1 || numero > totalParcelas) {
      return null;
    }

    numeroParcela = numero;

    if (numero <= Number(divida.parcelasPagas || 0)) {
      status = "pago";
    }
  }

  const agora = new Date().toISOString();

  return {
    id: gerarIdTemporario("DOC"),
    dividaId: divida.id,
    competencia,
    numeroParcela,
    status,
    vencimento: montarVencimento(competencia, divida.vencimento),
    pagoEm: "",
    criadoEm: agora,
    atualizadoEm: agora,
  };
}

// ==========================================================
// Provider
// ==========================================================

export function AppProvider({ children, perfilInicial }: Props) {
  const [salarios, setSalarios] = useState<Salario[]>([]);
  const [dividas, setDividas] = useState<Divida[]>([]);
  const [ocorrenciasDividas, setOcorrenciasDividas] = useState<
    OcorrenciaDivida[]
  >([]);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [cofrinho, setCofrinho] = useState(cofrinhoInicial ?? 0);

  const [perfilAtual, setPerfilAtual] = useState<PerfilUsuario>(perfilInicial);
  const [modoEscuro, setModoEscuro] = useState(false);
  const [carregando, setCarregando] = useState(true);

  const competenciaAtual = obterCompetenciaAtual();

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

  const editarTransacao = useCallback(
    async (transacao: Transacao) => {
      const anterior = transacoes.find((item) => item.id === transacao.id);

      if (!anterior) {
        throw new Error("Movimentação não encontrada.");
      }

      // Uma transação temporária ainda está sendo criada no backend.
      if (transacao.id.includes("TEMP_")) {
        return;
      }

      const otimista: Transacao = {
        ...anterior,
        ...transacao,
        responsavel: transacao.responsavel ?? anterior.responsavel ?? perfilAtual.id,
        atualizadoEm: new Date().toISOString(),
      };

      // Atualiza lista, totais e saldo imediatamente.
      setTransacoes((prev) =>
        prev.map((item) => (item.id === otimista.id ? otimista : item)),
      );

      try {
        const atualizada = await FinanceService.editarTransacao(otimista);

        setTransacoes((prev) =>
          prev.map((item) =>
            item.id === otimista.id ? atualizada : item,
          ),
        );
      } catch (error) {
        // Rollback
        setTransacoes((prev) =>
          prev.map((item) =>
            item.id === anterior.id ? anterior : item,
          ),
        );

        console.error("Erro ao editar movimentação:", error);
        throw error;
      }
    },
    [transacoes, perfilAtual],
  );

  const excluirTransacao = useCallback(
    async (id: string) => {
      const anterior = transacoes.find((item) => item.id === id);

      if (!anterior) {
        return;
      }

      // Evita DELETE de um registro que ainda não existe no backend.
      if (id.includes("TEMP_")) {
        return;
      }

      // Remove imediatamente da interface e recalcula os totais.
      setTransacoes((prev) => prev.filter((item) => item.id !== id));

      try {
        await FinanceService.excluirTransacao(id);
      } catch (error) {
        // Rollback sem duplicar o registro.
        setTransacoes((prev) => {
          if (prev.some((item) => item.id === id)) {
            return prev;
          }

          return [...prev, anterior];
        });

        console.error("Erro ao excluir movimentação:", error);
        throw error;
      }
    },
    [transacoes],
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

  const editarSalario = useCallback(
    async (id: string, dados: NovoSalario) => {
      const anterior = salarios.find((item) => item.id === id);

      if (!anterior) {
        throw new Error("Salário não encontrado.");
      }

      if (id.startsWith("TEMP_")) {
        return;
      }

      const otimista: Salario = {
        ...anterior,
        ...dados,
        id,
        responsavel: dados.responsavel ?? perfilAtual.id,
        atualizadoEm: new Date().toISOString(),
      };

      // UI e totais mensais mudam antes da rede.
      setSalarios((prev) =>
        prev.map((item) => (item.id === id ? otimista : item)),
      );

      try {
        const atualizado = await FinanceService.editarSalario(otimista);

        setSalarios((prev) =>
          prev.map((item) => (item.id === id ? atualizado : item)),
        );
      } catch (error) {
        // Rollback
        setSalarios((prev) =>
          prev.map((item) => (item.id === id ? anterior : item)),
        );

        console.error("Erro ao editar salário:", error);
        throw error;
      }
    },
    [salarios, perfilAtual],
  );

  const excluirSalario = useCallback(
    async (id: string) => {
      const anterior = salarios.find((item) => item.id === id);

      if (!anterior) {
        return;
      }

      /*
       * Um item temporário ainda está sendo criado no backend.
       * Evitamos enviar DELETE para um ID que não existe no Sheets.
       */
      if (id.startsWith("TEMP_")) {
        return;
      }

      // Some da interface e recalcula o saldo imediatamente.
      setSalarios((prev) => prev.filter((item) => item.id !== id));

      try {
        await FinanceService.excluirSalario(id);
      } catch (error) {
        // Rollback sem duplicar.
        setSalarios((prev) => {
          if (prev.some((item) => item.id === id)) {
            return prev;
          }

          return [...prev, anterior];
        });

        console.error("Erro ao excluir salário:", error);
        throw error;
      }
    },
    [salarios],
  );

  // ==========================================================
  // Dívidas
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

  const adicionarDivida = useCallback(
    async (divida: NovaDivida) => {
      const idTemporario = gerarIdTemporario("DBT");

      const totalParcelas = Number(divida.parcelas || 0);
      const parcelasPagas = Number(divida.parcelasPagas || 0);

      const ativaOtimista =
        divida.tipo === "parcelada" &&
        totalParcelas > 0 &&
        parcelasPagas >= totalParcelas
          ? false
          : divida.ativa;

      const agora = new Date().toISOString();

      const temporaria: Divida = {
        ...divida,
        id: idTemporario,
        ativa: ativaOtimista,
        responsavel: perfilAtual.id,
        criadoEm: agora,
        atualizadoEm: agora,
      };

      const ocorrenciaTemporaria = criarOcorrenciaTemporaria(
        temporaria,
        competenciaAtual,
      );

      // UI imediata
      setDividas((prev) => [...prev, temporaria]);

      if (ocorrenciaTemporaria) {
        setOcorrenciasDividas((prev) => [...prev, ocorrenciaTemporaria]);
      }

      try {
        const criada = await FinanceService.criarDivida({
          ...divida,
          responsavel: perfilAtual.id,
        });

        setDividas((prev) =>
          prev.map((item) => (item.id === idTemporario ? criada : item)),
        );

        /*
         * Mantém a ocorrência otimista ligada à dívida quando o backend
         * troca o ID temporário pelo ID definitivo.
         *
         * Assim Fluxo de Caixa e Saldo disponível continuam atualizados
         * sem esperar uma nova leitura do Google Sheets.
         */
        setOcorrenciasDividas((prev) =>
          prev.map((item) =>
            item.dividaId === idTemporario
              ? {
                  ...item,
                  dividaId: criada.id,
                }
              : item,
          ),
        );

        // Garante a ocorrência do mês da dívida recém-criada.
        await FinanceService.garantirOcorrenciasMes(competenciaAtual);

        const listaOcorrencias =
          await FinanceService.listarOcorrenciasDividas();

        setOcorrenciasDividas(listaOcorrencias ?? []);
      } catch (error) {
        setDividas((prev) => prev.filter((item) => item.id !== idTemporario));

        setOcorrenciasDividas((prev) =>
          prev.filter(
            (item) =>
              item.dividaId !== idTemporario &&
              item.id !== ocorrenciaTemporaria?.id,
          ),
        );

        console.error("Erro ao adicionar dívida:", error);
        throw error;
      }
    },
    [competenciaAtual, perfilAtual],
  );

  const editarDivida = useCallback(
    async (id: string, dados: NovaDivida) => {
      const anterior = dividas.find((item) => item.id === id);

      if (!anterior) {
        throw new Error("Dívida não encontrada.");
      }

      const otimista: Divida = {
        ...anterior,
        nome: dados.nome,
        valor: dados.valor,
        vencimento: dados.vencimento,
        ativa: dados.ativa,
        responsavel: perfilAtual.id,
        atualizadoEm: new Date().toISOString(),
      };

      setDividas((prev) =>
        prev.map((item) => (item.id === id ? otimista : item)),
      );

      try {
        const atualizada = await FinanceService.editarDivida({
          ...anterior,
          nome: dados.nome,
          valor: dados.valor,
          vencimento: dados.vencimento,
          ativa: dados.ativa,
          responsavel: perfilAtual.id,
        });

        setDividas((prev) =>
          prev.map((item) => (item.id === id ? atualizada : item)),
        );
      } catch (error) {
        setDividas((prev) =>
          prev.map((item) => (item.id === id ? anterior : item)),
        );

        console.error("Erro ao editar dívida:", error);
        throw error;
      }
    },
    [dividas, perfilAtual],
  );

  const excluirDivida = useCallback(
    async (id: string) => {
      const dividaAnterior = dividas.find((item) => item.id === id);

      if (!dividaAnterior) {
        return;
      }

      // Dívida temporária ainda não existe no banco.
      if (id.includes("_TEMP_")) {
        return;
      }

      const ocorrenciasAnteriores = ocorrenciasDividas.filter(
        (item) => item.dividaId === id,
      );

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

  const alterarStatusDivida = useCallback(
    async (id: string, ativa: boolean) => {
      const anterior = dividas.find((item) => item.id === id);

      if (!anterior) {
        throw new Error("Dívida não encontrada.");
      }

      if (id.includes("_TEMP_")) {
        return;
      }

      setDividas((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ativa } : item)),
      );

      try {
        const atualizada = await FinanceService.editarDivida({
          ...anterior,
          ativa,
        });

        setDividas((prev) =>
          prev.map((item) => (item.id === id ? atualizada : item)),
        );
      } catch (error) {
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
  // Ocorrências
  // ==========================================================

  const carregarOcorrenciasDividas = useCallback(async () => {
    try {
      const lista = await FinanceService.listarOcorrenciasDividas();
      setOcorrenciasDividas(lista ?? []);
    } catch (error) {
      console.error("Erro ao carregar ocorrências das dívidas:", error);
    }
  }, []);

  const alterarStatusOcorrencia = useCallback(
    async (id: string, status: StatusOcorrenciaDivida) => {
      const ocorrenciaAnterior = ocorrenciasDividas.find(
        (item) => item.id === id,
      );

      if (!ocorrenciaAnterior) {
        throw new Error("Ocorrência da dívida não encontrada.");
      }

      if (ocorrenciaAnterior.status === status) {
        return;
      }

      const agora = new Date().toISOString();

      const ocorrenciaOtimista: OcorrenciaDivida = {
        ...ocorrenciaAnterior,
        status,
        pagoEm: status === "pago" ? agora : "",
        atualizadoEm: agora,
      };

      const divida = dividas.find(
        (item) => item.id === ocorrenciaAnterior.dividaId,
      );

      const dividaAnterior = divida ? { ...divida } : undefined;

      setOcorrenciasDividas((prev) =>
        prev.map((item) => (item.id === id ? ocorrenciaOtimista : item)),
      );

      // Atualiza parcelasPagas imediatamente sem perder
      // o histórico inicial já registrado no backend.
      if (divida && divida.tipo === "parcelada") {
        const totalParcelas = Number(divida.parcelas || 0);
        const atualPagas = Number(divida.parcelasPagas || 0);

        let novasPagas = atualPagas;

        if (ocorrenciaAnterior.status !== "pago" && status === "pago") {
          novasPagas++;
        }

        if (ocorrenciaAnterior.status === "pago" && status !== "pago") {
          novasPagas--;
        }

        novasPagas = Math.max(0, Math.min(novasPagas, totalParcelas));

        const quitada = totalParcelas > 0 && novasPagas >= totalParcelas;

        setDividas((prev) =>
          prev.map((item) =>
            item.id === divida.id
              ? {
                  ...item,
                  parcelasPagas: novasPagas,
                  ativa: !quitada,
                }
              : item,
          ),
        );
      }

      try {
        const atualizada =
          await FinanceService.atualizarOcorrenciaDivida(ocorrenciaOtimista);

        setOcorrenciasDividas((prev) =>
          prev.map((item) => (item.id === id ? atualizada : item)),
        );

        // Backend executa syncDebtProgress().
        const listaDividas = await FinanceService.listarDividas();

        const dividasValidas = (listaDividas ?? []).filter(
          (item: Divida) =>
            Boolean(item.id) &&
            item.valor != null &&
            !Number.isNaN(Number(item.valor)),
        );

        setDividas(dividasValidas);
      } catch (error) {
        setOcorrenciasDividas((prev) =>
          prev.map((item) => (item.id === id ? ocorrenciaAnterior : item)),
        );

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

        // Cria as ocorrências da competência atual.
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

        setModoEscuro(Boolean(tema));

        const transacoesValidas = (listaTransacoes ?? []).filter(
          (transacao: Transacao) =>
            Boolean(transacao.id) &&
            transacao.valor != null &&
            !Number.isNaN(Number(transacao.valor)),
        );

        setTransacoes(transacoesValidas);

        const salariosValidos = (listaSalarios ?? []).filter(
          (salario: Salario) =>
            Boolean(salario.id) &&
            salario.valor != null &&
            !Number.isNaN(Number(salario.valor)),
        );

        setSalarios(salariosValidos);

        const dividasValidas = (listaDividas ?? []).filter(
          (divida: Divida) =>
            Boolean(divida.id) &&
            divida.valor != null &&
            !Number.isNaN(Number(divida.valor)),
        );

        setDividas(dividasValidas);
        setOcorrenciasDividas(listaOcorrencias ?? []);
      } catch (error) {
        console.error("Erro ao iniciar aplicativo:", error);
      } finally {
        setCarregando(false);
      }
    }

    iniciar();
  }, [competenciaAtual]);

  // ==========================================================
  // Dados da competência atual
  // ==========================================================

  const salariosMesAtual = useMemo(
    () =>
      salarios.filter(
        (salario) => normalizarCompetencia(salario.data) === competenciaAtual,
      ),
    [salarios, competenciaAtual],
  );

  const transacoesMesAtual = useMemo(
    () =>
      transacoes.filter(
        (transacao) =>
          normalizarCompetencia(transacao.data) === competenciaAtual,
      ),
    [transacoes, competenciaAtual],
  );

  const ocorrenciasMesAtual = useMemo(
    () =>
      ocorrenciasDividas.filter(
        (ocorrencia) =>
          normalizarCompetencia(ocorrencia.competencia) === competenciaAtual,
      ),
    [ocorrenciasDividas, competenciaAtual],
  );

  // ==========================================================
  // Totais mensais
  // ==========================================================

  const totalEntradasMes = useMemo(() => {
    return salariosMesAtual.reduce(
      (soma, salario) => soma + Number(salario.valor || 0),
      0,
    );
  }, [salariosMesAtual]);

  const totalSaidasMes = useMemo(() => {
    return Math.abs(
      transacoesMesAtual
        .filter((transacao) => transacao.tipo === "saida")
        .reduce((soma, transacao) => soma + Number(transacao.valor || 0), 0),
    );
  }, [transacoesMesAtual]);

  const totalDividasMes = useMemo(() => {
    /*
     * A ocorrência determina se a dívida pertence ao mês.
     * Pago ou pendente entram igualmente no saldo.
     *
     * O Set evita contabilizar duas vezes uma ocorrência antiga
     * duplicada para a mesma dívida/competência.
     */
    const idsContabilizados = new Set<string>();

    return ocorrenciasMesAtual.reduce((soma, ocorrencia) => {
      if (idsContabilizados.has(ocorrencia.dividaId)) {
        return soma;
      }

      const divida = dividas.find((item) => item.id === ocorrencia.dividaId);

      if (!divida) {
        return soma;
      }

      idsContabilizados.add(ocorrencia.dividaId);

      return soma + Number(divida.valor || 0);
    }, 0);
  }, [ocorrenciasMesAtual, dividas]);

  const saldoDisponivelMes =
    totalEntradasMes - totalSaidasMes - totalDividasMes;

  // ==========================================================
  // Compatibilidade com telas atuais
  // ==========================================================

  const totalEntradas = totalEntradasMes;
  const totalSaidas = totalSaidasMes;
  const totalDividas = totalDividasMes;
  const saldoDisponivel = saldoDisponivelMes;

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
      editarTransacao,
      excluirTransacao,
      carregarTransacoes,

      adicionarSalario,
      editarSalario,
      excluirSalario,

      adicionarDivida,
      editarDivida,
      excluirDivida,
      alterarStatusDivida,
      carregarDividas,

      alterarStatusOcorrencia,
      carregarOcorrenciasDividas,

      competenciaAtual,

      totalEntradasMes,
      totalSaidasMes,
      totalDividasMes,
      saldoDisponivelMes,

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
      editarTransacao,
      excluirTransacao,
      carregarTransacoes,

      adicionarSalario,
      editarSalario,
      excluirSalario,

      adicionarDivida,
      editarDivida,
      excluirDivida,
      alterarStatusDivida,
      carregarDividas,

      alterarStatusOcorrencia,
      carregarOcorrenciasDividas,

      competenciaAtual,

      totalEntradasMes,
      totalSaidasMes,
      totalDividasMes,
      saldoDisponivelMes,

      totalEntradas,
      totalSaidas,
      totalDividas,
      saldoDisponivel,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}