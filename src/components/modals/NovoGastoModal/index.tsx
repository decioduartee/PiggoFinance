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
import { CalendarDays, ChevronDown, CreditCard } from "lucide-react-native";
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
  onAbrirDividaParcelada?: (dados: {
    nome?: string;
    valor?: number;
    data: Date;
  }) => void;
};

const valoresRapidos = [10, 20, 50, 100];

function hoje() {
  return new Date();
}

function dataISO(data: Date) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function dataBR(data: Date) {
  if (Number.isNaN(data.getTime())) {
    return "Selecionar data";
  }

  return data.toLocaleDateString("pt-BR");
}

function criarDataSegura(valor?: string | null) {
  if (!valor) {
    return new Date();
  }

  const texto = String(valor);
  const isoCurto = texto.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (isoCurto) {
    return new Date(
      Number(isoCurto[1]),
      Number(isoCurto[2]) - 1,
      Number(isoCurto[3]),
    );
  }

  const br = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (br) {
    return new Date(Number(br[3]), Number(br[2]) - 1, Number(br[1]));
  }

  const data = new Date(texto);

  return Number.isNaN(data.getTime()) ? new Date() : data;
}

export default function NovoGastoModal({
  visivel,
  transacao,
  onFechar,
  onSalvar,
  onAbrirDividaParcelada,
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
      setData(criarDataSegura(transacao.data));
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

  function selecionarValorRapido(valorSelecionado: number) {
    setValor(String(valorSelecionado));
  }

  function abrirDividaParcelada() {
    if (!onAbrirDividaParcelada) {
      return;
    }

    Keyboard.dismiss();
    setMostrarCalendario(false);

    const numero = Number(valor);

    onAbrirDividaParcelada({
      nome: nome.trim() || undefined,
      valor: Number.isNaN(numero) || numero <= 0 ? undefined : numero,
      data: data ?? hoje(),
    });
  }

  const valorExibido = valor === "" ? "0,00" : formatBRL(Number(valor));
  const valorSelecionado = Number(valor);

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
                placeholder="Valor"
                placeholderTextColor={placeholderColor}
                keyboardType="decimal-pad"
                style={[styles.input, styles.inputValor]}
                value={valorExibido}
                onChangeText={alterarValor}
              />

              <View style={styles.valoresRapidos}>
                {valoresRapidos.map((item) => {
                  const selecionado = valorSelecionado === item;

                  return (
                    <TouchableOpacity
                      key={item}
                      activeOpacity={0.82}
                      style={[
                        styles.valorRapidoBotao,
                        selecionado && styles.valorRapidoSelecionado,
                      ]}
                      onPress={() => selecionarValorRapido(item)}
                    >
                      <Text
                        style={[
                          styles.valorRapidoTexto,
                          selecionado && styles.valorRapidoTextoSelecionado,
                        ]}
                      >
                        R${item}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TextInput
                placeholder="Nome do gasto"
                placeholderTextColor={placeholderColor}
                style={styles.input}
                value={nome}
                onChangeText={setNome}
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

              {onAbrirDividaParcelada && (
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.botaoDividaParcelada}
                  onPress={abrirDividaParcelada}
                >
                  <CreditCard
                    size={18}
                    color={styles.botaoDividaParceladaTexto.color}
                  />

                  <Text style={styles.botaoDividaParceladaTexto}>
                    Dívida Parcelada
                  </Text>
                </TouchableOpacity>
              )}

              {mostrarCalendario && (
                <DateTimePicker
                  value={data ?? hoje()}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "calendar"}
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
