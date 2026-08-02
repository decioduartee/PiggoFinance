import { Transacao } from "./types";
import { normalizarDataISO, rotuloDia } from "../../utils/formatadores";

export type GrupoTransacoes = Record<string, Transacao[]>;

export function dataEstaNoMes(data: string, mesAtual: string) {
  return normalizarDataISO(data).slice(0, 7) === mesAtual;
}

export function ordenarMaisRecentes(a: Transacao, b: Transacao) {
  const dataA = normalizarDataISO(a.data);
  const dataB = normalizarDataISO(b.data);

  if (dataA !== dataB) {
    return dataB.localeCompare(dataA);
  }

  const idA = Number(a.id);
  const idB = Number(b.id);

  if (!Number.isNaN(idA) && !Number.isNaN(idB)) {
    return idB - idA;
  }

  return b.id.localeCompare(a.id);
}

export function obterTimestampLancamento(transacao: Transacao) {
  const datas = [transacao.criadoEm, transacao.atualizadoEm, transacao.data];

  for (const data of datas) {
    if (!data) {
      continue;
    }

    const timestamp = Date.parse(data);

    if (!Number.isNaN(timestamp)) {
      return timestamp;
    }
  }

  return 0;
}

export function ordenarLancamentosMaisRecentes(a: Transacao, b: Transacao) {
  const timestampA = obterTimestampLancamento(a);
  const timestampB = obterTimestampLancamento(b);

  if (timestampA !== timestampB) {
    return timestampB - timestampA;
  }

  return ordenarMaisRecentes(a, b);
}

export function filtrarGastosDoMes(transacoes: Transacao[], mesAtual: string) {
  return [...transacoes]
    .filter(
      (item) => item.tipo === "saida" && dataEstaNoMes(item.data, mesAtual),
    )
    .sort((a, b) => {
      const comparacaoData = normalizarDataISO(b.data).localeCompare(
        normalizarDataISO(a.data),
      );

      if (comparacaoData !== 0) {
        return comparacaoData;
      }

      return ordenarLancamentosMaisRecentes(a, b);
    });
}

export function obterGastoMaisRecenteDoMes(
  transacoes: Transacao[],
  mesAtual: string,
) {
  return [...transacoes]
    .filter(
      (item) => item.tipo === "saida" && dataEstaNoMes(item.data, mesAtual),
    )
    .sort(ordenarLancamentosMaisRecentes)[0];
}

export function agruparPorDia(transacoes: Transacao[]) {
  const grupos: GrupoTransacoes = {};

  transacoes.forEach((item) => {
    const grupo = rotuloDia(item.data);

    if (!grupos[grupo]) {
      grupos[grupo] = [];
    }

    grupos[grupo].push(item);
  });

  return grupos;
}

export function limitarTransacoesDosGrupos(
  grupos: GrupoTransacoes,
  limite: number,
) {
  let quantidade = 0;
  const resultado: GrupoTransacoes = {};

  for (const [grupo, itens] of Object.entries(grupos)) {
    if (quantidade >= limite) break;

    const restantes = limite - quantidade;
    resultado[grupo] = itens.slice(0, restantes);
    quantidade += resultado[grupo].length;
  }

  return resultado;
}

export function somarGastos(transacoes: Transacao[]) {
  return transacoes.reduce((total, item) => total + Math.abs(item.valor), 0);
}
