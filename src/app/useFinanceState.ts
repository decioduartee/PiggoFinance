import { useCallback, useMemo, useState } from "react";
import { cofrinhoInicial } from "../data/mockData";
import type { PerfilUsuario } from "../features/perfil/perfis";
import type {
  Divida,
  NovaDivida,
  NovoSalario,
  OcorrenciaDivida,
  Salario,
  StatusOcorrenciaDivida,
  Transacao,
} from "../features/financas/types";
import { FinanceService } from "../features/financas/financas.service";
import {
  adicionarSalarioOptimistic,
  adicionarTransacaoOptimistic,
} from "../features/financas/financas.store";
import { gerarIdTemporario, obterCompetenciaAtual } from "../features/financas/competencia";
import { criarOcorrenciaTemporaria } from "../features/financas/ocorrencias";
import {
  calcularTotalDividasMes,
  calcularTotalEntradasMes,
  calcularTotalSaidasMes,
  filtrarOcorrenciasPorCompetencia,
  filtrarSalariosPorCompetencia,
  filtrarTransacoesPorCompetencia,
} from "../features/financas/totais";

function transacaoValida(transacao: Transacao) {
  return (
    Boolean(transacao.id) &&
    transacao.valor != null &&
    !Number.isNaN(Number(transacao.valor))
  );
}

function salarioValido(salario: Salario) {
  return (
    Boolean(salario.id) &&
    salario.valor != null &&
    !Number.isNaN(Number(salario.valor))
  );
}

function dividaValida(divida: Divida) {
  return (
    Boolean(divida.id) &&
    divida.valor != null &&
    !Number.isNaN(Number(divida.valor))
  );
}

export function useFinanceState(perfilAtual: PerfilUsuario) {
  const [salarios, setSalarios] = useState<Salario[]>([]);
  const [dividas, setDividas] = useState<Divida[]>([]);
  const [ocorrenciasDividas, setOcorrenciasDividas] = useState<
    OcorrenciaDivida[]
  >([]);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [cofrinho, setCofrinho] = useState(cofrinhoInicial ?? 0);

  const competenciaAtual = obterCompetenciaAtual();

  const carregarTransacoes = useCallback(async () => {
    try {
      const lista = await FinanceService.listarTransacoes();
      setTransacoes((lista ?? []).filter(transacaoValida));
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

      if (transacao.id.includes("TEMP_")) {
        return;
      }

      const otimista: Transacao = {
        ...anterior,
        ...transacao,
        responsavel:
          transacao.responsavel ?? anterior.responsavel ?? perfilAtual.id,
        atualizadoEm: new Date().toISOString(),
      };

      setTransacoes((prev) =>
        prev.map((item) => (item.id === otimista.id ? otimista : item)),
      );

      try {
        const atualizada = await FinanceService.editarTransacao(otimista);

        setTransacoes((prev) =>
          prev.map((item) => (item.id === otimista.id ? atualizada : item)),
        );
      } catch (error) {
        setTransacoes((prev) =>
          prev.map((item) => (item.id === anterior.id ? anterior : item)),
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

      if (id.includes("TEMP_")) {
        return;
      }

      setTransacoes((prev) => prev.filter((item) => item.id !== id));

      try {
        await FinanceService.excluirTransacao(id);
      } catch (error) {
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

      setSalarios((prev) =>
        prev.map((item) => (item.id === id ? otimista : item)),
      );

      try {
        const atualizado = await FinanceService.editarSalario(otimista);

        setSalarios((prev) =>
          prev.map((item) => (item.id === id ? atualizado : item)),
        );
      } catch (error) {
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

      if (id.startsWith("TEMP_")) {
        return;
      }

      setSalarios((prev) => prev.filter((item) => item.id !== id));

      try {
        await FinanceService.excluirSalario(id);
      } catch (error) {
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

  const carregarDividas = useCallback(async () => {
    try {
      const lista = await FinanceService.listarDividas();
      setDividas((lista ?? []).filter(dividaValida));
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

        const listaDividas = await FinanceService.listarDividas();
        setDividas((listaDividas ?? []).filter(dividaValida));
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

  const carregarDadosFinanceiros = useCallback(async () => {
    await FinanceService.garantirOcorrenciasMes(competenciaAtual);

    const [
      listaTransacoes,
      listaSalarios,
      listaDividas,
      listaOcorrencias,
    ] = await Promise.all([
      FinanceService.listarTransacoes(),
      FinanceService.listarSalarios(),
      FinanceService.listarDividas(),
      FinanceService.listarOcorrenciasDividas(),
    ]);

    setTransacoes((listaTransacoes ?? []).filter(transacaoValida));
    setSalarios((listaSalarios ?? []).filter(salarioValido));
    setDividas((listaDividas ?? []).filter(dividaValida));
    setOcorrenciasDividas(listaOcorrencias ?? []);
  }, [competenciaAtual]);

  const salariosMesAtual = useMemo(
    () => filtrarSalariosPorCompetencia(salarios, competenciaAtual),
    [salarios, competenciaAtual],
  );

  const transacoesMesAtual = useMemo(
    () => filtrarTransacoesPorCompetencia(transacoes, competenciaAtual),
    [transacoes, competenciaAtual],
  );

  const ocorrenciasMesAtual = useMemo(
    () =>
      filtrarOcorrenciasPorCompetencia(
        ocorrenciasDividas,
        competenciaAtual,
      ),
    [ocorrenciasDividas, competenciaAtual],
  );

  const totalEntradasMes = useMemo(
    () => calcularTotalEntradasMes(salariosMesAtual),
    [salariosMesAtual],
  );

  const totalSaidasMes = useMemo(
    () => calcularTotalSaidasMes(transacoesMesAtual),
    [transacoesMesAtual],
  );

  const totalDividasMes = useMemo(
    () => calcularTotalDividasMes(ocorrenciasMesAtual, dividas),
    [ocorrenciasMesAtual, dividas],
  );

  const saldoDisponivelMes =
    totalEntradasMes - totalSaidasMes - totalDividasMes;

  return {
    salarios,
    dividas,
    ocorrenciasDividas,
    transacoes,
    cofrinho,

    setSalarios,
    setDividas,
    setOcorrenciasDividas,
    setCofrinho,

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
    carregarDadosFinanceiros,

    competenciaAtual,

    totalEntradasMes,
    totalSaidasMes,
    totalDividasMes,
    saldoDisponivelMes,

    totalEntradas: totalEntradasMes,
    totalSaidas: totalSaidasMes,
    totalDividas: totalDividasMes,
    saldoDisponivel: saldoDisponivelMes,
  };
}
