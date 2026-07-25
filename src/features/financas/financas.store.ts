import type { NovoSalario, Salario, Transacao } from "./types";
import { FinanceService } from "./financas.service";

// ==========================================================
// Transações
// ==========================================================

export async function adicionarTransacaoOptimistic(
  transacao: Transacao,
  setTransacoes: React.Dispatch<React.SetStateAction<Transacao[]>>
) {
  const tempId = `TEMP_${Date.now()}`;

  const temporaria: Transacao = {
    ...transacao,
    id: tempId,
  };

  // Atualiza a UI imediatamente
  setTransacoes((prev) => [temporaria, ...prev]);

  try {
    const criada = await FinanceService.criarTransacao(transacao);

    setTransacoes((prev) =>
      prev.map((item) =>
        item.id === tempId ? criada : item
      )
    );

    return criada;
  } catch (error) {
    setTransacoes((prev) =>
      prev.filter((item) => item.id !== tempId)
    );

    throw error;
  }
}

// ==========================================================
// Salários
// ==========================================================

export async function adicionarSalarioOptimistic(
  salario: NovoSalario,
  setSalarios: React.Dispatch<React.SetStateAction<Salario[]>>
) {
  const tempId = `TEMP_${Date.now()}`;

  const temporario: Salario = {
    ...salario,
    id: tempId,
  };

  // Aparece imediatamente na interface
  setSalarios((prev) => [...prev, temporario]);

  try {
    const criado = await FinanceService.criarSalario(salario);

    // Troca o temporário pelo salário retornado pelo backend
    setSalarios((prev) =>
      prev.map((item) =>
        item.id === tempId ? criado : item
      )
    );

    return criado;
  } catch (error) {
    // Rollback
    setSalarios((prev) =>
      prev.filter((item) => item.id !== tempId)
    );

    throw error;
  }
}
