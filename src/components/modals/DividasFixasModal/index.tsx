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

import { CreditCard, Pencil, Repeat, Trash2 } from "lucide-react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import useFinance from "../../../hooks/useFinance";

import type { Divida, NovaDivida } from "../../../features/financas";

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

  onFechar: () => void;

  onSalvar: (divida: NovaDivida, id?: string) => void | Promise<void>;

  onExcluir: (id: string) => void | Promise<void>;

  onAlterarStatus: (id: string, ativa: boolean) => void | Promise<void>;
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

  /*
   * Aceita:
   *
   * 2026-08-01
   * 2026-08
   * 2026-08-01T03:00:00.000Z
   */

  const match = String(valor).match(/^(\d{4})-(\d{2})/);

  if (!match) {
    return "";
  }

  return `${match[2]}/${match[1]}`;
}

function formatarInicio(texto: string) {
  const numeros = texto.replace(/\D/g, "");

  const limitado = numeros.slice(0, 6);

  if (limitado.length <= 2) {
    return limitado;
  }

  return `${limitado.slice(0, 2)}/` + `${limitado.slice(2)}`;
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
  onFechar,
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

  const [vencimento, setVencimento] = useState("");

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
    }
  }, [visivel]);

  function limpar() {
    setId(null);

    setNome("");

    setValor("");

    setParcelada(false);

    setParcelas("");

    setParcelasPagas("");

    setInicio("");

    setVencimento("");
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

    setInicio(inicioParaTela(item.inicio));

    setVencimento(item.vencimento != null ? String(item.vencimento) : "");
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

              {dividas.map((item) => {
                const sincronizando = ehIdTemporario(item.id);

                return (
                  <View key={item.id} style={styles.card}>
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

                    {/* =================================== */}
                    {/* EDITAR */}
                    {/* =================================== */}

                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.iconButton}
                      disabled={sincronizando}
                      onPress={() => editar(item)}
                    >
                      <Pencil
                        size={18}
                        color={sincronizando ? cores.GRAY : cores.INK}
                      />
                    </TouchableOpacity>

                    {/* =================================== */}
                    {/* EXCLUIR */}
                    {/* =================================== */}

                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.iconButton}
                      disabled={sincronizando}
                      onPress={() => {
                        if (sincronizando) {
                          return;
                        }

                        void onExcluir(item.id);
                      }}
                    >
                      <Trash2
                        size={18}
                        color={sincronizando ? cores.GRAY : PURPLE}
                      />
                    </TouchableOpacity>
                  </View>
                );
              })}

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

                  <TextInput
                    style={[
                      styles.input,
                      editando && {
                        opacity: 0.5,
                      },
                    ]}
                    placeholder="Mês inicial (MM/AAAA)"
                    placeholderTextColor={cores.GRAY}
                    keyboardType="number-pad"
                    value={inicio}
                    editable={!editando}
                    onChangeText={(texto) => {
                      if (editando) {
                        return;
                      }

                      setInicio(formatarInicio(texto));
                    }}
                    maxLength={7}
                  />
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
      </View>
    </Modal>
  );
}
