import type { Divida, OcorrenciaDivida, Salario, Transacao } from "./types";
import { normalizarCompetencia } from "./competencia";
import { valorOcorrenciaDivida } from "./ocorrencias";

export function filtrarSalariosPorCompetencia(
  salarios: Salario[],
  competencia: string,
) {
  return salarios.filter(
    (salario) => normalizarCompetencia(salario.data) === competencia,
  );
}

export function filtrarTransacoesPorCompetencia(
  transacoes: Transacao[],
  competencia: string,
) {
  return transacoes.filter(
    (transacao) => normalizarCompetencia(transacao.data) === competencia,
  );
}

export function filtrarOcorrenciasPorCompetencia(
  ocorrencias: OcorrenciaDivida[],
  competencia: string,
) {
  return ocorrencias.filter(
    (ocorrencia) =>
      normalizarCompetencia(ocorrencia.competencia) === competencia,
  );
}

export function calcularTotalEntradasMes(salarios: Salario[]) {
  return salarios.reduce(
    (soma, salario) => soma + Number(salario.valor || 0),
    0,
  );
}

export function calcularTotalSaidasMes(transacoes: Transacao[]) {
  return Math.abs(
    transacoes
      .filter((transacao) => transacao.tipo === "saida")
      .reduce((soma, transacao) => soma + Number(transacao.valor || 0), 0),
  );
}

export function calcularTotalDividasMes(
  ocorrencias: OcorrenciaDivida[],
  dividas: Divida[],
) {
  const idsContabilizados = new Set<string>();

  return ocorrencias.reduce((soma, ocorrencia) => {
    if (idsContabilizados.has(ocorrencia.dividaId)) {
      return soma;
    }

    const divida = dividas.find((item) => item.id === ocorrencia.dividaId);

    if (!divida) {
      return soma;
    }

    idsContabilizados.add(ocorrencia.dividaId);

    return soma + valorOcorrenciaDivida(ocorrencia, divida);
  }, 0);
}
