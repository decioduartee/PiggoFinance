export const palette = {
  lime: "#9fe042",
  limeDark: "#7ed957",
  coral: "#ff5c7a",
  gold: "#c9a050",
  purple: "#8b6fd4",
  purpleStrong: "#7b6ff0",
  purpleLight: "#eee9f8",
  purpleDarkSurface: "#2b2538",
  orange: "#F59E0B",
  white: "#ffffff",
  whiteLegacy: "#ffff",
  ink: "#16181a",
  paper: "#fafaf8",
  gray50: "#f2f0eb",
  gray100: "#F3F2EE",
  gray200: "#e8e4d8",
  gray300: "#d8d4c6",
  gray400: "#a3a3a3",
  gray500: "#8b8f94",
  gray600: "#777b82",
  gray700: "#3d3d3d",
  darkBg: "#14171a",
  darkCard: "#1f2227",
  darkSubCard: "#33373d",
  darkInk: "#f3f1ea",
  black: "#000000",
  transparent: "transparent",
  overlay: "rgba(0,0,0,0.35)",
  overlayStrong: "rgba(23,23,23,0.60)",
  blurLight: "rgba(255,255,255,0.12)",
  blurDark: "rgba(20,20,20,0.18)",
} as const;

export const semanticColors = {
  income: palette.limeDark,
  expense: palette.coral,
  debt: palette.purple,
  warning: palette.orange,
  success: palette.lime,
  text: palette.ink,
  textInverse: palette.white,
  mutedLight: palette.gray500,
  mutedDark: "#9a9da3",
} as const;

export const LIME = palette.lime;
export const LIME_DARK = palette.limeDark;
export const CORAL = palette.coral;
export const GOLD = palette.gold;
export const PURPLE = palette.purple;
export const PURPLELIGHT = palette.purpleLight;
export const ORANGE = palette.orange;
export const WHITE = palette.whiteLegacy;

export const ICON_INK = palette.ink;
export const ICON_LIME_BG = "#f1fbe2";

export function temaCores(escuro: boolean) {
  return escuro
    ? {
        BG: palette.darkBg,
        CARD: palette.darkCard,
        SUB_CARD: palette.darkSubCard,
        INK: palette.darkInk,
        PAPER_TXT: palette.ink,
        GRAY: semanticColors.mutedDark,
        CORAL_BG: "#3a2128",
        LIME_BG: "#1f2c1c",
        LIMEBOTAO: palette.limeDark,
        LINE_DASH: palette.darkSubCard,
        TRANSPARENT: palette.transparent,
        LIME,
        LIME_DARK,
        CORAL,
        GOLD,
        PURPLE,
        PURPLELIGHT,
        ORANGE,
        WHITE: palette.white,
        OVERLAY: palette.overlay,
      }
    : {
        BG: palette.paper,
        CARD: palette.white,
        SUB_CARD: palette.paper,
        INK: palette.ink,
        PAPER_TXT: palette.paper,
        GRAY: palette.gray700,
        CORAL_BG: "#ffeaee",
        LIME_BG: ICON_LIME_BG,
        LIMEBOTAO: palette.ink,
        LINE_DASH: palette.gray200,
        TRANSPARENT: palette.ink,
        LIME,
        LIME_DARK,
        CORAL,
        GOLD,
        PURPLE,
        PURPLELIGHT,
        ORANGE,
        WHITE: palette.white,
        OVERLAY: palette.overlay,
      };
}

export type ThemeColors = ReturnType<typeof temaCores>;
