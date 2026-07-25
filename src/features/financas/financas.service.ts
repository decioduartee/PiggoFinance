import { api } from "../../services/api";
import type {
  Transacao,
  Salario,
  NovoSalario,
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
};

export default FinanceService;
