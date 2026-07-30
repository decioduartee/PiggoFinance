// src/screens/DividasFixas/index.tsx

import React, { useMemo, useState } from "react";
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
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

import ConfirmacaoAlert from "../../components/ConfirmacaoAlert";
import useFinance from "../../hooks/useFinance";
import { temaCores } from "../../theme/colors";

import { CardResumo, LinhaDivida } from "./components";
import { createStyles } from "./styles";
import {
  agruparPorVencimento,
  montarDividasDoMes,
  numeroParcelaDaCompetencia,
  ocorrenciaEstaAtrasada,
  ocorrenciaEstaPaga,
  ordenarDividas,
  pesquisarDividas,
  valorDaDivida,
  type ItemDivida,
  type Ordem,
} from "./utils";

const COOLDOWN_STATUS_MS = 450;

export default function DividasFixas() {
  const navigation = useNavigation();
  const finance = useFinance();

  const [busca, setBusca] = useState("");
  const [oculto, setOculto] = useState(false);
  const [ordem, setOrdem] = useState<Ordem>("antigos");
  const [atualizando, setAtualizando] = useState<Set<string>>(() => new Set());
  const [dividaConfirmandoPagamento, setDividaConfirmandoPagamento] =
    useState<ItemDivida | null>(null);
  const [erroAtualizacao, setErroAtualizacao] = useState(false);

  const { dividas, ocorrenciasDividas, competenciaAtual, modoEscuro } = finance;

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

  const itensFiltrados = useMemo(() => {
    const filtrados = pesquisarDividas(itensDoMes, busca);
    return ordenarDividas(filtrados, ordem);
  }, [itensDoMes, busca, ordem]);

  const grupos = useMemo(
    () => agruparPorVencimento(itensFiltrados),
    [itensFiltrados],
  );

  const resumo = useMemo(() => {
    return itensDoMes.reduce(
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
  }, [itensDoMes]);

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
          {ordem === "recentes"
            ? "Vencimentos mais distantes"
            : "Próximos vencimentos"}
        </Text>
      </TouchableOpacity>
    </>
  );

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.screen}>
      <ConfirmacaoAlert
        visivel={Boolean(dividaConfirmandoPagamento)}
        tipo="success"
        titulo="Marcar como paga"
        mensagem={`Deseja marcar "${dividaConfirmandoPagamento?.divida.nome ?? "esta dívida"}" como paga?`}
        onCancelar={() => setDividaConfirmandoPagamento(null)}
        onConfirmar={confirmarPagamento}
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

              return (
                <React.Fragment key={item.id}>
                  <LinhaDivida
                    divida={item.divida}
                    valor={valor}
                    pago={pago}
                    atrasada={atrasada}
                    oculto={oculto}
                    atualizando={atualizando.has(item.divida.id)}
                    onPressStatus={() => alternarStatus(item)}
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
                </React.Fragment>
              );
            })}
          </View>
        )}
      />
    </SafeAreaView>
  );
}
