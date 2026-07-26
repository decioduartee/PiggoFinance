export const LIME = "#9fe042";
export const LIME_DARK = "#7ed957";
export const CORAL = "#ff5c7a";
export const GOLD = "#c9a050";
export const PURPLE = "#8b6fd4";
export const PURPLELIGHT = "#eee9f8";
export const ORANGE = "#F59E0B";

export const ICON_INK = "#16181a";
export const ICON_LIME_BG = "#f1fbe2";

export function temaCores(escuro: boolean) {
  return escuro
    ? {
        BG: "#14171a",
        CARD: "#1f2227",
        SUB_CARD: "#33373d",
        INK: "#f3f1ea",
        PAPER_TXT: "#16181a",
        GRAY: "#9a9da3",
        CORAL_BG: "#3a2128",
        LIME_BG: "#1f2c1c",
        LINE_DASH: "#33373d",
        LIMEBOTAO: "#7ed957",
        TRANSPARENT: "transparent"
      }
    : {
        BG: "#fafaf8",
        CARD: "#ffffff",
        SUB_CARD: "#fafaf8",
        INK: "#16181a",
        PAPER_TXT: "#fafaf8",
        GRAY: "#3d3d3d",
        CORAL_BG: "#ffeaee",
        LIME_BG: "#f1fbe2",
        LINE_DASH: "#ededeb",
        LIMEBOTAO: "#16181a",
        TRANSPARENT: "#16181a"
      };
}
