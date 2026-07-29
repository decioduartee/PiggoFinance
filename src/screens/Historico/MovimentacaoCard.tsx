import React, { useMemo } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { CORAL, LIME_DARK } from "../../theme/colors";
import Valor from "../../components/ValorBlur";
import { letraMaiuscula } from "../../utils/formatadores";
import type { Transacao } from "../../features/financas/types";
import SwipeAction from "../../components/SwipeAction";
import { renderizarIconeCategoria } from "../../constants/categorias";
import useFinance from "../../hooks/useFinance";

import { createStyles } from "./styles";

type Props = {
  item: Transacao;
  oculto: boolean;
  onEditar: (item: Transacao) => void;
  onExcluir: (id: string) => void;
};

export default function MovimentacaoCard({
  item,
  oculto,
  onEditar,
  onExcluir,
}: Props) {
  const { modoEscuro } = useFinance();

  const styles = useMemo(
    () => createStyles(modoEscuro),
    [modoEscuro],
  );

  const negativo =
    item.tipo === "saida" || Number(item.valor) < 0;

  return (
    <SwipeAction
      onEdit={() => onEditar(item)}
      onDelete={() => onExcluir(item.id)}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.linha}
        onPress={() => onEditar(item)}
      >
        <View style={styles.icone}>
          {renderizarIconeCategoria(item.categoria, modoEscuro)}
        </View>

        <View style={styles.info}>
          <Text numberOfLines={1} style={styles.nome}>
            {letraMaiuscula(item.nome)}
          </Text>

          <Text style={styles.categoria}>
            {item.categoria}
          </Text>
        </View>

        <Valor
          valor={Math.abs(Number(item.valor) || 0)}
          oculto={oculto}
          negativo={negativo}
          cor={negativo ? CORAL : LIME_DARK}
          style={styles.valor}
        />
      </TouchableOpacity>
    </SwipeAction>
  );
}
