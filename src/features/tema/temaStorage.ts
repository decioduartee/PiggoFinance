import AsyncStorage from "@react-native-async-storage/async-storage";

const TEMA_STORAGE_KEY = "@piggo:modoEscuro";

export async function salvarModoEscuro(ativo: boolean) {
  await AsyncStorage.setItem(TEMA_STORAGE_KEY, JSON.stringify(ativo));
}

export async function buscarModoEscuro(): Promise<boolean> {
  const valor = await AsyncStorage.getItem(TEMA_STORAGE_KEY);

  if (valor === null) {
    return false;
  }

  return JSON.parse(valor);
}
