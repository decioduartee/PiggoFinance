import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ChevronRight,
  Plus,
  FileText,
} from "lucide-react-native";
import SwipeAction from "../../SwipeAction";
import { LIME, PURPLE, temaCores } from "../../../theme/colors";
import useFinance from "../../../hooks/useFinance";
import { formatBRL, textoParaValorBRL } from "../../../utils/formatadores";
import { createStyles } from "./styles";

type Salario = {
  id: string;
  nome: string;
  valor: number;
  data: string;
};

type Divida = {
  id: string;
  nome: string;
  valor: number;
  ativa: boolean;
};

type Props = {
  visivel: boolean;
  salarios: Salario[];
  dividas: Divida[];

  onFechar: () => void;

  onAbrirDividas: () => void;

  onSalvarSalario: (id: string | null, nome: string, valor: number) => void;

  onApagarSalario: (id: string) => void;
};

export default function FluxoCaixaModal({
  visivel,
  salarios,
  dividas,
  onFechar,
  onAbrirDividas,
  onSalvarSalario,
  onApagarSalario,
}: Props) {
  const [idEdicao, setIdEdicao] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [valor, setValor] = useState("");

  const { modoEscuro } = useFinance();
  const cores = temaCores(modoEscuro);
  const insets = useSafeAreaInsets();
  const styles = useMemo(
    () => createStyles(cores, insets.bottom),
    [cores, insets.bottom],
  );

  useEffect(() => {
    if (!visivel) {
      limpar();
    }
  }, [visivel]);

  function limpar() {
    setIdEdicao(null);
    setNome("");
    setValor("");
  }

  function fechar() {
    Keyboard.dismiss();
    onFechar();
  }

  function editar(item: Salario) {
    setIdEdicao(item.id);
    setNome(item.nome);
    setValor(String(item.valor));
  }

  function salvar() {
    const numero = Number(valor);

    if (!nome.trim()) return;

    if (isNaN(numero)) return;

    Keyboard.dismiss();
    onSalvarSalario(idEdicao, nome.trim(), numero);

    limpar();
  }

  function alterarValor(texto: string) {
    setValor(textoParaValorBRL(texto));
  }

  const valorExibido = valor === "" ? "0,00" : formatBRL(Number(valor));

  const totalSalarios = useMemo(() => {
    return salarios.reduce((soma, item) => soma + item.valor, 0);
  }, [salarios]);

  const totalDividas = useMemo(() => {
    return dividas
      .filter((d) => d.ativa)
      .reduce((soma, item) => soma + item.valor, 0);
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
              <Text style={styles.titulo}>Fluxo de Caixa</Text>

            <Text style={styles.section}>Salários cadastrados</Text>

            {salarios.length === 0 && (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>Nenhum salário cadastrado.</Text>
              </View>
            )}

            {salarios.map((item) => (
              <SwipeAction
                key={item.id}
                onEdit={() => editar(item)}
                onDelete={() => onApagarSalario(item.id)}
              >
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={styles.card}
                  onPress={() => editar(item)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitulo}>{item.nome}</Text>

                    <Text style={styles.cardValor}>
                      R$ {item.valor.toFixed(2).replace(".", ",")}
                    </Text>
                  </View>
                </TouchableOpacity>
              </SwipeAction>
            ))}

            <Text style={styles.section}>
              {idEdicao ? "Editar salário" : "Novo salário"}
            </Text>

            <TextInput
              placeholder="Nome"
              placeholderTextColor={cores.GRAY}
              style={styles.input}
              value={nome}
              onChangeText={setNome}
            />

            <TextInput
              placeholder="Valor"
              placeholderTextColor={cores.GRAY}
              keyboardType="decimal-pad"
              style={styles.input}
              value={valorExibido}
              onChangeText={alterarValor}
            />

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.botaoSalvar}
              onPress={salvar}
            >
              <Plus size={18} color="#FFF" />

              <Text style={styles.botaoSalvarTexto}>
                {idEdicao ? "Atualizar salário" : "Adicionar salário"}
              </Text>
            </TouchableOpacity>
            <View style={styles.resumo}>
              <View style={styles.resumoLinha}>
                <Text style={styles.resumoLabel}>Total de entradas</Text>

                <Text style={[styles.resumoValor, { color: LIME }]}>
                  R$ {totalSalarios.toFixed(2).replace(".", ",")}
                </Text>
              </View>

              <View style={styles.resumoLinha}>
                <Text style={styles.resumoLabel}>Dívidas fixas</Text>
                <Text style={[styles.resumoValor, { color: PURPLE }]}>
                  - R$ {totalDividas.toFixed(2).replace(".", ",")}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.botaoDividas}
              onPress={onAbrirDividas}
            >
              <View style={styles.containerBotaoDividas}>
                <FileText size={18} color={PURPLE} />
                <Text style={styles.botaoDividasTexto}>Dívidas Fixas</Text>
              </View>
              <ChevronRight size={18} color={PURPLE} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.botaoFechar}
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
