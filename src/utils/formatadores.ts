export function fmt(v: number) {
  const abs = Math.abs(v);
  const str = abs.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return v < 0 ? `-${str}` : str;
}

export function formatBRL(numero: number) {
  return numero.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function textoParaValorBRL(texto: string) {
  const apenasNumeros = texto.replace(/\D/g, "");

  if (!apenasNumeros) {
    return "";
  }

  const numero = parseInt(apenasNumeros, 10) / 100;

  return String(numero);
}

export function letraMaiuscula(texto: string): string {
  if (!texto) return texto;
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

export function normalizar(str: string | number) {
  return String(str)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function buscaBate(
  item: {
    nome: string;
    valor: number;
  },
  termo: string,
) {
  if (!termo) return true;

  const n = normalizar(termo);

  if (normalizar(item.nome).includes(n)) return true;

  const numTermo = parseFloat(n.replace(",", "."));

  if (
    !Number.isNaN(numTermo) &&
    Math.abs(Math.abs(item.valor) - numTermo) < 0.005
  ) {
    return true;
  }

  const valorStr = Math.abs(item.valor).toFixed(2).replace(".", ",");

  if (valorStr.includes(n.replace(".", ","))) return true;

  return false;
}

export function hojeISO() {
  const data = new Date();

  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

export function getMesAtualKey() {
  const hoje = new Date();

  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;
}

export function calcularMesAnterior(chave: string) {
  const [ano, mes] = chave.split("-").map(Number);
  const data = new Date(ano, mes - 2, 1);

  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;
}

export function nomeMes(chave: string) {
  const [ano, mes] = chave.split("-").map(Number);

  const nome = new Date(ano, mes - 1, 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  return nome.charAt(0).toUpperCase() + nome.slice(1);
}

export function parseData(str: string) {
  if (!str) return new Date(NaN);

  // Se veio ISO completo, pega só a data
  const apenasData = str.slice(0, 10);

  const [ano, mes, dia] = apenasData.split("-").map(Number);

  return new Date(ano, mes - 1, dia);
}

export function rotuloDia(dataString: string) {
  const data = parseData(dataString);

  if (isNaN(data.getTime())) {
    return "Data inválida";
  }

  const hoje = new Date();

  const hojeLocal = new Date(
    hoje.getFullYear(),
    hoje.getMonth(),
    hoje.getDate(),
  );

  const dataLocal = new Date(
    data.getFullYear(),
    data.getMonth(),
    data.getDate(),
  );

  const ontem = new Date(hojeLocal);
  ontem.setDate(ontem.getDate() - 1);

  if (dataLocal.getTime() === hojeLocal.getTime()) {
    return "Hoje";
  }

  if (dataLocal.getTime() === ontem.getTime()) {
    return "Ontem";
  }

  return data.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
  });
}

export function formatarDataCurta(str: string) {
  const data = parseData(str);

  const texto = data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });

  return texto.replace(".", "");
}

export function tempoAtras(data: Date | null) {
  if (!data) return null;

  const diffMs = Date.now() - data.getTime();
  const min = Math.floor(diffMs / 60000);

  if (min < 1) return "agora mesmo";
  if (min < 60) return `há ${min}min`;

  const horas = Math.floor(min / 60);

  if (horas < 24) return `há ${horas}h`;

  const dias = Math.floor(horas / 24);

  return `há ${dias}d`;
}

export function calcularParcelas(
  divida: {
    isCartao: boolean;
    mesInicio?: string | null;
    totalParcelas?: number | null;
  },
  mesAtualKey = getMesAtualKey(),
) {
  if (!divida.isCartao || !divida.mesInicio || !divida.totalParcelas) {
    return {
      parcelasPagas: null,
      parcelasRestantes: null,
      quitada: false,
    };
  }

  const [anoIni, mesIni] = divida.mesInicio.split("-").map(Number);
  const [anoAtual, mesAtual] = mesAtualKey.split("-").map(Number);

  const mesesPassados = (anoAtual - anoIni) * 12 + (mesAtual - mesIni);

  const parcelasPagas = Math.min(
    Math.max(mesesPassados, 0),
    divida.totalParcelas,
  );
  const parcelasRestantes = divida.totalParcelas - parcelasPagas;
  const quitada = parcelasRestantes <= 0;

  return {
    parcelasPagas,
    parcelasRestantes,
    quitada,
  };
}
