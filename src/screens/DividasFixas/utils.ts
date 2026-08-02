import type { Divida, OcorrenciaDivida } from "../../features/financas/types";
import { normalizarCompetencia } from "../../features/financas/competencia";
import {
  dividaParcelada as ehDividaParcelada,
  dividaPertenceCompetencia,
  obterStatusOcorrencia,
  totalParcelasDivida,
  valorOcorrenciaDivida,
  valorParcelaDivida,
} from "../../features/financas/ocorrencias";
import { normalizarDataISO } from "../../utils/formatadores";

export type Ordem = "recentes" | "antigos";
export type ModoListaDividas = "mes" | "todas";

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
  return normalizarCompetencia(valor ?? "");
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
    Number(divida.vencimento) ||
    Number(divida.diaVencimento) ||
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
  const inicio = chaveMes(divida.inicio);
  if (!inicio) return undefined;

  const [anoInicio, mesInicio] = inicio.split("-").map(Number);
  const [anoAtual, mesAtual] = competencia.split("-").map(Number);

  if (!anoInicio || !mesInicio || !anoAtual || !mesAtual) return undefined;

  const diferenca =
    (anoAtual - anoInicio) * 12 + (mesAtual - mesInicio) + 1;

  return diferenca > 0 ? diferenca : undefined;
}

export function totalParcelas(divida: Divida) {
  return totalParcelasDivida(divida);
}

export function dividaParcelada(divida: Divida) {
  return ehDividaParcelada(divida);
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
    valor: valorParcelaDivida(divida),
    status: "pendente",
    pagoEm: "",
    ...(numeroParcela ? { numeroParcela } : {}),
  };
}

export function dividaValidaNaCompetencia(
  divida: Divida,
  competencia: string,
) {
  return dividaPertenceCompetencia(divida, competencia);
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
        ocorrencia.vencimento ||
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

function ordenarOcorrenciasMaisRecentes(
  a: OcorrenciaDivida,
  b: OcorrenciaDivida,
) {
  const competencia = chaveMes(b.competencia).localeCompare(
    chaveMes(a.competencia),
  );

  if (competencia !== 0) {
    return competencia;
  }

  const dataB = String(b.atualizadoEm || b.criadoEm || b.vencimento || "");
  const dataA = String(a.atualizadoEm || a.criadoEm || a.vencimento || "");

  return dataB.localeCompare(dataA);
}

export function montarTodasDividas({
  dividas,
  ocorrencias,
  competenciaAtual,
}: {
  dividas: Divida[];
  ocorrencias: OcorrenciaDivida[];
  competenciaAtual: string;
}) {
  const ocorrenciasPorDivida = ocorrencias.reduce(
    (mapa, ocorrencia) => {
      const lista = mapa.get(ocorrencia.dividaId) ?? [];
      lista.push(ocorrencia);
      mapa.set(ocorrencia.dividaId, lista);

      return mapa;
    },
    new Map<string, OcorrenciaDivida[]>(),
  );

  return dividas.map<ItemDivida>((divida) => {
    const ocorrenciasDaDivida = [
      ...(ocorrenciasPorDivida.get(divida.id) ?? []),
    ].sort(ordenarOcorrenciasMaisRecentes);
    const ocorrenciaAtual =
      ocorrenciasDaDivida.find(
        (item) => chaveMes(item.competencia) === competenciaAtual,
      ) ?? null;
    const ocorrenciaReal = ocorrenciaAtual ?? ocorrenciasDaDivida[0] ?? null;
    const competenciaBase =
      chaveMes(ocorrenciaReal?.competencia) ||
      chaveMes(divida.inicio) ||
      competenciaAtual;
    const ocorrencia =
      ocorrenciaReal ?? criarOcorrenciaPendente(divida, competenciaBase);
    const data =
      ocorrencia.vencimento ||
      dataVencimentoDaCompetencia(competenciaBase, divida);

    return {
      id: `${divida.id}_todas`,
      data,
      divida,
      ocorrencia,
      prevista: !ocorrenciaReal,
    };
  });
}

export function pesquisarDividas(lista: ItemDivida[], texto: string) {
  const busca = texto.trim().toLowerCase();
  if (!busca) return lista;

  const buscaValor = busca.replace(".", ",");

  return lista.filter(({ divida, ocorrencia }) => {
    const nome = String(divida.nome ?? "").toLowerCase();
    const status = obterStatusOcorrencia(ocorrencia).toLowerCase();
    const tipo = dividaParcelada(divida) ? "parcela" : "recorrente";
    const valor = valorDaDivida({ divida, ocorrencia })
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

function timestampCadastroDivida(item: ItemDivida) {
  const datas = [
    item.divida.criadoEm,
    item.divida.atualizadoEm,
    item.ocorrencia.criadoEm,
    item.ocorrencia.atualizadoEm,
    item.divida.inicio,
    item.data,
  ];

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

export function ordenarDividas(lista: ItemDivida[], ordem: Ordem) {
  return [...lista].sort((a, b) => {
    const cadastroA = timestampCadastroDivida(a);
    const cadastroB = timestampCadastroDivida(b);

    if (cadastroA !== cadastroB) {
      return ordem === "recentes"
        ? cadastroB - cadastroA
        : cadastroA - cadastroB;
    }

    const comparacaoVencimento = a.data.localeCompare(b.data);
    if (comparacaoVencimento !== 0) {
      return ordem === "recentes"
        ? -comparacaoVencimento
        : comparacaoVencimento;
    }

    return String(a.divida.nome ?? "").localeCompare(
      String(b.divida.nome ?? ""),
      "pt-BR",
    );
  });
}

export function valorDaDivida({
  divida,
  ocorrencia,
}: Pick<ItemDivida, "divida" | "ocorrencia">) {
  return valorOcorrenciaDivida(ocorrencia, divida);
}

export function ocorrenciaEstaPaga(ocorrencia: OcorrenciaDivida) {
  return obterStatusOcorrencia(ocorrencia) === "pago";
}

export function ocorrenciaEstaAtrasada(ocorrencia: OcorrenciaDivida) {
  return obterStatusOcorrencia(ocorrencia) === "atrasada";
}

export function rotuloVencimento(data: string) {
  const dia = Number(normalizarDataISO(data).slice(8, 10));
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
