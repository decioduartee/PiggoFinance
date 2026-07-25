import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { CORAL, LIME_DARK } from "../../theme/colors";
import Valor from "../../components/Valor";
import { letraMaiuscula } from "../../utils/formatadores";
import { styles } from "./styles";
import { Transacao } from "../../features/financas";
import SwipeAction from "../../components/SwipeAction";
import { renderizarIconeCategoria } from "../../constants/categorias";
import useFinance from "../../hooks/useFinance";

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
        <View
          style={[
            styles.icone,
            {
              backgroundColor: "#f3f4f6",
            },
          ]}
        >
          {renderizarIconeCategoria(item.categoria, modoEscuro)}
        </View>

        <View style={styles.info}>
          <Text numberOfLines={1} style={styles.nome}>
            {letraMaiuscula(item.nome)}
          </Text>

          <Text style={styles.categoria}>{item.categoria}</Text>
        </View>

        <Valor
          valor={Math.abs(item.valor)}
          oculto={oculto}
          negativo={item.valor < 0}
          cor={item.valor < 0 ? CORAL : LIME_DARK}
          style={styles.valor}
        />
      </TouchableOpacity>
    </SwipeAction>
  );
}
