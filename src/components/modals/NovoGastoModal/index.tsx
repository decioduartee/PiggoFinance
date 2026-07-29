import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import DateTimePicker from "@react-native-community/datetimepicker";
import { CalendarDays, ChevronDown } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Categoria,
  categorias,
  renderizarIconeCategoria,
} from "../../../constants/categorias";
import type { Transacao } from "../../../features/financas/types";
import { formatBRL, textoParaValorBRL } from "../../../utils/formatadores";
import useFinance from "../../../hooks/useFinance";
import { createStyles } from "./styles";

type Props = {
  visivel: boolean;
  transacao?: Transacao | null;
  onFechar: () => void;
  onSalvar: (transacao: Transacao) => void;
};

function hoje() {
  return new Date();
}

function inicioMesAtual() {
  const data = new Date();

  return new Date(data.getFullYear(), data.getMonth(), 1);
}

function fimMesAtual() {
  return hoje();
}

function dataISO(data: Date) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function dataBR(data: Date) {
  return data.toLocaleDateString("pt-BR");
}

export default function NovoGastoModal({
  visivel,
  transacao,
  onFechar,
  onSalvar,
}: Props) {
  const [nome, setNome] = useState("");
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState<Categoria>("Transferência");

  const [data, setData] = useState<Date | null>(null);
  const [mostrarCalendario, setMostrarCalendario] = useState(false);

  const { modoEscuro } = useFinance();
  const insets = useSafeAreaInsets();
  const styles = useMemo(
    () => createStyles(modoEscuro, insets.bottom),
    [modoEscuro, insets.bottom],
  );
  const placeholderColor = styles.placeholder.color;

  useEffect(() => {
    if (!visivel) return;

    if (transacao) {
      setNome(transacao.nome);
      setValor(String(Math.abs(transacao.valor)));
      setCategoria(transacao.categoria as Categoria);
      setData(new Date(transacao.data + "T00:00:00"));
    } else {
      limpar();
    }
  }, [transacao, visivel]);

  function limpar() {
    setNome("");
    setValor("");
    setCategoria("Transferência");
    setData(new Date());
  }

  function fechar() {
    Keyboard.dismiss();
    setMostrarCalendario(false);
    onFechar();
  }

  function salvar() {
    const numero = Number(valor);

    if (!nome.trim()) return;
    if (isNaN(numero) || numero <= 0) return;

    const dataFinal = data ?? hoje();

    onSalvar({
      id: transacao?.id ?? String(Date.now()),
      nome: nome.trim(),
      valor: -numero,
      categoria,
      data: dataISO(dataFinal),
      tipo: "saida",
    });

    Keyboard.dismiss();
    limpar();
    onFechar();
  }

  function alterarValor(texto: string) {
    setValor(textoParaValorBRL(texto));
  }

  const valorExibido = valor === "" ? "0,00" : formatBRL(Number(valor));

  return (
    <Modal
      visible={visivel}
      transparent
      statusBarTranslucent
      animationType="slide"
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
              contentContainerStyle={styles.modalContent}
            >
              <Text style={styles.titulo}>Novo Gasto</Text>
              <TextInput
                placeholder="Nome do gasto"
                placeholderTextColor={placeholderColor}
                style={styles.input}
                value={nome}
                onChangeText={setNome}
              />

            <TextInput
              placeholder="Valor"
              placeholderTextColor={placeholderColor}
              keyboardType="decimal-pad"
              style={styles.input}
              value={valorExibido}
              onChangeText={alterarValor}
            />

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.dataBox}
              onPress={() => setMostrarCalendario(true)}
            >
              <CalendarDays size={18} color={placeholderColor} />

              <Text style={styles.dataTexto}>
                {data ? dataBR(data) : `Selecionar data`}
              </Text>

              <ChevronDown size={18} color={placeholderColor} />
            </TouchableOpacity>

            <Text style={styles.ajudaData}>
              Você só pode selecionar datas do mês atual. Se não selecionar
              nada, será usada a data de hoje.
            </Text>

            {mostrarCalendario && (
              <DateTimePicker
                value={data ?? hoje()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "calendar"}
                minimumDate={inicioMesAtual()}
                maximumDate={fimMesAtual()}
                onChange={(event, selectedDate) => {
                  if (Platform.OS === "android") {
                    setMostrarCalendario(false);
                  }

                  if (event.type === "dismissed") {
                    return;
                  }

                  if (selectedDate) {
                    setData(selectedDate);
                  }
                }}
              />
            )}

            <Text style={styles.label}>Categoria</Text>

            <View style={styles.categorias}>
              {categorias.map((item) => {
                const selecionado = categoria === item.nome;

                return (
                  <TouchableOpacity
                    key={item.nome}
                    activeOpacity={0.85}
                    style={[
                      styles.categoriaBotao,
                      selecionado && styles.categoriaSelecionada,
                    ]}
                    onPress={() => setCategoria(item.nome)}
                  >
                    {renderizarIconeCategoria(item.nome, modoEscuro)}

                    <Text
                      style={[
                        styles.categoriaTexto,
                        selecionado && styles.categoriaTextoSelecionada,
                      ]}
                    >
                      {item.nome}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.botaoSalvar}
              onPress={salvar}
            >
              <Text style={styles.botaoSalvarTexto}>Adicionar gasto</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.botaoCancelar}
              onPress={fechar}
            >
              <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
            </TouchableOpacity>
            </KeyboardAwareScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
