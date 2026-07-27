import { api } from "../../services/api";
import type {
  Transacao,
  Salario,
  NovoSalario,
  Divida,
  NovaDivida,
  OcorrenciaDivida,
} from "./types";

export const FinanceService = {
  // ====================================================
  // TRANSAÇÕES
  // ====================================================

  async listarTransacoes() {
    return await api.getTransactions();
  },

  async buscarTransacao(id: string) {
    return await api.getTransaction(id);
  },

  async criarTransacao(transacao: Transacao) {
    return await api.createTransaction(transacao);
  },

  async editarTransacao(transacao: Transacao) {
    return await api.updateTransaction(transacao);
  },

  async excluirTransacao(id: string) {
    return await api.deleteTransaction(id);
  },

  // ====================================================
  // SALÁRIOS
  // ====================================================

  async listarSalarios() {
    return await api.getSalarios();
  },

  async buscarSalario(id: string) {
    return await api.getSalario(id);
  },

  async criarSalario(salario: NovoSalario) {
    return await api.createSalario(salario);
  },

  async editarSalario(salario: Salario) {
    return await api.updateSalario(salario);
  },

  async excluirSalario(id: string) {
    return await api.deleteSalario(id);
  },

  // ====================================================
  // DÍVIDAS
  // ====================================================

  async listarDividas() {
    return await api.getDividas();
  },

  async buscarDivida(id: string) {
    return await api.getDivida(id);
  },

  async criarDivida(divida: NovaDivida) {
    return await api.createDivida(divida);
  },

  async editarDivida(divida: Divida) {
    return await api.updateDivida(divida);
  },

  async excluirDivida(id: string) {
    return await api.deleteDivida(id);
  },

  // ====================================================
  // OCORRÊNCIAS DAS DÍVIDAS
  // ====================================================

  async listarOcorrenciasDividas() {
    return await api.getOcorrenciasDividas();
  },

  async garantirOcorrenciasMes(competencia: string) {
    return await api.ensureDebtOccurrencesMonth(competencia);
  },

  async atualizarOcorrenciaDivida(
    ocorrencia: OcorrenciaDivida,
  ) {
    return await api.updateOcorrenciaDivida(ocorrencia);
  },
};

export default FinanceService;