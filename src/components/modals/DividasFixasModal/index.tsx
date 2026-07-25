import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  Pressable,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Pencil, Trash2, CreditCard, Repeat } from "lucide-react-native";
import { PURPLE, temaCores } from "../../../theme/colors";
import {
  formatBRL,
  letraMaiuscula,
  textoParaValorBRL,
} from "../../../utils/formatadores";
import useFinance from "../../../hooks/useFinance";
import { createStyles } from "./styles";

export type Divida = {
  id: string;
  nome: string;
  valor: number;
  ativa: boolean;

  cartao: boolean;

  parcelas: number;
  parcelasPagas: number;

  vencimento?: string;
};

type Props = {
  visivel: boolean;
  dividas: Divida[];
  onFechar: () => void;
  onSalvar: (divida: Divida) => void;
  onExcluir: (id: string) => void;
  onAlterarStatus: (id: string, ativa: boolean) => void;
};

export default function DividasFixasModal({
  visivel,
  dividas,
  onFechar,
  onSalvar,
  onExcluir,
  onAlterarStatus,
}: Props) {
  const [id, setId] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [valor, setValor] = useState("");
  const [cartao, setCartao] = useState(false);
  const [parcelas, setParcelas] = useState("");
  const [parcelasPagas, setParcelasPagas] = useState("");
  const [vencimento, setVencimento] = useState("");

  const { modoEscuro } = useFinance();
  const cores = temaCores(modoEscuro);
  const insets = useSafeAreaInsets();
  const styles = useMemo(
    () => createStyles(cores, insets.bottom),
    [cores, insets.bottom],
  );

  useEffect(() => {
    if (!visivel) limpar();
  }, [visivel]);

  function limpar() {
    setId(null);
    setNome("");
    setValor("");
    setCartao(false);
    setParcelas("");
    setParcelasPagas("");
    setVencimento("");
  }

  function fechar() {
    Keyboard.dismiss();
    onFechar();
  }

  function editar(item: Divida) {
    setId(item.id);
    setNome(item.nome);
    setValor(String(item.valor));
    setCartao(item.cartao);
    setParcelas(String(item.parcelas));
    setParcelasPagas(String(item.parcelasPagas));
    setVencimento(item.vencimento ?? "");
  }

  function salvar() {
    const numero = Number(valor);

    if (!nome.trim()) return;
    if (isNaN(numero)) return;

    Keyboard.dismiss();
    onSalvar({
      id: id ?? String(Date.now()),
      nome,
      valor: numero,
      ativa: true,
      cartao,
      parcelas: Number(parcelas),
      parcelasPagas: Number(parcelasPagas),
      vencimento,
    });

    limpar();
  }

  function alterarValor(texto: string) {
    setValor(textoParaValorBRL(texto));
  }

  const valorExibido = valor === "" ? "0,00" : formatBRL(Number(valor));

  const total = useMemo(() => {
    return dividas.filter((d) => d.ativa).reduce((s, d) => s + d.valor, 0);
  }, [dividas]);

  return (
    <Modal
      visible={visivel}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={fechar}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={fechar} />

        <KeyboardAvoidingView
          style={styles.modalWrapper}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modal}>
            <KeyboardAwareScrollView
              enableOnAndroid
              enableAutomaticScroll
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scroll}
            >
              <Text style={styles.titulo}>Dívidas Fixas</Text>

            <Text style={styles.section}>Dívidas cadastradas</Text>

            {dividas.length === 0 && (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>Nenhuma dívida cadastrada.</Text>
              </View>
            )}

            {dividas.map((item) => (
              <View key={item.id} style={styles.card}>
                <View style={{ flex: 1 }}>
                  <View style={styles.cardHeader}>
                    {item.cartao ? (
                      <CreditCard size={16} color={cores.GRAY} />
                    ) : (
                      <Repeat size={16} color={cores.GRAY} />
                    )}

                    <Text style={styles.cardTitulo}>
                      {letraMaiuscula(item.nome)}
                    </Text>
                  </View>

                  <Text style={styles.cardValor}>
                    R$ {item.valor.toFixed(2).replace(".", ",")}
                  </Text>

                  {item.cartao && (
                    <Text style={styles.cardInfo}>
                      Parcela {item.parcelasPagas}/{item.parcelas}
                    </Text>
                  )}

                  {!item.cartao && item.vencimento !== "" && (
                    <Text style={styles.cardInfo}>
                      Vencimento: {item.vencimento}
                    </Text>
                  )}
                </View>

                <Switch
                  value={item.ativa}
                  onValueChange={(v) => onAlterarStatus(item.id, v)}
                  trackColor={{
                    false: "#DDD",
                    true: PURPLE,
                  }}
                  thumbColor={cartao ? PURPLE : "#DDD"}
                />

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.iconButton}
                  onPress={() => editar(item)}
                >
                  <Pencil size={18} color={cores.INK} />
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.iconButton}
                  onPress={() => onExcluir(item.id)}
                >
                  <Trash2 size={18} color={PURPLE} />
                </TouchableOpacity>
              </View>
            ))}

            <Text style={styles.section}>
              {id ? "Editar dívida" : "Nova dívida"}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Nome da dívida"
              placeholderTextColor={cores.GRAY}
              value={nome}
              onChangeText={setNome}
            />

            <TextInput
              style={styles.input}
              placeholder="Valor mensal"
              placeholderTextColor={cores.GRAY}
              keyboardType="decimal-pad"
              value={valorExibido}
              onChangeText={alterarValor}
            />

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>É uma compra parcelada?</Text>

              <Switch
                value={cartao}
                onValueChange={setCartao}
                trackColor={{
                  false: "#DDD",
                  true: PURPLE,
                }}
                thumbColor={cartao ? PURPLE : "#DDD"}
              />
            </View>
            {cartao && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Total de parcelas"
                  placeholderTextColor={cores.GRAY}
                  keyboardType="number-pad"
                  value={parcelas}
                  onChangeText={setParcelas}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Parcelas pagas"
                  placeholderTextColor={cores.GRAY}
                  keyboardType="number-pad"
                  value={parcelasPagas}
                  onChangeText={setParcelasPagas}
                />
              </>
            )}

            {!cartao && (
              <TextInput
                style={styles.input}
                placeholder="Vencimento (opcional)"
                placeholderTextColor={cores.GRAY}
                value={vencimento}
                onChangeText={setVencimento}
              />
            )}

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.botaoSalvar}
              onPress={salvar}
            >
              <Text style={styles.botaoSalvarTexto}>
                {id ? "Atualizar dívida" : "Adicionar dívida"}
              </Text>
            </TouchableOpacity>

            <View style={styles.resumo}>
              <View style={styles.resumoLinha}>
                <Text style={styles.resumoLabel}>Dívidas ativas</Text>

                <Text style={styles.resumoValor}>
                  {dividas.filter((d) => d.ativa).length}
                </Text>
              </View>

              <View style={styles.resumoLinha}>
                <Text style={styles.resumoLabel}>Total mensal</Text>

                <Text style={[styles.resumoValor, { color: PURPLE }]}>
                  R$ {total.toFixed(2).replace(".", ",")}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.botaoFechar}
              activeOpacity={0.85}
              onPress={fechar}
            >
              <Text style={styles.botaoFecharTexto}>Cancelar</Text>
            </TouchableOpacity>
            </KeyboardAwareScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
