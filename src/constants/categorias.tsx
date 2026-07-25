import React from "react";
import {
  Handshake,
  HeartPulse,
  Home,
  LucideIcon,
  Send,
  ShoppingBag,
  ShoppingCart,
  UtensilsCrossed,
  Zap,
} from "lucide-react-native";

export type Categoria =
  | "Transferência"
  | "Mercado"
  | "Compras"
  | "Comida"
  | "Moradia"
  | "Saúde"
  | "Assinaturas"
  | "Outros";

type CategoriaConfig = {
  nome: Categoria;
  Icone: LucideIcon;
  corClaro: string;
  corEscuro: string;
};

export const categorias: CategoriaConfig[] = [
  {
    nome: "Transferência",
    Icone: Send,
    corClaro: "#3bb547",
    corEscuro: "#7ed957",
  },
  {
    nome: "Mercado",
    Icone: ShoppingCart,
    corClaro: "#3b6db5",
    corEscuro: "#73a7ff",
  },
  {
    nome: "Compras",
    Icone: ShoppingBag,
    corClaro: "#16181a",
    corEscuro: "#f3f1ea",
  },
  {
    nome: "Comida",
    Icone: UtensilsCrossed,
    corClaro: "#c2641a",
    corEscuro: "#ffad5c",
  },
  {
    nome: "Moradia",
    Icone: Home,
    corClaro: "#7f8f24",
    corEscuro: "#d3e85f",
  },
  {
    nome: "Saúde",
    Icone: HeartPulse,
    corClaro: "#d83f66",
    corEscuro: "#ff7f9f",
  },
  {
    nome: "Assinaturas",
    Icone: Handshake,
    corClaro: "#8b3bb5",
    corEscuro: "#c78cff",
  },
  {
    nome: "Outros",
    Icone: Zap,
    corClaro: "#16181a",
    corEscuro: "#f3f1ea",
  },
];

export function pegarCategoria(nome: string) {
  return (
    categorias.find((categoria) => categoria.nome === nome) ??
    categorias.find((categoria) => categoria.nome === "Outros")!
  );
}

export function renderizarIconeCategoria(
  nome: string,
  modoEscuro: boolean,
  tamanho = 17,
) {
  const categoria = pegarCategoria(nome);
  const cor = modoEscuro ? categoria.corEscuro : categoria.corClaro;

  return <categoria.Icone size={tamanho} color={cor} />;
}
