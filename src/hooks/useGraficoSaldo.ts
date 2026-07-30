import { useMemo } from "react";

import type {
  Divida,
  OcorrenciaDivida,
  Salario,
  Transacao,
} from "../features/financas/types";
import {
  obterStatusOcorrencia,
  valorOcorrenciaDivida,
} from "../features/financas/ocorrencias";
import { getMesAtualKey } from "../utils/formatadores";

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

function formatarDataLocal(data: Date) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function formatarDataGrafico(data: Date) {
  const dia = data.getDate();

  return `Dia ${dia}`;
}

function deveMostrarDia(
  dia: number,
  ultimoDia: number,
  teveGasto: boolean,
  teveDividaPaga: boolean,
) {
  return dia === ultimoDia || teveGasto || teveDividaPaga;
}

export default function useGraficoSaldo(
  salarios: Salario[],
  transacoes: Transacao[],
  dividas: Divida[],
  ocorrenciasDividas: OcorrenciaDivida[],
) {
  return useMemo(() => {
    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.getMonth();
    const chaveMesAtual = getMesAtualKey();
    const salarioMes = salarios
      .filter(
        (s) =>
          s?.data &&
          s.data.slice(0, 7) <= chaveMesAtual &&
          !Number.isNaN(Number(s.valor)),
      )
      .reduce((soma, item) => soma + Number(item.valor), 0);

    const transacoesValidas = transacoes.filter(
      (t) =>
        t?.data &&
        t.tipo === "saida" &&
        t.data.slice(0, 7) === chaveMesAtual &&
        !Number.isNaN(Number(t.valor)),
    );

    const gastosPorData = transacoesValidas.reduce((mapa, item) => {
      const data = item.data.slice(0, 10);
      const valorAtual = mapa.get(data) ?? 0;

      mapa.set(data, valorAtual + Math.abs(Number(item.valor)));

      return mapa;
    }, new Map<string, number>());

    const dividasPorId = new Map(dividas.map((divida) => [divida.id, divida]));

    const dividasPagasPorData = ocorrenciasDividas.reduce((mapa, ocorrencia) => {
      if (obterStatusOcorrencia(ocorrencia) !== "pago" || !ocorrencia.pagoEm) {
        return mapa;
      }

      const dataPagamento = ocorrencia.pagoEm.slice(0, 10);

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

    if (totalGastos <= 0 && totalDividasPagas <= 0) {
      return [];
    }

    const ultimoDiaComGasto = transacoesValidas.reduce((maiorDia, item) => {
      const dia = Number(item.data.slice(8, 10));

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

    const ultimoDia = Math.max(ultimoDiaComGasto, ultimoDiaComDividaPaga);

    if (ultimoDia <= 0) {
      return [];
    }

    let gastosAcumulados = 0;
    let dividasPagasAcumuladas = 0;

    return Array.from({ length: ultimoDia }, (_, index) => {
      const dia = index + 1;
      const data = new Date(anoAtual, mesAtual, dia);
      const dataISO = formatarDataLocal(data);
      const gastos = gastosPorData.get(dataISO) ?? 0;
      const dividaPagaDia = dividasPagasPorData.get(dataISO) ?? 0;
      const teveGasto = gastos > 0;
      const teveDividaPaga = dividaPagaDia > 0;
      const mostrarDia = deveMostrarDia(
        dia,
        ultimoDia,
        teveGasto,
        teveDividaPaga,
      );

      gastosAcumulados += gastos;
      dividasPagasAcumuladas += dividaPagaDia;

      return {
        label: mostrarDia ? String(dia) : "",
        data: dataISO,
        dataFormatada: formatarDataGrafico(data),
        gastoDia: gastos,
        dividaPagaDia,
        saldo: salarioMes - gastosAcumulados,
        gastos: gastosAcumulados,
        dividasPagas: dividasPagasAcumuladas,
      };
    });
  }, [salarios, transacoes, dividas, ocorrenciasDividas]);
}
