export function gerarIdTemporario(prefixo: string) {
  return (
    `${prefixo}_TEMP_` +
    `${Date.now()}_` +
    `${Math.random().toString(16).slice(2, 8)}`
  );
}

export function normalizarCompetencia(valor?: string) {
  if (!valor) {
    return "";
  }

  const match = String(valor).match(/^(\d{4})-(\d{2})/);

  if (!match) {
    return "";
  }

  return `${match[1]}-${match[2]}`;
}

export function obterCompetenciaAtual() {
  const agora = new Date();

  return (
    `${agora.getFullYear()}-` +
    `${String(agora.getMonth() + 1).padStart(2, "0")}`
  );
}

export function calcularNumeroParcela(inicio: string, competencia: string) {
  const inicioNormalizado = normalizarCompetencia(inicio);
  const competenciaNormalizada = normalizarCompetencia(competencia);

  if (!inicioNormalizado || !competenciaNormalizada) {
    return null;
  }

  const [anoInicio, mesInicio] = inicioNormalizado.split("-").map(Number);
  const [anoCompetencia, mesCompetencia] = competenciaNormalizada
    .split("-")
    .map(Number);

  return (anoCompetencia - anoInicio) * 12 + (mesCompetencia - mesInicio) + 1;
}

export function montarVencimento(competencia: string, dia?: number) {
  if (dia == null || Number.isNaN(Number(dia))) {
    return "";
  }

  const [ano, mes] = competencia.split("-").map(Number);

  if (!ano || !mes) {
    return "";
  }

  const ultimoDia = new Date(ano, mes, 0).getDate();
  const diaFinal = Math.min(Math.max(Number(dia), 1), ultimoDia);

  return (
    `${ano}-` +
    `${String(mes).padStart(2, "0")}-` +
    `${String(diaFinal).padStart(2, "0")}`
  );
}
