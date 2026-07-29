import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { CheckCircle2, ClockAlert, Repeat2 } from "lucide-react-native";
import { LIME, PURPLE, CORAL } from "../../theme/colors";
import ValorBlur from "../../components/ValorBlur";
import type { Divida } from "../../features/financas/types";
import type { ThemeColors } from "../../theme/colors";
import type { createStyles } from "./styles";
import { dividaParcelada, totalParcelas } from "./utils";

type DividasStyles = ReturnType<typeof createStyles>;

export function CardResumo({
  tipo,
  titulo,
  valor,
  quantidade,
  oculto,
  cores,
  styles,
}: {
  tipo: "pago" | "pendente";
  titulo: string;
  valor: number;
  quantidade: number;
  oculto: boolean;
  cores: ThemeColors;
  styles: DividasStyles;
}) {
  const pago = tipo === "pago";

  return (
    <View style={[styles.resumoCard, { backgroundColor: cores.CARD }]}>
      <View
        style={[
          styles.resumoIcone,
          {
            backgroundColor: pago
              ? cores.LIME_BG
              : (cores.CORAL_BG ?? cores.CARD),
          },
        ]}
      >
        {pago ? (
          <CheckCircle2 size={22} color={LIME} strokeWidth={2.2} />
        ) : (
          <ClockAlert size={22} color={CORAL} strokeWidth={2.2} />
        )}
      </View>

      <Text style={[styles.resumoTitulo, { color: cores.GRAY }]}>
        {titulo} {quantidade}
      </Text>

      <ValorBlur
        valor={valor}
        oculto={oculto}
        cor={pago ? cores.LIME : cores.PURPLE}
        shrink
        style={styles.resumoValor}
      />
    </View>
  );
}

export function LinhaDivida({
  divida,
  valor,
  numeroParcela,
  pago,
  oculto,
  atualizando,
  onPressStatus,
  cores,
  styles,
}: {
  divida: Divida;
  valor: number;
  numeroParcela?: number;
  pago: boolean;
  oculto: boolean;
  atualizando: boolean;
  onPressStatus: () => void;
  cores: ThemeColors;
  styles: DividasStyles;
}) {
  const parcelada = dividaParcelada(divida);
  const total = totalParcelas(divida);

  return (
    <View style={[styles.card, { backgroundColor: cores.CARD }]}>
      <View style={styles.iconeDivida}>
        <Repeat2 size={20} color={PURPLE} strokeWidth={2} />
      </View>

      <View style={styles.conteudoDivida}>
        <Text
          numberOfLines={1}
          style={[styles.nomeDivida, { color: cores.INK }]}
        >
          {divida.nome}
        </Text>

        <ValorBlur
          valor={valor}
          oculto={oculto}
          cor={cores.INK}
          shrink
          style={styles.valorDivida}
        />

        <Text style={[styles.tipoDivida, { color: cores.GRAY }]}>
          {parcelada
            ? `Parcela ${numeroParcela ?? "-"}/${total || "-"}`
            : "Recorrente"}
        </Text>
      </View>

      {pago ? (
        <View
          style={[
            styles.statusPagoBadge,
            {
              backgroundColor: cores.LIME_BG,
              borderColor: LIME,
            },
          ]}
        >
          <CheckCircle2 size={21} color={LIME} strokeWidth={2.5} />
        </View>
      ) : (
        <TouchableOpacity
          activeOpacity={0.78}
          disabled={atualizando}
          onPress={onPressStatus}
          style={[
            styles.statusButton,
            styles.statusButtonPendente,
            {
              borderColor: PURPLE,
              opacity: atualizando ? 0.55 : 1,
            },
          ]}
        >
          <Text style={[styles.statusTexto, { color: "#fff" }]}>Pendente</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
