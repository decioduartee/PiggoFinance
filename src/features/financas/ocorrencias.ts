import type { Divida, OcorrenciaDivida, StatusOcorrenciaDivida } from "./types";
import {
  calcularNumeroParcela,
  gerarIdTemporario,
  montarVencimento,
  normalizarCompetencia,
} from "./competencia";

export function hojeLocalISO() {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

export function dividaParcelada(divida: Divida) {
  return divida.tipo === "parcelada" || Boolean(divida.parcelada);
}

export function totalParcelasDivida(divida: Divida) {
  return (
    Number(divida.parcelas) ||
    Number(divida.totalParcelas) ||
    0
  );
}

export function valorParcelaDivida(divida: Divida) {
  const valorTotal = Math.abs(Number(divida.valor) || 0);

  if (!dividaParcelada(divida)) {
    return valorTotal;
  }

  const totalParcelas = totalParcelasDivida(divida);

  if (totalParcelas <= 0) {
    return valorTotal;
  }

  return valorTotal / totalParcelas;
}

export function valorOcorrenciaDivida(
  ocorrencia: Pick<OcorrenciaDivida, "valor"> | null | undefined,
  divida: Divida,
) {
  const valorOcorrencia = Math.abs(Number(ocorrencia?.valor) || 0);

  if (valorOcorrencia > 0) {
    return valorOcorrencia;
  }

  return valorParcelaDivida(divida);
}

export function dividaPertenceCompetencia(
  divida: Divida,
  competencia: string,
) {
  if (divida.ativa === false) return false;

  const inicio = normalizarCompetencia(divida.inicio);
  const competenciaNormalizada = normalizarCompetencia(competencia);

  if (!competenciaNormalizada) return false;
  if (inicio && competenciaNormalizada < inicio) return false;
  if (!dividaParcelada(divida)) return true;

  const parcela = calcularNumeroParcela(divida.inicio, competenciaNormalizada);
  const total = totalParcelasDivida(divida);

  return Boolean(parcela && parcela >= 1 && total > 0 && parcela <= total);
}

export function diaVencimentoDivida(divida: Divida) {
  const dia = Number(divida.vencimento) || Number(divida.diaVencimento);

  return dia || undefined;
}

export function obterStatusOcorrencia(
  ocorrencia: OcorrenciaDivida,
  dataReferencia = hojeLocalISO(),
): StatusOcorrenciaDivida {
  if (ocorrencia.status === "pago") {
    return "pago";
  }

  const vencimento = String(ocorrencia.vencimento ?? "").slice(0, 10);
  const hoje = typeof dataReferencia === "string"
    ? dataReferencia.slice(0, 10)
    : hojeLocalISO();

  if (vencimento && hoje && hoje > vencimento) {
    return "atrasada";
  }

  return "pendente";
}

export function criarOcorrenciaTemporaria(
  divida: Divida,
  competencia: string,
): OcorrenciaDivida | null {
  const inicio = normalizarCompetencia(divida.inicio);

  if (!inicio || competencia < inicio || !divida.ativa) {
    return null;
  }

  let numeroParcela: number | undefined;
  let status: StatusOcorrenciaDivida = "pendente";

  if (dividaParcelada(divida)) {
    const totalParcelas = totalParcelasDivida(divida);
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
    vencimento: montarVencimento(competencia, diaVencimentoDivida(divida)),
    valor: valorParcelaDivida(divida),
    pagoEm: status === "pago" ? agora : "",
    criadoEm: agora,
    atualizadoEm: agora,
  };
}
