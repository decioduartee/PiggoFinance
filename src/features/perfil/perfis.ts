export type PerfilId = "decio" | "thaina";

export type PerfilUsuario = {
  id: PerfilId;
  nome: string;
  inicial: string;
  cor: string;
};

export const PERFIS: PerfilUsuario[] = [
  {
    id: "decio",
    nome: "Décio",
    inicial: "D",
    cor: "#7ed957",
  },
  {
    id: "thaina",
    nome: "Thaina",
    inicial: "T",
    cor: "#8b6fd4",
  },
];

export const PERFIL_STORAGE_KEY = "@financas:perfil_usuario";
