// ==========================================================
// SALÁRIOS
// ==========================================================

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

// ==========================================================
// DÍVIDAS FIXAS
// ==========================================================

export type TipoDivida =
  | "fixa"
  | "parcelada";

export interface NovaDivida {
  nome: string;
  tipo: TipoDivida;
  valor: number;
  ativa: boolean;

  /**
   * Somente para dívidas parceladas.
   *
   * Exemplo:
   * Compra em 12x -> parcelas = 12
   */
  parcelas?: number;

  /**
   * Quantidade de parcelas que já foram pagas.
   *
   * Exemplo:
   * Compra em 12x e já pagou 4:
   * parcelasPagas = 4
   */
  parcelasPagas?: number;

  /**
   * Mês da PRIMEIRA parcela.
   *
   * Exemplo:
   * 2026-04-01
   */
  inicio: string;

  /**
   * Dia do vencimento.
   *
   * Exemplo:
   * vencimento = 9
   *
   * Opcional para dívidas sem vencimento definido.
   */
  vencimento?: number;

  responsavel?: string;
}

export interface Divida
  extends NovaDivida {
  id: string;

  criadoEm?: string;
  atualizadoEm?: string;
}

// ==========================================================
// OCORRÊNCIAS DAS DÍVIDAS
// ==========================================================

export type StatusOcorrenciaDivida =
  | "pendente"
  | "pago";

export interface OcorrenciaDivida {
  id: string;

  /**
   * ID da dívida original.
   */
  dividaId: string;

  /**
   * Competência da ocorrência.
   *
   * Exemplo:
   * 2026-07
   */
  competencia: string;

  /**
   * Número da parcela dentro do parcelamento.
   *
   * Exemplo:
   * 4 significa parcela 4/12.
   *
   * Em dívida fixa pode não existir.
   */
  numeroParcela?: number;

  status:
    StatusOcorrenciaDivida;

  /**
   * Exemplo:
   * 2026-07-09
   *
   * Pode ser vazio para dívida sem
   * vencimento definido.
   */
  vencimento: string;

  /**
   * ISO quando o pagamento for confirmado.
   *
   * Pode ficar vazio enquanto estiver
   * pendente.
   */
  pagoEm?: string;

  criadoEm?: string;
  atualizadoEm?: string;
}

// ==========================================================
// TRANSAÇÕES
// ==========================================================

export interface Transacao {
  id: string;

  nome: string;

  valor: number;

  categoria: string;

  data: string;

  tipo:
    | "entrada"
    | "saida";

  responsavel?: string;

  criadoEm?: string;
  atualizadoEm?: string;
}