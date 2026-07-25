import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  PERFIL_STORAGE_KEY,
  PERFIS,
  type PerfilId,
  type PerfilUsuario,
} from "./perfis";

export async function salvarPerfilUsuario(perfilId: PerfilId) {
  await AsyncStorage.setItem(PERFIL_STORAGE_KEY, perfilId);
}

export async function buscarPerfilUsuario(): Promise<PerfilUsuario | null> {
  const perfilId = await AsyncStorage.getItem(PERFIL_STORAGE_KEY);

  if (!perfilId) return null;

  const perfil = PERFIS.find((item) => item.id === perfilId);

  return perfil ?? null;
}

export async function limparPerfilUsuario() {
  await AsyncStorage.removeItem(PERFIL_STORAGE_KEY);
}
