export type NovoSalario = {
  nome: string;
  valor: number;
  data: string;
  responsavel?: string;
};


export interface Salario {
  id: string;
  nome: string;
  valor: number;
  data: string;
  responsavel?: string;
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface Divida {
  id: string;
  nome: string;
  valor: number;
  ativa: boolean;
  cartao: boolean;
  parcelas: number;
  parcelasPagas: number;
  vencimento?: string;
}

export interface Transacao {
  id: string;
  nome: string;
  valor: number;
  categoria: string;
  data: string;
  tipo: "entrada" | "saida";
  responsavel?: string;
  criadoEm?: string;
  atualizadoEm?: string;
}
