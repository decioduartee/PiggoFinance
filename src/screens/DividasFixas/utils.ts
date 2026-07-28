import type { Divida, OcorrenciaDivida } from "../../features/financas";

export type Ordem = "recentes" | "antigos";

export type ItemDivida = {
  id: string;
  data: string;
  divida: Divida;
  ocorrencia: OcorrenciaDivida;
  prevista: boolean;
};

export type GrupoDividas = {
  titulo: string;
  data: string;
  itens: ItemDivida[];
};

export function chaveMes(valor?: string | null) {
  if (!valor) return "";
  return String(valor).slice(0, 7);
}

export function hojeISO() {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

export function gerarIdOcorrencia() {
  return `OC_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function normalizarDiaVencimento(divida: Divida) {
  const valor =
    Number((divida as any).vencimento) ||
    Number((divida as any).diaVencimento) ||
    1;

  return Math.min(Math.max(valor, 1), 31);
}

export function dataVencimentoDaCompetencia(
  competencia: string,
  divida: Divida,
) {
  const [anoTexto, mesTexto] = competencia.split("-");
  const ano = Number(anoTexto);
  const mes = Number(mesTexto);

  if (!ano || !mes) return `${competencia}-01`;

  const ultimoDia = new Date(ano, mes, 0).getDate();
  const dia = Math.min(normalizarDiaVencimento(divida), ultimoDia);

  return `${competencia}-${String(dia).padStart(2, "0")}`;
}

export function numeroParcelaDaCompetencia(
  divida: Divida,
  competencia: string,
) {
  const inicio = chaveMes((divida as any).inicio);
  if (!inicio) return undefined;

  const [anoInicio, mesInicio] = inicio.split("-").map(Number);
  const [anoAtual, mesAtual] = competencia.split("-").map(Number);

  if (!anoInicio || !mesInicio || !anoAtual || !mesAtual) return undefined;

  const diferenca =
    (anoAtual - anoInicio) * 12 + (mesAtual - mesInicio) + 1;

  return diferenca > 0 ? diferenca : undefined;
}

export function totalParcelas(divida: Divida) {
  return (
    Number((divida as any).parcelas) ||
    Number((divida as any).totalParcelas) ||
    0
  );
}

export function dividaParcelada(divida: Divida) {
  return (
    (divida as any).tipo === "parcelada" ||
    Boolean((divida as any).parcelada)
  );
}

export function criarOcorrenciaPendente(
  divida: Divida,
  competencia: string,
): OcorrenciaDivida {
  const numeroParcela = dividaParcelada(divida)
    ? numeroParcelaDaCompetencia(divida, competencia)
    : undefined;

  return {
    id: `PREV_${divida.id}_${competencia}`,
    dividaId: divida.id,
    competencia,
    vencimento: dataVencimentoDaCompetencia(competencia, divida),
    valor: Math.abs(Number((divida as any).valor) || 0),
    status: "pendente",
    pagoEm: "",
    ...(numeroParcela ? { numeroParcela } : {}),
  } as OcorrenciaDivida;
}

export function dividaValidaNaCompetencia(
  divida: Divida,
  competencia: string,
) {
  if ((divida as any).ativa === false) return false;

  const inicio = chaveMes((divida as any).inicio);
  if (inicio && competencia < inicio) return false;

  if (!dividaParcelada(divida)) return true;

  const parcela = numeroParcelaDaCompetencia(divida, competencia);
  const total = totalParcelas(divida);

  if (!parcela || total <= 0) return false;
  return parcela <= total;
}

export function montarDividasDoMes({
  dividas,
  ocorrencias,
  competencia,
}: {
  dividas: Divida[];
  ocorrencias: OcorrenciaDivida[];
  competencia: string;
}) {
  const ocorrenciasDoMes = ocorrencias.filter(
    (item) => chaveMes(item.competencia) === competencia,
  );

  return dividas
    .filter((divida) => dividaValidaNaCompetencia(divida, competencia))
    .map<ItemDivida>((divida) => {
      const real = ocorrenciasDoMes.find(
        (item) => item.dividaId === divida.id,
      );
      const ocorrencia = real ?? criarOcorrenciaPendente(divida, competencia);
      const prevista = !real;
      const data =
        (ocorrencia as any).vencimento ||
        dataVencimentoDaCompetencia(competencia, divida);

      return {
        id: `${divida.id}_${competencia}`,
        data,
        divida,
        ocorrencia,
        prevista,
      };
    });
}

export function pesquisarDividas(lista: ItemDivida[], texto: string) {
  const busca = texto.trim().toLowerCase();
  if (!busca) return lista;

  const buscaValor = busca.replace(".", ",");

  return lista.filter(({ divida, ocorrencia }) => {
    const nome = String((divida as any).nome ?? "").toLowerCase();
    const status = String((ocorrencia as any).status ?? "").toLowerCase();
    const tipo = dividaParcelada(divida) ? "parcela" : "recorrente";
    const valor = Math.abs(Number((ocorrencia as any).valor ?? (divida as any).valor) || 0)
      .toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
      .toLowerCase();

    return (
      nome.includes(busca) ||
      status.includes(busca) ||
      tipo.includes(busca) ||
      valor.includes(buscaValor)
    );
  });
}

export function ordenarDividas(lista: ItemDivida[], ordem: Ordem) {
  return [...lista].sort((a, b) => {
    const comparacao = a.data.localeCompare(b.data);
    if (comparacao !== 0) {
      return ordem === "recentes" ? -comparacao : comparacao;
    }

    return String((a.divida as any).nome ?? "").localeCompare(
      String((b.divida as any).nome ?? ""),
      "pt-BR",
    );
  });
}

export function rotuloVencimento(data: string) {
  const dia = Number(String(data).slice(8, 10));
  return dia ? `Vence dia ${dia}` : "Sem vencimento";
}

export function agruparPorVencimento(lista: ItemDivida[]) {
  const grupos = new Map<string, GrupoDividas>();

  lista.forEach((item) => {
    const chave = item.data;
    const existente = grupos.get(chave);

    if (existente) {
      existente.itens.push(item);
      return;
    }

    grupos.set(chave, {
      titulo: rotuloVencimento(item.data),
      data: item.data,
      itens: [item],
    });
  });

  return Array.from(grupos.values());
}
