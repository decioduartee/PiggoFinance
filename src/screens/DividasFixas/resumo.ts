import type { ItemDivida } from "./utils";

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
    const valor = Number(item.ocorrencia.valor ?? 0);

    if (item.ocorrencia.status === "pago") {
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
