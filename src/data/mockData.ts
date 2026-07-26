import { Divida } from "../features/financas";

export const cofrinhoInicial = 0;

export const dividas: Divida[] = [
  {
    id: "DIV_001",
    nome: "Pensão Mel",
    valor: 612,
    ativa: true,
    cartao: false,
    parcelas: 0,
    parcelasPagas: 0,
    vencimento: "5",
  },
  {
    id: "DIV_002",
    nome: "Ração Luke",
    valor: 120,
    ativa: true,
    cartao: false,
    parcelas: 0,
    parcelasPagas: 0,
    vencimento: "15",
  },
];