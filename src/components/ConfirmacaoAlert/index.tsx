import React from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { BlurView } from "expo-blur";
import { Check, Info, Trash2 } from "lucide-react-native";

import useFinance from "../../hooks/useFinance";
import { CORAL, LIME_DARK, PURPLE, temaCores } from "../../theme/colors";

import { createStyles } from "./styles";

export type ConfirmacaoAlertTipo = "success" | "danger" | "info";

type Props = {
  visivel: boolean;
  tipo?: ConfirmacaoAlertTipo;
  titulo: string;
  mensagem: string;
  textoCancelar?: string;
  textoConfirmar?: string;
  onCancelar: () => void;
  onConfirmar?: () => void;
};

export default function ConfirmacaoAlert({
  visivel,
  tipo = "info",
  titulo,
  mensagem,
  textoCancelar = "Cancelar",
  textoConfirmar = "Confirmar",
  onCancelar,
  onConfirmar,
}: Props) {
  const { modoEscuro } = useFinance();
  const cores = temaCores(modoEscuro);
  const styles = createStyles(cores, tipo);

  const corAcao =
    tipo === "danger" ? CORAL : tipo === "success" ? LIME_DARK : PURPLE;

  function confirmar() {
    onConfirmar?.();
    onCancelar();
  }

  return (
    <Modal
      visible={visivel}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancelar}
    >
      <View style={styles.overlay}>
        <BlurView
          intensity={42}
          tint={modoEscuro ? "dark" : "light"}
          experimentalBlurMethod="dimezisBlurView"
          style={styles.blur}
        />

        <Pressable style={styles.backdrop} onPress={onCancelar} />

        <View style={styles.alert}>
          <View style={styles.header}>
            <View style={styles.iconeBox}>
              {tipo === "danger" ? (
                <Trash2 size={18} color={CORAL} strokeWidth={2.4} />
              ) : tipo === "success" ? (
                <Check size={19} color={LIME_DARK} strokeWidth={2.4} />
              ) : (
                <Info size={18} color={PURPLE} strokeWidth={2.4} />
              )}
            </View>

            <Text style={styles.titulo}>{titulo}</Text>
          </View>

          <Text style={styles.mensagem}>{mensagem}</Text>

          <View style={styles.acoes}>
            <Pressable
              accessibilityRole="button"
              onPress={onCancelar}
              style={styles.botao}
            >
              <Text style={[styles.textoAcao, { color: PURPLE }]}>
                {textoCancelar.toUpperCase()}
              </Text>
            </Pressable>

            {onConfirmar ? (
              <Pressable
                accessibilityRole="button"
                onPress={confirmar}
                style={styles.botao}
              >
                <Text style={[styles.textoAcao, { color: corAcao }]}>
                  {textoConfirmar.toUpperCase()}
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
}
