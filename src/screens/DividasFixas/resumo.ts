import {
  ocorrenciaEstaPaga,
  valorDaDivida,
  type ItemDivida,
} from "./utils";

export interface ResumoDividas {
  totalPago: number;
  totalPendente: number;
  quantidadePagas: number;
  quantidadePendentes: number;
  quantidadeTotal: number;
}

export function calcularResumoDividas(
  dividas: ItemDivida[],
): ResumoDividas {
  let totalPago = 0;
  let totalPendente = 0;
  let quantidadePagas = 0;
  let quantidadePendentes = 0;

  for (const item of dividas) {
    const valor = valorDaDivida(item);

    if (ocorrenciaEstaPaga(item.ocorrencia)) {
      totalPago += valor;
      quantidadePagas++;
    } else {
      totalPendente += valor;
      quantidadePendentes++;
    }
  }

  return {
    totalPago,
    totalPendente,
    quantidadePagas,
    quantidadePendentes,
    quantidadeTotal: dividas.length,
  };
}
