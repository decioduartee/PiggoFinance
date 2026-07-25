import AsyncStorage from "@react-native-async-storage/async-storage";

export async function salvarItem<T>(chave: string, valor: T) {
  try {
    const json = JSON.stringify(valor);
    await AsyncStorage.setItem(chave, json);
  } catch (error) {
    console.log("Erro ao salvar no storage:", error);
    throw error;
  }
}

export async function buscarItem<T>(chave: string): Promise<T | null> {
  try {
    const json = await AsyncStorage.getItem(chave);

    if (!json) return null;

    return JSON.parse(json) as T;
  } catch (error) {
    console.log("Erro ao buscar no storage:", error);
    return null;
  }
}

export async function removerItem(chave: string) {
  try {
    await AsyncStorage.removeItem(chave);
  } catch (error) {
    console.log("Erro ao remover do storage:", error);
    throw error;
  }
}

export async function limparStorage() {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.log("Erro ao limpar storage:", error);
    throw error;
  }
}
