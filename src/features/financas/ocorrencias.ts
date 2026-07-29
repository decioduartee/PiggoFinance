import type { Divida, OcorrenciaDivida, StatusOcorrenciaDivida } from "./types";
import {
  calcularNumeroParcela,
  gerarIdTemporario,
  montarVencimento,
  normalizarCompetencia,
} from "./competencia";

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
