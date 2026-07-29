import { API } from "./endpoints";
import type {
  NovoSalario,
  Salario,
  Transacao,
  Divida,
  NovaDivida,
  OcorrenciaDivida,
} from "../features/financas/types";

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
type RequestBody = Record<string, JsonValue | undefined>;

function getBaseUrl() {
  if (!API.BASE_URL) {
    throw new Error("Configure EXPO_PUBLIC_API_BASE_URL no arquivo .env");
  }

  return API.BASE_URL;
}

// ======================================================
// GET
// ======================================================

async function get(resource: string, id?: string) {
  const baseUrl = getBaseUrl();

  const url =
    `${baseUrl}?resource=${resource}` +
    (id ? `&id=${encodeURIComponent(id)}` : "");

  const response = await fetch(url);

  const text = await response.text();

  if (!response.ok) {
    throw new Error(text);
  }

  const json = JSON.parse(text);

  if (!json.success) {
    throw new Error(json.message || "Erro na API");
  }

  return json.data;
}

// ======================================================
// POST
// ======================================================

async function post(resource: string, body: RequestBody) {
  const baseUrl = getBaseUrl();

  const response = await fetch(
    `${baseUrl}?resource=${resource}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  const text = await response.text();

  if (!response.ok) {
    throw new Error(text);
  }

  const json = JSON.parse(text);

  if (!json.success) {
    throw new Error(json.message || "Erro na API");
  }

  return json.data;
}

export const api = {
  // ====================================================
  // TRANSAÇÕES
  // ====================================================

  getTransactions() {
    return get("transactions");
  },

  getTransaction(id: string) {
    return get("transactions", id);
  },

  createTransaction(data: Transacao) {
    return post("transactions", {
      action: "create",
      ...data,
    });
  },

  updateTransaction(data: Transacao) {
    return post("transactions", {
      action: "update",
      ...data,
    });
  },

  deleteTransaction(id: string) {
    return post("transactions", {
      action: "delete",
      id,
    });
  },

  // ====================================================
  // SALÁRIOS
  // ====================================================

  getSalarios() {
    return get("salaries");
  },

  getSalario(id: string) {
    return get("salaries", id);
  },

  createSalario(data: NovoSalario) {
    return post("salaries", {
      action: "create",
      ...data,
    });
  },

  updateSalario(data: Salario) {
    return post("salaries", {
      action: "update",
      ...data,
    });
  },

  deleteSalario(id: string) {
    return post("salaries", {
      action: "delete",
      id,
    });
  },

  // ====================================================
  // DÍVIDAS
  // ====================================================

  getDividas() {
    return get("debts");
  },

  getDivida(id: string) {
    return get("debts", id);
  },

  createDivida(data: NovaDivida) {
    return post("debts", {
      action: "create",
      ...data,
    });
  },

  updateDivida(data: Divida) {
    return post("debts", {
      action: "update",
      ...data,
    });
  },

  deleteDivida(id: string) {
    return post("debts", {
      action: "delete",
      id,
    });
  },

  // ====================================================
  // OCORRÊNCIAS DAS DÍVIDAS
  // ====================================================

  getOcorrenciasDividas() {
    return get("debtoccurrences");
  },

  getOcorrenciaDivida(id: string) {
    return get("debtoccurrences", id);
  },

  ensureDebtOccurrencesMonth(competencia: string) {
    return post("debtoccurrences", {
      action: "ensureMonth",
      competencia,
    });
  },

  updateOcorrenciaDivida(data: OcorrenciaDivida) {
    return post("debtoccurrences", {
      action: "update",
      ...data,
    });
  },

  deleteOcorrenciaDivida(id: string) {
    return post("debtoccurrences", {
      action: "delete",
      id,
    });
  },
};

export default api;
