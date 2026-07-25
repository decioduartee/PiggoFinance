import { Transacao } from "./types";
import { rotuloDia } from "../../utils/formatadores";

export type GrupoTransacoes = Record<string, Transacao[]>;

export function dataEstaNoMes(data: string, mesAtual: string) {
  return data.slice(0, 7) === mesAtual;
}

export function ordenarMaisRecentes(a: Transacao, b: Transacao) {
  if (a.data !== b.data) {
    return b.data.localeCompare(a.data);
  }

  const idA = Number(a.id);
  const idB = Number(b.id);

  if (!Number.isNaN(idA) && !Number.isNaN(idB)) {
    return idB - idA;
  }

  return b.id.localeCompare(a.id);
}

export function filtrarGastosDoMes(transacoes: Transacao[], mesAtual: string) {
  return [...transacoes]
    .filter(
      (item) => item.tipo === "saida" && dataEstaNoMes(item.data, mesAtual),
    )
    .sort(ordenarMaisRecentes);
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
