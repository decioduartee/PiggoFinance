import { useMemo } from "react";

import type {
  Divida,
  OcorrenciaDivida,
  Salario,
  Transacao,
} from "../features/financas/types";
import {
  criarOcorrenciaTemporaria,
  dividaPertenceCompetencia,
  obterStatusOcorrencia,
  valorOcorrenciaDivida,
} from "../features/financas/ocorrencias";
import { normalizarCompetencia } from "../features/financas/competencia";
import { filtrarSalariosPorCompetencia } from "../features/financas/totais";
import {
  dataLocalISO,
  getMesAtualKey,
  normalizarDataISO,
} from "../utils/formatadores";

export interface GraficoSaldoItem {
  label: string;
  data: string;
  dataFormatada: string;
  gastoDia: number;
  dividaPagaDia: number;
  saldo: number;
  gastos: number;
  dividasPagas: number;
}

function formatarDataGrafico(data: Date) {
  const dia = data.getDate();

  return `Dia ${dia}`;
}

function deveMostrarDia(
  dia: number,
  ultimoDia: number,
  teveGasto: boolean,
  teveDivida: boolean,
) {
  return dia === 1 || dia === ultimoDia || teveGasto || teveDivida;
}

export default function useGraficoSaldo(
  salarios: Salario[],
  transacoes: Transacao[],
  dividas: Divida[],
  ocorrenciasDividas: OcorrenciaDivida[],
  competenciaAtual?: string,
) {
  return useMemo(() => {
    const hoje = new Date();
    const competenciaReal = getMesAtualKey();
    const chaveMesAtual =
      normalizarCompetencia(competenciaAtual) || competenciaReal;
    const [anoAtual, mesAtualNumero] = chaveMesAtual.split("-").map(Number);
    const mesAtual = Math.max(0, (mesAtualNumero || 1) - 1);
    const ultimoDiaMes = new Date(anoAtual, mesAtual + 1, 0).getDate();
    const diaReferencia =
      chaveMesAtual === competenciaReal ? hoje.getDate() : ultimoDiaMes;
    const salarioMes = filtrarSalariosPorCompetencia(
      salarios,
      chaveMesAtual,
    )
      .reduce((soma, item) => {
        const valor = Number(item.valor);

        return Number.isNaN(valor) ? soma : soma + valor;
      }, 0);

    const transacoesValidas = transacoes.filter(
      (t) =>
        t?.data &&
        t.tipo === "saida" &&
        normalizarDataISO(t.data).slice(0, 7) === chaveMesAtual &&
        !Number.isNaN(Number(t.valor)),
    );

    const gastosPorData = transacoesValidas.reduce((mapa, item) => {
      const data = normalizarDataISO(item.data);

      if (!data) {
        return mapa;
      }

      const valorAtual = mapa.get(data) ?? 0;

      mapa.set(data, valorAtual + Math.abs(Number(item.valor)));

      return mapa;
    }, new Map<string, number>());

    const dividasPorId = new Map(dividas.map((divida) => [divida.id, divida]));
    const ocorrenciasReais = ocorrenciasDividas.filter(
      (ocorrencia) =>
        normalizarCompetencia(ocorrencia.competencia) === chaveMesAtual,
    );
    const dividasComOcorrenciaReal = new Set(
      ocorrenciasReais.map((ocorrencia) => ocorrencia.dividaId),
    );
    const ocorrenciasProjetadas = dividas
      .filter(
        (divida) =>
          !dividasComOcorrenciaReal.has(divida.id) &&
          dividaPertenceCompetencia(divida, chaveMesAtual),
      )
      .map((divida) => criarOcorrenciaTemporaria(divida, chaveMesAtual))
      .filter((ocorrencia): ocorrencia is OcorrenciaDivida =>
        Boolean(ocorrencia),
      );
    const ocorrenciasDoMes = [...ocorrenciasReais, ...ocorrenciasProjetadas];

    const dividasDoMesPorData = ocorrenciasDoMes.reduce((mapa, ocorrencia) => {
      const divida = dividasPorId.get(ocorrencia.dividaId);

      if (!divida || divida.ativa === false) {
        return mapa;
      }

      const status = obterStatusOcorrencia(ocorrencia);
      const dataBase =
        status === "pago" && ocorrencia.pagoEm
          ? normalizarDataISO(ocorrencia.pagoEm)
          : normalizarDataISO(ocorrencia.vencimento) ||
            `${chaveMesAtual}-01`;

      if (dataBase.slice(0, 7) !== chaveMesAtual) {
        return mapa;
      }

      const valorAtual = mapa.get(dataBase) ?? 0;
      mapa.set(dataBase, valorAtual + valorOcorrenciaDivida(ocorrencia, divida));

      return mapa;
    }, new Map<string, number>());

    const dividasPagasPorData = ocorrenciasDoMes.reduce((mapa, ocorrencia) => {
      if (obterStatusOcorrencia(ocorrencia) !== "pago" || !ocorrencia.pagoEm) {
        return mapa;
      }

      const dataPagamento = normalizarDataISO(ocorrencia.pagoEm);

      if (dataPagamento.slice(0, 7) !== chaveMesAtual) {
        return mapa;
      }

      const divida = dividasPorId.get(ocorrencia.dividaId);

      if (!divida) {
        return mapa;
      }

      const valorAtual = mapa.get(dataPagamento) ?? 0;
      mapa.set(
        dataPagamento,
        valorAtual + valorOcorrenciaDivida(ocorrencia, divida),
      );

      return mapa;
    }, new Map<string, number>());

    const totalGastos = Array.from(gastosPorData.values()).reduce(
      (soma, valor) => soma + valor,
      0,
    );

    const totalDividasPagas = Array.from(dividasPagasPorData.values()).reduce(
      (soma, valor) => soma + valor,
      0,
    );
    const totalDividasMes = Array.from(dividasDoMesPorData.values()).reduce(
      (soma, valor) => soma + valor,
      0,
    );

    if (
      salarioMes <= 0 &&
      totalGastos <= 0 &&
      totalDividasMes <= 0 &&
      totalDividasPagas <= 0
    ) {
      return [];
    }

    const ultimoDiaComGasto = transacoesValidas.reduce((maiorDia, item) => {
      const dia = Number(normalizarDataISO(item.data).slice(8, 10));

      if (Number.isNaN(dia)) {
        return maiorDia;
      }

      return Math.max(maiorDia, dia);
    }, 0);

    const ultimoDiaComDividaPaga = Array.from(dividasPagasPorData.keys()).reduce(
      (maiorDia, data) => {
        const dia = Number(data.slice(8, 10));

        if (Number.isNaN(dia)) {
          return maiorDia;
        }

        return Math.max(maiorDia, dia);
      },
      0,
    );

    const ultimoDiaComDividaMes = Array.from(dividasDoMesPorData.keys()).reduce(
      (maiorDia, data) => {
        const dia = Number(data.slice(8, 10));

        if (Number.isNaN(dia)) {
          return maiorDia;
        }

        return Math.max(maiorDia, dia);
      },
      0,
    );

    const ultimoDia = Math.max(
      ultimoDiaComGasto,
      ultimoDiaComDividaMes,
      ultimoDiaComDividaPaga,
      salarioMes > 0 ? diaReferencia : 0,
      ultimoDiaMes,
    );

    if (ultimoDia <= 0) {
      return [];
    }

    let gastosAcumulados = 0;
    let dividasMesAcumuladas = 0;
    let dividasPagasAcumuladas = 0;

    return Array.from({ length: ultimoDia }, (_, index) => {
      const dia = index + 1;
      const data = new Date(anoAtual, mesAtual, dia);
      const dataISO = dataLocalISO(data);
      const gastos = gastosPorData.get(dataISO) ?? 0;
      const dividaMesDia = dividasDoMesPorData.get(dataISO) ?? 0;
      const dividaPagaDia = dividasPagasPorData.get(dataISO) ?? 0;
      const teveGasto = gastos > 0;
      const teveDivida = dividaMesDia > 0 || dividaPagaDia > 0;
      const mostrarDia = deveMostrarDia(
        dia,
        ultimoDia,
        teveGasto,
        teveDivida,
      );

      gastosAcumulados += gastos;
      dividasMesAcumuladas += dividaMesDia;
      dividasPagasAcumuladas += dividaPagaDia;

      return {
        label: mostrarDia ? String(dia) : "",
        data: dataISO,
        dataFormatada: formatarDataGrafico(data),
        gastoDia: gastos,
        dividaPagaDia,
        saldo: salarioMes - gastosAcumulados - dividasMesAcumuladas,
        gastos: gastosAcumulados,
        dividasPagas: dividasPagasAcumuladas,
      };
    });
  }, [salarios, transacoes, dividas, ocorrenciasDividas, competenciaAtual]);
}
