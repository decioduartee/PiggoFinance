import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Coins, PiggyBank } from "lucide-react-native";

import { CORAL, LIME } from "../../../theme/colors";
import useFinance from "../../../hooks/useFinance";
import { formatBRL, textoParaValorBRL } from "../../../utils/formatadores";
import { createStyles } from "./styles";

type Props = {
  visivel: boolean;
  valorAtual: number;

  onFechar: () => void;

  onSalvar: (tipo: "deposito" | "saque", valor: number) => void;
};

export default function CofrinhoModal({
  visivel,
  valorAtual,
  onFechar,
  onSalvar,
}: Props) {
  const [tipo, setTipo] = useState<"deposito" | "saque">("deposito");
  const [valor, setValor] = useState("");
  const [motivo, setMotivo] = useState("");

  const { modoEscuro } = useFinance();
  const insets = useSafeAreaInsets();
  const styles = useMemo(
    () => createStyles(modoEscuro, insets.bottom),
    [modoEscuro, insets.bottom],
  );

  const isSacar = tipo === "saque";

  useEffect(() => {
    if (!visivel) {
      limpar();
    }
  }, [visivel]);

  function limpar() {
    setValor("");
    setMotivo("");
    setTipo("deposito");
  }

  function alterarValor(texto: string) {
    setValor(textoParaValorBRL(texto));
  }

  function cancelar() {
    Keyboard.dismiss();
    limpar();
    onFechar();
  }

  function salvar() {
    const numero = valor === "" ? 0 : Number(valor);

    if (isNaN(numero) || numero <= 0) return;

    Keyboard.dismiss();
    onSalvar(tipo, numero);

    if (isSacar) {
      setValor("");
      setMotivo("");
      setTipo("deposito");
      return;
    }

    limpar();
    onFechar();
  }

  const valorExibido = valor === "" ? "0,00" : formatBRL(Number(valor));

  return (
    <Modal
      visible={visivel}
      transparent
      statusBarTranslucent
      animationType="slide"
      onRequestClose={cancelar}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={cancelar} />

        <KeyboardAvoidingView
          style={styles.modalWrapper}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modal}>
            <KeyboardAwareScrollView
              enableOnAndroid
              enableAutomaticScroll
              extraScrollHeight={28}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalContent}
            >
              <View style={styles.header}>
                <View style={styles.headerTitulo}>
                  <PiggyBank size={28} color={LIME} strokeWidth={1.8} />
                  <Text style={styles.titulo}>Cofrinho</Text>
                </View>
              </View>

              <View style={styles.tabsArea}>
                <View style={styles.tabs}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => setTipo("deposito")}
                    style={[
                      styles.tabBotao,
                      !isSacar && styles.tabSelecionada,
                    ]}
                  >
                    <Text
                      style={[
                        styles.tabTexto,
                        !isSacar && styles.tabTextoSelecionado,
                      ]}
                    >
                      Guardar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => setTipo("saque")}
                    style={[
                      styles.tabBotao,
                      isSacar && styles.tabSelecionada,
                    ]}
                  >
                    <Text
                      style={[
                        styles.tabTexto,
                        isSacar && styles.tabTextoSelecionado,
                      ]}
                    >
                      Sacar
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.descricao}>
                {isSacar
                  ? "Registre quanto você retirou do cofrinho."
                  : "Registre quanto você guardou neste mês."}
              </Text>

              <View style={styles.saldoCard}>
                <View style={styles.saldoInfo}>
                  <Text style={styles.saldoTitulo}>
                    Total guardado no cofrinho
                  </Text>
                  <Text style={styles.saldoValor}>
                    R$ {formatBRL(valorAtual)}
                  </Text>
                </View>

                <View style={styles.iconeGrande}>
                  <PiggyBank size={34} color={LIME} strokeWidth={1.6} />
                  <View style={styles.moedaBadge}>
                    <Coins size={12} color={LIME} />
                  </View>
                </View>
              </View>

              <View style={styles.campoArea}>
                <Text style={styles.label}>
                  {isSacar
                    ? "Quanto você quer sacar?"
                    : "Quanto você guardou?"}
                </Text>

                <View style={styles.valorBox}>
                  <TextInput
                    inputMode="numeric"
                    keyboardType="number-pad"
                    value={valorExibido}
                    onChangeText={alterarValor}
                    style={styles.valorInput}
                    placeholder="0,00"
                    placeholderTextColor={styles.placeholder.color}
                  />
                </View>
              </View>

              {isSacar && (
                <View style={styles.campoArea}>
                  <Text style={styles.label}>Motivo do saque</Text>

                  <TextInput
                    value={motivo}
                    onChangeText={setMotivo}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    placeholder="Conte brevemente por que está retirando esse valor."
                    placeholderTextColor={styles.placeholder.color}
                    style={styles.motivoInput}
                  />
                </View>
              )}

              <View style={styles.botoes}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={salvar}
                  style={[
                    styles.botaoPrincipal,
                    {
                      backgroundColor: isSacar ? CORAL : LIME,
                    },
                  ]}
                >
                  <Text style={styles.botaoPrincipalTexto}>
                    {isSacar ? "Sacar" : "Salvar"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.botaoCancelar}
                  onPress={cancelar}
                >
                  <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAwareScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
