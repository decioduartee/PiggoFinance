import { Divida } from "../features/financas";

export const cofrinhoInicial = 0;

export const dividas: Divida[] = [
  {
    id: "DIV_001",
    nome: "Pensão Mel",
    tipo: "fixa",
    valor: 612,
    ativa: true,
    parcelas: 0,
    parcelasPagas: 0,
    inicio: "2026-01-01",
    vencimento: 5,
  },
  {
    id: "DIV_002",
    nome: "Ração Luke",
    tipo: "fixa",
    valor: 120,
    ativa: true,
    parcelas: 0,
    parcelasPagas: 0,
    inicio: "2026-01-01",
    vencimento: 15,
  },
];
