import type React from "react";
import type { PerfilUsuario } from "../features/perfil/perfis";
import type {
  Divida,
  NovaDivida,
  NovoSalario,
  OcorrenciaDivida,
  Salario,
  StatusOcorrenciaDivida,
  Transacao,
} from "../features/financas/types";

export type AppContextData = {
  salarios: Salario[];
  dividas: Divida[];
  ocorrenciasDividas: OcorrenciaDivida[];
  transacoes: Transacao[];
  cofrinho: number;

  carregando: boolean;

  setSalarios: React.Dispatch<React.SetStateAction<Salario[]>>;
  setDividas: React.Dispatch<React.SetStateAction<Divida[]>>;
  setOcorrenciasDividas: React.Dispatch<
    React.SetStateAction<OcorrenciaDivida[]>
  >;
  setCofrinho: React.Dispatch<React.SetStateAction<number>>;

  modoEscuro: boolean;
  alterarModoEscuro: (ativo: boolean) => Promise<void>;

  adicionarTransacao: (transacao: Transacao) => Promise<void>;
  editarTransacao: (transacao: Transacao) => Promise<void>;
  excluirTransacao: (id: string) => Promise<void>;
  carregarTransacoes: () => Promise<void>;

  adicionarSalario: (salario: NovoSalario) => Promise<void>;
  editarSalario: (id: string, salario: NovoSalario) => Promise<void>;
  excluirSalario: (id: string) => Promise<void>;

  adicionarDivida: (divida: NovaDivida) => Promise<void>;
  editarDivida: (id: string, divida: NovaDivida) => Promise<void>;
  excluirDivida: (id: string) => Promise<void>;
  alterarStatusDivida: (id: string, ativa: boolean) => Promise<void>;
  carregarDividas: () => Promise<void>;

  alterarStatusOcorrencia: (
    id: string,
    status: StatusOcorrenciaDivida,
  ) => Promise<void>;
  carregarOcorrenciasDividas: () => Promise<void>;

  competenciaAtual: string;

  totalEntradasMes: number;
  totalSaidasMes: number;
  totalDividasMes: number;
  saldoDisponivelMes: number;

  totalEntradas: number;
  totalSaidas: number;
  totalDividas: number;
  saldoDisponivel: number;

  perfilAtual: PerfilUsuario;
  trocarPerfil: (perfil: PerfilUsuario) => Promise<void>;
};
