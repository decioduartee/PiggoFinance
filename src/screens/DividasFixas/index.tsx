// src/screens/DividasFixas/index.tsx

import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ArrowDownUp,
  ChevronLeft,
  Eye,
  EyeOff,
  Search,
} from "lucide-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";

import ConfirmacaoAlert from "../../components/ConfirmacaoAlert";
import DividasFixasModal, {
  type PrefillDividaParcelada,
} from "../../components/modals/DividasFixasModal";
import SwipeAction from "../../components/SwipeAction";
import useFinance from "../../hooks/useFinance";
import type { RootStackParamList } from "../../navigation/AppNavigator";
import { temaCores } from "../../theme/colors";

import { CardResumo, LinhaDivida } from "./components";
import { createStyles } from "./styles";
import {
  agruparPorVencimento,
  montarDividasDoMes,
  montarTodasDividas,
  numeroParcelaDaCompetencia,
  ocorrenciaEstaAtrasada,
  ocorrenciaEstaPaga,
  ordenarDividas,
  pesquisarDividas,
  valorDaDivida,
  type ItemDivida,
  type ModoListaDividas,
  type Ordem,
} from "./utils";

const COOLDOWN_STATUS_MS = 450;

export default function DividasFixas() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, "DividasFixas">>();
  const route =
    useRoute<NativeStackScreenProps<RootStackParamList, "DividasFixas">["route"]>();
  const finance = useFinance();

  const [busca, setBusca] = useState("");
  const [oculto, setOculto] = useState(false);
  const [ordem, setOrdem] = useState<Ordem>("recentes");
  const [modoLista, setModoLista] = useState<ModoListaDividas>("mes");
  const [atualizando, setAtualizando] = useState<Set<string>>(() => new Set());
  const [dividaConfirmandoPagamento, setDividaConfirmandoPagamento] =
    useState<ItemDivida | null>(null);
  const [dividaConfirmandoExclusao, setDividaConfirmandoExclusao] =
    useState<ItemDivida | null>(null);
  const [dividaConfirmandoStatus, setDividaConfirmandoStatus] = useState<{
    item: ItemDivida;
    ativa: boolean;
  } | null>(null);
  const [modalEdicaoDivida, setModalEdicaoDivida] = useState(false);
  const [dividaEditando, setDividaEditando] = useState<ItemDivida | null>(null);
  const [prefillDivida, setPrefillDivida] =
    useState<PrefillDividaParcelada | null>(null);
  const [prefillAplicado, setPrefillAplicado] = useState("");
  const [erroAtualizacao, setErroAtualizacao] = useState(false);

  const {
    dividas,
    ocorrenciasDividas,
    competenciaAtual,
    modoEscuro,
    adicionarDivida,
    editarDivida,
    excluirDivida,
    alterarStatusDivida,
  } = finance;

  const cores = useMemo(() => temaCores(modoEscuro), [modoEscuro]);
  const styles = useMemo(() => createStyles(modoEscuro), [modoEscuro]);

  // A tela trabalha somente com a competência atual.
  // Ao virar o mês, as dívidas ativas reaparecem como pendentes.
  // Ocorrências antigas permanecem preservadas para o Histórico.
  const itensDoMes = useMemo(
    () =>
      montarDividasDoMes({
        dividas,
        ocorrencias: ocorrenciasDividas,
        competencia: competenciaAtual,
      }),
    [dividas, ocorrenciasDividas, competenciaAtual],
  );

  const todasDividas = useMemo(
    () =>
      montarTodasDividas({
        dividas,
        ocorrencias: ocorrenciasDividas,
        competenciaAtual,
      }),
    [dividas, ocorrenciasDividas, competenciaAtual],
  );

  const itensBase = modoLista === "todas" ? todasDividas : itensDoMes;

  const itensFiltrados = useMemo(() => {
    const filtrados = pesquisarDividas(itensBase, busca);
    return ordenarDividas(filtrados, ordem);
  }, [itensBase, busca, ordem]);

  const grupos = useMemo(
    () => agruparPorVencimento(itensFiltrados),
    [itensFiltrados],
  );

  const resumo = useMemo(() => {
    return itensBase.reduce(
      (totais, item) => {
        const valor = valorDaDivida(item);

        if (ocorrenciaEstaPaga(item.ocorrencia)) {
          totais.pago += valor;
          totais.quantidadePagas += 1;
        } else {
          totais.pendente += valor;
          totais.quantidadePendentes += 1;
        }

        return totais;
      },
      {
        pago: 0,
        pendente: 0,
        quantidadePagas: 0,
        quantidadePendentes: 0,
      },
    );
  }, [itensBase]);

  async function marcarComoPago(item: ItemDivida) {
    if (ocorrenciaEstaPaga(item.ocorrencia) || item.prevista) {
      return;
    }

    const chaveAtualizacao = item.divida.id;
    if (atualizando.has(chaveAtualizacao)) return;

    setAtualizando((estado) => {
      const proximo = new Set(estado);
      proximo.add(chaveAtualizacao);
      return proximo;
    });

    try {
      await finance.alterarStatusOcorrencia(item.ocorrencia.id);
    } catch (erro) {
      console.error("Erro ao alterar status da dívida:", erro);

      setErroAtualizacao(true);
    } finally {
      setTimeout(() => {
        setAtualizando((estado) => {
          const proximo = new Set(estado);
          proximo.delete(chaveAtualizacao);
          return proximo;
        });
      }, COOLDOWN_STATUS_MS);
    }
  }

  function alternarStatus(item: ItemDivida) {
    const pago = ocorrenciaEstaPaga(item.ocorrencia);

    // Se já está paga, não faz nada.
    if (pago) return;

    setDividaConfirmandoPagamento(item);
  }

  function confirmarPagamento() {
    if (!dividaConfirmandoPagamento) return;

    void marcarComoPago(dividaConfirmandoPagamento);
  }

  async function alterarStatusCadastroDivida(item: ItemDivida, ativa: boolean) {
    const chaveAtualizacao = item.divida.id;

    if (
      chaveAtualizacao.includes("_TEMP_") ||
      atualizando.has(chaveAtualizacao)
    ) {
      return;
    }

    setAtualizando((estado) => {
      const proximo = new Set(estado);
      proximo.add(chaveAtualizacao);
      return proximo;
    });

    try {
      await alterarStatusDivida(chaveAtualizacao, ativa);
    } catch (erro) {
      console.error("Erro ao alterar status da dívida:", erro);
      setErroAtualizacao(true);
    } finally {
      setTimeout(() => {
        setAtualizando((estado) => {
          const proximo = new Set(estado);
          proximo.delete(chaveAtualizacao);
          return proximo;
        });
      }, COOLDOWN_STATUS_MS);
    }
  }

  function solicitarAlteracaoStatusCadastro(item: ItemDivida) {
    if (atualizando.has(item.divida.id)) {
      return;
    }

    setDividaConfirmandoStatus({
      item,
      ativa: item.divida.ativa === false,
    });
  }

  function confirmarAlteracaoStatusCadastro() {
    if (!dividaConfirmandoStatus) {
      return;
    }

    void alterarStatusCadastroDivida(
      dividaConfirmandoStatus.item,
      dividaConfirmandoStatus.ativa,
    );
  }

  useEffect(() => {
    const params = route.params;

    if (!params?.abrirCadastro) {
      return;
    }

    const chave = JSON.stringify(params);

    if (chave === prefillAplicado) {
      return;
    }

    const inicio =
      params.mesInicio && params.anoInicio
        ? `${String(params.mesInicio).padStart(2, "0")}/${params.anoInicio}`
        : undefined;

    setDividaEditando(null);
    setPrefillDivida({
      nome: params.nome,
      valor: params.valor,
      inicio,
      vencimento: params.diaVencimento,
    });
    setModalEdicaoDivida(true);
    setPrefillAplicado(chave);
  }, [prefillAplicado, route.params]);

  function abrirEdicaoDivida(item: ItemDivida) {
    setPrefillDivida(null);
    setDividaEditando(item);
    setModalEdicaoDivida(true);
  }

  function solicitarExclusaoDivida(item: ItemDivida) {
    if (item.divida.id.includes("_TEMP_")) {
      return;
    }

    setDividaConfirmandoExclusao(item);
  }

  function confirmarExclusaoDivida() {
    if (!dividaConfirmandoExclusao) {
      return;
    }

    void excluirDivida(dividaConfirmandoExclusao.divida.id);
    setDividaConfirmandoExclusao(null);
  }

  const header = (
    <>
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.78}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ChevronLeft size={21} color={cores.INK} />
          <Text style={styles.tituloButton}>Início</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.78}
          onPress={() => setOculto((estado) => !estado)}
          style={styles.olhoBotao}
        >
          {oculto ? (
            <EyeOff size={21} color={cores.GRAY} />
          ) : (
            <Eye size={21} color={cores.GRAY} />
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.titulo}>Dívidas fixas</Text>
      <Text style={styles.subtitulo}>
        Acompanhe o que falta pagar neste mês
      </Text>

      <View style={styles.buscaBox}>
        <Search size={18} color={cores.GRAY} />
        <TextInput
          value={busca}
          onChangeText={setBusca}
          placeholder="Buscar nome, tipo, status ou valor..."
          placeholderTextColor={cores.GRAY}
          style={styles.buscaInput}
        />
      </View>

      <View style={styles.modoLista}>
        <TouchableOpacity
          activeOpacity={0.82}
          onPress={() => setModoLista("mes")}
          style={[
            styles.modoListaBotao,
            modoLista === "mes" && styles.modoListaBotaoAtivo,
          ]}
        >
          <Text
            style={[
              styles.modoListaTexto,
              modoLista === "mes" && styles.modoListaTextoAtivo,
            ]}
          >
            Do mês
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.82}
          onPress={() => setModoLista("todas")}
          style={[
            styles.modoListaBotao,
            modoLista === "todas" && styles.modoListaBotaoAtivo,
          ]}
        >
          <Text
            style={[
              styles.modoListaTexto,
              modoLista === "todas" && styles.modoListaTextoAtivo,
            ]}
          >
            Todas
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.resumo}>
        <CardResumo
          tipo="pago"
          titulo="Pagas"
          quantidade={resumo.quantidadePagas}
          valor={resumo.pago}
          oculto={oculto}
          cores={cores}
          styles={styles}
        />

        <CardResumo
          tipo="pendente"
          titulo="Pendentes"
          quantidade={resumo.quantidadePendentes}
          valor={resumo.pendente}
          oculto={oculto}
          cores={cores}
          styles={styles}
        />
      </View>

      <TouchableOpacity
        activeOpacity={0.78}
        onPress={() =>
          setOrdem((estado) => (estado === "recentes" ? "antigos" : "recentes"))
        }
        style={styles.ordenacao}
      >
        <ArrowDownUp size={15} color={cores.GRAY} style={{ marginRight: 6 }} />
        <Text style={styles.ordenacaoTexto}>
          {ordem === "recentes" ? "Mais recentes" : "Mais antigas"}
        </Text>
      </TouchableOpacity>
    </>
  );

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.screen}>
      <DividasFixasModal
        visivel={modalEdicaoDivida}
        dividas={dividas}
        prefillDivida={prefillDivida}
        dividaInicial={dividaEditando?.divida ?? null}
        onFechar={() => {
          setModalEdicaoDivida(false);
          setDividaEditando(null);
          setPrefillDivida(null);
        }}
        onVerMaisDividas={() => {
          setModalEdicaoDivida(false);
          setDividaEditando(null);
          setPrefillDivida(null);
        }}
        onSalvar={(dados, id) => {
          if (id) {
            void editarDivida(id, dados);
            return;
          }

          void adicionarDivida(dados);
        }}
        onExcluir={(id) => {
          void excluirDivida(id);
        }}
      />

      <ConfirmacaoAlert
        visivel={Boolean(dividaConfirmandoPagamento)}
        tipo="success"
        titulo="Marcar como paga"
        mensagem={`Deseja marcar "${dividaConfirmandoPagamento?.divida.nome ?? "esta dívida"}" como paga?`}
        onCancelar={() => setDividaConfirmandoPagamento(null)}
        onConfirmar={confirmarPagamento}
      />

      <ConfirmacaoAlert
        visivel={Boolean(dividaConfirmandoExclusao)}
        tipo="danger"
        titulo="Excluir dívida"
        mensagem={`Deseja realmente excluir "${dividaConfirmandoExclusao?.divida.nome ?? "esta dívida"}"?`}
        textoConfirmar="Excluir"
        onCancelar={() => setDividaConfirmandoExclusao(null)}
        onConfirmar={confirmarExclusaoDivida}
      />

      <ConfirmacaoAlert
        visivel={Boolean(dividaConfirmandoStatus)}
        tipo={dividaConfirmandoStatus?.ativa ? "success" : "info"}
        titulo={
          dividaConfirmandoStatus?.ativa
            ? "Reativar dívida"
            : "Desativar dívida"
        }
        mensagem={
          dividaConfirmandoStatus?.ativa
            ? `Deseja reativar "${dividaConfirmandoStatus?.item.divida.nome ?? "esta dívida"}"?`
            : `Deseja desativar "${dividaConfirmandoStatus?.item.divida.nome ?? "esta dívida"}"?`
        }
        textoConfirmar={
          dividaConfirmandoStatus?.ativa ? "Reativar" : "Desativar"
        }
        onCancelar={() => setDividaConfirmandoStatus(null)}
        onConfirmar={confirmarAlteracaoStatusCadastro}
      />

      <ConfirmacaoAlert
        visivel={erroAtualizacao}
        tipo="info"
        titulo="Não foi possível atualizar"
        mensagem="Confira a conexão com o Google Sheets e tente novamente."
        textoCancelar="Entendi"
        onCancelar={() => setErroAtualizacao(false)}
      />

      <FlatList
        data={grupos}
        keyExtractor={(grupo) => grupo.data}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <Text style={styles.vazio}>
            {busca.trim()
              ? "Nenhuma dívida encontrada."
              : modoLista === "todas"
                ? "Nenhuma dívida cadastrada."
                : "Nenhuma dívida ativa para este mês."}
          </Text>
        }
        renderItem={({ item: grupo }) => (
          <View style={styles.grupo}>
            <Text style={styles.grupoTitulo}>{grupo.titulo}</Text>

            {grupo.itens.map((item, indice) => {
              const pago = ocorrenciaEstaPaga(item.ocorrencia);
              const atrasada = ocorrenciaEstaAtrasada(item.ocorrencia);
              const valor = valorDaDivida(item);
              const gerenciandoCadastro = modoLista === "todas";
              const statusDesabilitado =
                !gerenciandoCadastro && item.prevista;
              const statusTexto = gerenciandoCadastro
                ? item.divida.ativa === false
                  ? "Reativar"
                  : "Desativar"
                : undefined;
              const onPressStatus = gerenciandoCadastro
                ? () => solicitarAlteracaoStatusCadastro(item)
                : () => alternarStatus(item);

              return (
                <SwipeAction
                  key={item.id}
                  onEdit={() => abrirEdicaoDivida(item)}
                  onDelete={() => solicitarExclusaoDivida(item)}
                  editLabel="Editar"
                >
                  <LinhaDivida
                    divida={item.divida}
                    valor={valor}
                    pago={gerenciandoCadastro ? false : pago}
                    atrasada={atrasada}
                    oculto={oculto}
                    atualizando={atualizando.has(item.divida.id)}
                    statusDesabilitado={statusDesabilitado}
                    statusTexto={statusTexto}
                    onPressStatus={onPressStatus}
                    cores={cores}
                    styles={styles}
                    numeroParcela={
                      item.ocorrencia.numeroParcela ??
                      numeroParcelaDaCompetencia(item.divida, competenciaAtual)
                    }
                  />

                  {indice < grupo.itens.length - 1 ? (
                    <View style={styles.separadorCard} />
                  ) : null}
                </SwipeAction>
              );
            })}
          </View>
        )}
      />
    </SafeAreaView>
  );
}
