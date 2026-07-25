import { temaCores } from "../../theme/colors";

export type GraficoCores = ReturnType<typeof temaCores>;

export interface GraficoSaldoItem {
  label: string;
  data: string;
  dataFormatada: string;
  gastoDia: number;
  saldo: number;
  gastos: number;
}

export interface GraficoSaldoProps {
  data: GraficoSaldoItem[];
  cores: GraficoCores;
  oculto: boolean;
}
