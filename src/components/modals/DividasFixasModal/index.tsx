import React, { useEffect, useMemo, useState } from "react";

import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  CalendarDays,
  ChevronDown,
  CreditCard,
  Repeat,
} from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import useFinance from "../../../hooks/useFinance";
import ConfirmacaoAlert from "../../ConfirmacaoAlert";
import SwipeAction from "../../SwipeAction";

import type { Divida, NovaDivida } from "../../../features/financas/types";

import { PURPLE, temaCores } from "../../../theme/colors";

import {
  formatBRL,
  letraMaiuscula,
  textoParaValorBRL,
} from "../../../utils/formatadores";

import { createStyles } from "./styles";

// ==========================================================
// TIPOS
// ==========================================================

type Props = {
  visivel: boolean;

  dividas: Divida[];

  prefillDivida?: PrefillDividaParcelada | null;

  dividaInicial?: Divida | null;

  onFechar: () => void;

  onVerMaisDividas?: () => void;

  onSalvar: (divida: NovaDivida, id?: string) => void | Promise<void>;

  onExcluir: (id: string) => void | Promise<void>;

  onAlterarStatus: (id: string, ativa: boolean) => void | Promise<void>;
};

export type PrefillDividaParcelada = {
  nome?: string;
  valor?: number;
  inicio?: string;
};

// ==========================================================
// HELPERS
// ==========================================================

function obterInicioMesAtual() {
  const agora = new Date();

  const ano = agora.getFullYear();

  const mes = String(agora.getMonth() + 1).padStart(2, "0");

  return `${ano}-${mes}-01`;
}

function inicioParaBackend(valor: string) {
  const texto = valor.trim();

  /*
   * Sem data informada:
   * usa automaticamente o mês atual.
   */
  if (!texto) {
    return obterInicioMesAtual();
  }

  /*
   * Esperado:
   *
   * MM/AAAA
   *
   * Exemplo:
   * 08/2026
   */

  const match = texto.match(/^(\d{2})\/(\d{4})$/);

  if (!match) {
    return null;
  }

  const mes = Number(match[1]);

  const ano = Number(match[2]);

  if (mes < 1 || mes > 12) {
    return null;
  }

  return `${ano}-` + `${String(mes).padStart(2, "0")}-01`;
}

function inicioParaTela(valor?: string) {
  if (!valor) {
    return "";
  }

  const texto = String(valor).trim();

  const mesAno = texto.match(/^(\d{2})\/(\d{4})$/);

  if (mesAno) {
    return `${mesAno[1]}/${mesAno[2]}`;
  }

  const dataBR = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (dataBR) {
    return `${dataBR[2]}/${dataBR[3]}`;
  }

  /*
   * Aceita:
   *
   * 2026-08-01
   * 2026-08
   * 2026-08-01T03:00:00.000Z
   */

  const match = texto.match(/^(\d{4})-(\d{2})/);

  if (!match) {
    return "";
  }

  return `${match[2]}/${match[1]}`;
}

function inicioParaData(valor?: string | null) {
  if (!valor) {
    return new Date();
  }

  const texto = String(valor).trim();
  const tela = texto.match(/^(\d{2})\/(\d{4})$/);

  if (tela) {
    return new Date(Number(tela[2]), Number(tela[1]) - 1, 1);
  }

  const dataBR = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (dataBR) {
    return new Date(Number(dataBR[3]), Number(dataBR[2]) - 1, 1);
  }

  const iso = texto.match(/^(\d{4})-(\d{2})/);

  if (iso) {
    return new Date(Number(iso[1]), Number(iso[2]) - 1, 1);
  }

  const data = new Date(texto);

  return Number.isNaN(data.getTime())
    ? new Date()
    : new Date(data.getFullYear(), data.getMonth(), 1);
}

function dataParaInicioTela(data: Date) {
  if (Number.isNaN(data.getTime())) {
    return "";
  }

  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const ano = data.getFullYear();

  return `${mes}/${ano}`;
}

function ehIdTemporario(id: string) {
  return id.includes("_TEMP_");
}

// ==========================================================
// COMPONENTE
// ==========================================================

export default function DividasFixasModal({
  visivel,
  dividas,
  prefillDivida,
  dividaInicial,
  onFechar,
  onVerMaisDividas,
  onSalvar,
  onExcluir,
  onAlterarStatus,
}: Props) {
  // ========================================================
  // FORMULÁRIO
  // ========================================================

  const [id, setId] = useState<string | null>(null);

  const [nome, setNome] = useState("");

  const [valor, setValor] = useState("");

  const [parcelada, setParcelada] = useState(false);

  const [parcelas, setParcelas] = useState("");

  const [parcelasPagas, setParcelasPagas] = useState("");

  const [inicio, setInicio] = useState("");

  const [inicioData, setInicioData] = useState<Date | null>(null);

  const [mostrarInicioPicker, setMostrarInicioPicker] = useState(false);

  const [vencimento, setVencimento] = useState("");

  const [dividaExcluindo, setDividaExcluindo] = useState<Divida | null>(null);

  // ========================================================
  // ESTADO DA EDIÇÃO
  // ========================================================

  const editando = id !== null;

  // ========================================================
  // TEMA
  // ========================================================

  const { modoEscuro } = useFinance();

  const cores = temaCores(modoEscuro);

  const insets = useSafeAreaInsets();

  const styles = useMemo(
    () => createStyles(cores, insets.bottom),
    [cores, insets.bottom],
  );

  // ========================================================
  // RESET
  // ========================================================

  useEffect(() => {
    if (!visivel) {
      limpar();
      return;
    }

    if (dividaInicial) {
      editar(dividaInicial);
      return;
    }

    if (prefillDivida) {
      aplicarPrefill(prefillDivida);
    }
  }, [dividaInicial, prefillDivida, visivel]);

  function aplicarPrefill(dados: PrefillDividaParcelada) {
    setId(null);

    setNome(dados.nome ?? "");

    setValor(dados.valor != null ? String(dados.valor) : "");

    setParcelada(true);

    setParcelas("");

    setParcelasPagas("");

    const inicioPrefill = dados.inicio ?? dataParaInicioTela(new Date());

    setInicio(inicioPrefill);

    setInicioData(inicioParaData(inicioPrefill));

    setVencimento("");

    setDividaExcluindo(null);
  }

  function limpar() {
    setId(null);

    setNome("");

    setValor("");

    setParcelada(false);

    setParcelas("");

    setParcelasPagas("");

    setInicio("");

    setInicioData(null);

    setMostrarInicioPicker(false);

    setVencimento("");

    setDividaExcluindo(null);
  }

  // ========================================================
  // FECHAR
  // ========================================================

  function fechar() {
    Keyboard.dismiss();

    limpar();

    onFechar();
  }

  // ========================================================
  // EDITAR
  // ========================================================

  function editar(item: Divida) {
    /*
     * Dívida ainda não confirmada pelo backend.
     *
     * Não entra em modo de edição.
     */
    if (ehIdTemporario(item.id)) {
      return;
    }

    setId(item.id);

    setNome(item.nome);

    setValor(String(item.valor));

    setParcelada(item.tipo === "parcelada");

    setParcelas(item.parcelas != null ? String(item.parcelas) : "");

    setParcelasPagas(
      item.parcelasPagas != null ? String(item.parcelasPagas) : "",
    );

    const inicioTela = inicioParaTela(item.inicio);

    setInicio(inicioTela);

    setInicioData(inicioParaData(inicioTela || item.inicio));

    setVencimento(item.vencimento != null ? String(item.vencimento) : "");
  }

  // ========================================================
  // EXCLUIR
  // ========================================================

  function excluir(item: Divida) {
    if (ehIdTemporario(item.id)) {
      return;
    }

    /*
     * Se a dívida excluída for justamente a que está
     * aberta no formulário de edição, limpamos o formulário
     * imediatamente para não manter dados removidos na tela.
     */
    if (id === item.id) {
      Keyboard.dismiss();

      limpar();
    }

    void Promise.resolve(onExcluir(item.id)).catch((error) => {
      console.error("Erro ao excluir dívida:", error);
    });
  }

  // ========================================================
  // VALOR
  // ========================================================

  function alterarValor(texto: string) {
    setValor(textoParaValorBRL(texto));
  }

  const valorExibido = valor === "" ? "0,00" : formatBRL(Number(valor));

  // ========================================================
  // SALVAR
  // ========================================================

  async function salvar() {
    const nomeLimpo = nome.trim();

    const numero = Number(valor);

    // ------------------------------------------------------
    // Nome
    // ------------------------------------------------------

    if (!nomeLimpo) {
      return;
    }

    // ------------------------------------------------------
    // Valor
    // ------------------------------------------------------

    if (Number.isNaN(numero) || numero <= 0) {
      return;
    }

    // ------------------------------------------------------
    // Vencimento
    // ------------------------------------------------------

    const diaVencimento =
      vencimento.trim() !== "" ? Number(vencimento) : undefined;

    if (
      diaVencimento !== undefined &&
      (Number.isNaN(diaVencimento) ||
        !Number.isInteger(diaVencimento) ||
        diaVencimento < 1 ||
        diaVencimento > 31)
    ) {
      return;
    }

    // ======================================================
    // EDIÇÃO
    // ======================================================

    if (editando) {
      /*
       * IMPORTANTE:
       *
       * Ao editar, os campos estruturais são mantidos
       * exatamente como estão.
       *
       * Não usamos os valores dos inputs para alterar:
       *
       * - tipo
       * - parcelas
       * - parcelasPagas
       * - inicio
       */

      const original = dividas.find((item) => item.id === id);

      if (!original) {
        return;
      }

      const divida: NovaDivida = {
        nome: nomeLimpo,

        valor: numero,

        ativa: original.ativa,

        tipo: original.tipo,

        parcelas: original.parcelas,

        parcelasPagas: original.parcelasPagas,

        inicio: original.inicio,

        vencimento: diaVencimento,

        responsavel: original.responsavel,
      };

      Keyboard.dismiss();

      try {
        await onSalvar(divida, original.id);

        limpar();
      } catch (error) {
        console.error("Erro ao atualizar dívida:", error);
      }

      return;
    }

    // ======================================================
    // NOVA DÍVIDA
    // ======================================================

    const inicioBackend = inicioParaBackend(inicio);

    if (!inicioBackend) {
      return;
    }

    let totalParcelas: number | undefined;

    let totalPagas: number | undefined;

    // ------------------------------------------------------
    // Parcelamento
    // ------------------------------------------------------

    if (parcelada) {
      totalParcelas = Number(parcelas);

      totalPagas = parcelasPagas.trim() === "" ? 0 : Number(parcelasPagas);

      if (
        Number.isNaN(totalParcelas) ||
        !Number.isInteger(totalParcelas) ||
        totalParcelas <= 0
      ) {
        return;
      }

      if (
        Number.isNaN(totalPagas) ||
        !Number.isInteger(totalPagas) ||
        totalPagas < 0 ||
        totalPagas > totalParcelas
      ) {
        return;
      }
    }

    const divida: NovaDivida = {
      nome: nomeLimpo,

      valor: numero,

      tipo: parcelada ? "parcelada" : "fixa",

      ativa: true,

      inicio: inicioBackend,

      vencimento: diaVencimento,

      parcelas: parcelada ? totalParcelas : undefined,

      parcelasPagas: parcelada ? totalPagas : undefined,
    };

    Keyboard.dismiss();

    /*
     * O AppContext insere a dívida no estado de forma otimista antes
     * da primeira espera do backend. Iniciamos o salvamento e limpamos
     * o formulário imediatamente, sem aguardar o Google Sheets.
     */
    const salvamento = Promise.resolve(onSalvar(divida));

    limpar();

    try {
      await salvamento;
    } catch (error) {
      console.error("Erro ao adicionar dívida:", error);
    }
  }

  // ========================================================
  // TOTAL
  // ========================================================

  const total = useMemo(() => {
    return dividas
      .filter((item) => item.ativa)
      .reduce((soma, item) => soma + Number(item.valor || 0), 0);
  }, [dividas]);

  const dividasVisiveis = useMemo(
    () => dividas.slice(0, 2),
    [dividas],
  );

  const mostrarVerMais = dividas.length > dividasVisiveis.length;

  // ========================================================
  // RENDER
  // ========================================================

  return (
    <Modal
      visible={visivel}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={fechar}
    >
      <GestureHandlerRootView style={styles.gestureRoot}>
        <View style={styles.overlay}>
          <Pressable style={styles.backdrop} onPress={fechar} />

          <KeyboardAvoidingView
            style={styles.modalWrapper}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <View style={styles.modal}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.scroll}
              >
              {/* =========================================== */}
              {/* TÍTULO */}
              {/* =========================================== */}

              <Text style={styles.titulo}>Dívidas Fixas</Text>

              {/* =========================================== */}
              {/* LISTA */}
              {/* =========================================== */}

              <Text style={styles.section}>Dívidas cadastradas</Text>

              {dividas.length === 0 && (
                <View style={styles.empty}>
                  <Text style={styles.emptyText}>
                    Nenhuma dívida cadastrada.
                  </Text>
                </View>
              )}

              {dividasVisiveis.map((item) => {
                const sincronizando = ehIdTemporario(item.id);

                const card = (
                  <View style={styles.card}>
                    {/* =================================== */}
                    {/* DADOS */}
                    {/* =================================== */}

                    <View
                      style={{
                        flex: 1,
                      }}
                    >
                      <View style={styles.cardHeader}>
                        {item.tipo === "parcelada" ? (
                          <CreditCard size={16} color={cores.GRAY} />
                        ) : (
                          <Repeat size={16} color={cores.GRAY} />
                        )}

                        <Text style={styles.cardTitulo}>
                          {letraMaiuscula(item.nome)}
                        </Text>
                      </View>

                      <Text style={styles.cardValor}>
                        R$ {Number(item.valor).toFixed(2).replace(".", ",")}
                      </Text>

                      {/* ================================= */}
                      {/* VENCIMENTO */}
                      {/* ================================= */}

                      {item.vencimento != null &&
                        String(item.vencimento) !== "" && (
                          <Text style={styles.cardInfo}>
                            Vencimento:
                            {" dia "}
                            {item.vencimento}
                          </Text>
                        )}

                      {/* ================================= */}
                      {/* PARCELAS */}
                      {/* ================================= */}

                      {item.tipo === "parcelada" && item.parcelas != null && (
                        <Text style={styles.cardInfo}>
                          {Number(item.parcelasPagas || 0)}/
                          {Number(item.parcelas)} parcelas pagas
                        </Text>
                      )}
                    </View>

                    {/* =================================== */}
                    {/* STATUS */}
                    {/* =================================== */}

                    <Switch
                      value={item.ativa}
                      disabled={sincronizando}
                      onValueChange={(ativa) => {
                        if (sincronizando) {
                          return;
                        }

                        void onAlterarStatus(item.id, ativa);
                      }}
                      trackColor={{
                        false: "#DDD",
                        true: PURPLE,
                      }}
                      thumbColor={item.ativa ? PURPLE : "#DDD"}
                    />
                  </View>
                );

                if (sincronizando) {
                  return <View key={item.id}>{card}</View>;
                }

                return (
                  <SwipeAction
                    key={item.id}
                    onEdit={() => editar(item)}
                    onDelete={() => setDividaExcluindo(item)}
                  >
                    {card}
                  </SwipeAction>
                );
              })}

              {mostrarVerMais && onVerMaisDividas ? (
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.botaoVerMais}
                  onPress={onVerMaisDividas}
                >
                  <Text style={styles.botaoVerMaisTexto}>
                    Ver mais dívidas
                  </Text>
                </TouchableOpacity>
              ) : null}

              {/* =========================================== */}
              {/* FORMULÁRIO */}
              {/* =========================================== */}

              <Text style={styles.section}>
                {editando ? "Editar dívida" : "Nova dívida"}
              </Text>

              {/* =========================================== */}
              {/* NOME */}
              {/* =========================================== */}

              <TextInput
                style={styles.input}
                placeholder="Nome da dívida"
                placeholderTextColor={cores.GRAY}
                value={nome}
                onChangeText={setNome}
              />

              {/* =========================================== */}
              {/* VALOR */}
              {/* =========================================== */}

              <TextInput
                style={styles.input}
                placeholder="Valor mensal"
                placeholderTextColor={cores.GRAY}
                keyboardType="decimal-pad"
                value={valorExibido}
                onChangeText={alterarValor}
              />

              {/* =========================================== */}
              {/* TIPO */}
              {/* =========================================== */}

              <View
                style={[
                  styles.switchRow,
                  editando && {
                    opacity: 0.5,
                  },
                ]}
              >
                <Text style={styles.switchLabel}>É uma compra parcelada?</Text>

                <Switch
                  value={parcelada}
                  disabled={editando}
                  onValueChange={setParcelada}
                  trackColor={{
                    false: "#DDD",
                    true: PURPLE,
                  }}
                  thumbColor={parcelada ? PURPLE : "#DDD"}
                />
              </View>

              {/* =========================================== */}
              {/* CAMPOS ESTRUTURAIS DA PARCELADA */}
              {/* =========================================== */}

              {parcelada && (
                <>
                  {/* TOTAL DE PARCELAS */}

                  <TextInput
                    style={[
                      styles.input,
                      editando && {
                        opacity: 0.5,
                      },
                    ]}
                    placeholder="Total de parcelas"
                    placeholderTextColor={cores.GRAY}
                    keyboardType="number-pad"
                    value={parcelas}
                    editable={!editando}
                    onChangeText={setParcelas}
                  />

                  {/* PARCELAS PAGAS */}

                  <TextInput
                    style={[
                      styles.input,
                      editando && {
                        opacity: 0.5,
                      },
                    ]}
                    placeholder="Parcelas pagas"
                    placeholderTextColor={cores.GRAY}
                    keyboardType="number-pad"
                    value={parcelasPagas}
                    editable={!editando}
                    onChangeText={setParcelasPagas}
                  />

                  {/* MÊS INICIAL */}

                  <TouchableOpacity
                    activeOpacity={0.85}
                    disabled={editando}
                    style={[
                      styles.inputData,
                      editando && {
                        opacity: 0.5,
                      },
                    ]}
                    onPress={() => setMostrarInicioPicker(true)}
                  >
                    <CalendarDays size={18} color={cores.GRAY} />

                    <Text
                      style={[
                        styles.inputDataTexto,
                        !inicio && {
                          color: cores.GRAY,
                        },
                      ]}
                    >
                      {inicio || "Mês inicial"}
                    </Text>

                    <ChevronDown size={18} color={cores.GRAY} />
                  </TouchableOpacity>

                  {mostrarInicioPicker && (
                    <DateTimePicker
                      value={inicioData ?? inicioParaData(inicio)}
                      mode="date"
                      display={Platform.OS === "ios" ? "spinner" : "calendar"}
                      onChange={(event, selectedDate) => {
                        if (Platform.OS === "android") {
                          setMostrarInicioPicker(false);
                        }

                        if (event.type === "dismissed") {
                          return;
                        }

                        if (selectedDate) {
                          const dataInicio = new Date(
                            selectedDate.getFullYear(),
                            selectedDate.getMonth(),
                            1,
                          );

                          setInicioData(dataInicio);
                          setInicio(dataParaInicioTela(dataInicio));
                        }
                      }}
                    />
                  )}
                </>
              )}

              {/* =========================================== */}
              {/* VENCIMENTO */}
              {/* =========================================== */}

              <TextInput
                style={styles.input}
                placeholder="Dia do vencimento (opcional)"
                placeholderTextColor={cores.GRAY}
                keyboardType="number-pad"
                value={vencimento}
                onChangeText={(texto) => {
                  const numeros = texto.replace(/\D/g, "").slice(0, 2);

                  setVencimento(numeros);
                }}
                maxLength={2}
              />

              {/* =========================================== */}
              {/* SALVAR */}
              {/* =========================================== */}

              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.botaoSalvar}
                onPress={salvar}
              >
                <Text style={styles.botaoSalvarTexto}>
                  {editando ? "Atualizar dívida" : "Adicionar dívida"}
                </Text>
              </TouchableOpacity>

              {/* =========================================== */}
              {/* RESUMO */}
              {/* =========================================== */}

              <View style={styles.resumo}>
                <View style={styles.resumoLinha}>
                  <Text style={styles.resumoLabel}>Dívidas ativas</Text>

                  <Text style={styles.resumoValor}>
                    {dividas.filter((item) => item.ativa).length}
                  </Text>
                </View>

                <View style={styles.resumoLinha}>
                  <Text style={styles.resumoLabel}>Total mensal</Text>

                  <Text
                    style={[
                      styles.resumoValor,
                      {
                        color: PURPLE,
                      },
                    ]}
                  >
                    R$ {total.toFixed(2).replace(".", ",")}
                  </Text>
                </View>
              </View>

              {/* =========================================== */}
              {/* CANCELAR */}
              {/* =========================================== */}

              <TouchableOpacity
                style={styles.botaoFechar}
                activeOpacity={0.85}
                onPress={fechar}
              >
                <Text style={styles.botaoFecharTexto}>Cancelar</Text>
              </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>

          <ConfirmacaoAlert
            visivel={Boolean(dividaExcluindo)}
            tipo="danger"
            titulo="Excluir dívida"
            mensagem={`Deseja realmente excluir "${dividaExcluindo?.nome ?? "esta dívida"}"?`}
            textoConfirmar="Excluir"
            onCancelar={() => setDividaExcluindo(null)}
            onConfirmar={() => {
              if (dividaExcluindo) {
                excluir(dividaExcluindo);
              }
            }}
          />
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}
