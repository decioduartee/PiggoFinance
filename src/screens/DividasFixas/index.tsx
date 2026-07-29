// src/screens/DividasFixas/index.tsx

import React, { useMemo, useState } from "react";
import {
  Alert,
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

import type { OcorrenciaDivida } from "../../features/financas/types";
import useFinance from "../../hooks/useFinance";
import { temaCores } from "../../theme/colors";

import { CardResumo, LinhaDivida } from "./components";
import { createStyles } from "./styles";
import {
  agruparPorVencimento,
  gerarIdOcorrencia,
  hojeISO,
  montarDividasDoMes,
  numeroParcelaDaCompetencia,
  ocorrenciaEstaPaga,
  ordenarDividas,
  pesquisarDividas,
  valorDaDivida,
  type ItemDivida,
  type Ordem,
} from "./utils";

type FinanceComAcoes = ReturnType<typeof useFinance> & {
  alterarStatusOcorrencia?: (
    ocorrenciaId: string,
    status: "pago" | "pendente",
  ) => void | Promise<void>;
  alterarStatusOcorrenciaDivida?: (
    ocorrenciaId: string,
    status: "pago" | "pendente",
  ) => void | Promise<void>;
  atualizarStatusOcorrenciaDivida?: (
    ocorrenciaId: string,
    status: "pago" | "pendente",
  ) => void | Promise<void>;
  editarOcorrenciaDivida?: (
    ocorrencia: OcorrenciaDivida,
  ) => void | Promise<void>;
  salvarOcorrenciaDivida?: (
    ocorrencia: OcorrenciaDivida,
  ) => void | Promise<void>;
  adicionarOcorrenciaDivida?: (
    ocorrencia: OcorrenciaDivida,
  ) => void | Promise<void>;
};

const COOLDOWN_STATUS_MS = 450;

export default function DividasFixas() {
  const navigation = useNavigation();
  const finance = useFinance() as FinanceComAcoes;

  const [busca, setBusca] = useState("");
  const [oculto, setOculto] = useState(false);
  const [ordem, setOrdem] = useState<Ordem>("antigos");
  const [atualizando, setAtualizando] = useState<Set<string>>(() => new Set());

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

  async function persistirStatus(
    item: ItemDivida,
    novoStatus: "pago" | "pendente",
  ) {
    const chaveAtualizacao = item.divida.id;
    if (atualizando.has(chaveAtualizacao)) return;

    setAtualizando((estado) => {
      const proximo = new Set(estado);
      proximo.add(chaveAtualizacao);
      return proximo;
    });

    const ocorrenciaAtualizada: OcorrenciaDivida = {
      ...item.ocorrencia,
      id: item.prevista ? gerarIdOcorrencia() : item.ocorrencia.id,
      dividaId: item.divida.id,
      competencia: competenciaAtual,
      valor: valorDaDivida(item),
      status: novoStatus,
      pagoEm: novoStatus === "pago" ? hojeISO() : "",
    };

    try {
      // A primeira alteração de uma previsão cria uma ocorrência real.
      // Assim ela também passa a aparecer corretamente no Histórico.
      if (item.prevista && finance.adicionarOcorrenciaDivida) {
        await finance.adicionarOcorrenciaDivida(ocorrenciaAtualizada);
        return;
      }

      if (finance.alterarStatusOcorrencia) {
        await finance.alterarStatusOcorrencia(item.ocorrencia.id, novoStatus);
        return;
      }

      if (finance.alterarStatusOcorrenciaDivida) {
        await finance.alterarStatusOcorrenciaDivida(
          item.ocorrencia.id,
          novoStatus,
        );
        return;
      }

      if (finance.atualizarStatusOcorrenciaDivida) {
        await finance.atualizarStatusOcorrenciaDivida(
          item.ocorrencia.id,
          novoStatus,
        );
        return;
      }

      if (finance.editarOcorrenciaDivida) {
        await finance.editarOcorrenciaDivida(ocorrenciaAtualizada);
        return;
      }

      if (finance.salvarOcorrenciaDivida) {
        await finance.salvarOcorrenciaDivida(ocorrenciaAtualizada);
        return;
      }

      Alert.alert(
        "Ação indisponível",
        "O useFinance precisa expor uma função para criar ou atualizar a ocorrência da dívida.",
      );
    } catch (erro) {
      console.error("Erro ao alterar status da dívida:", erro);

      Alert.alert(
        "Não foi possível atualizar",
        "Confira a conexão com o Google Sheets e tente novamente.",
      );
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

    Alert.alert(
      "Marcar como paga",
      `Deseja marcar “${item.divida.nome}” como paga?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: () => void persistirStatus(item, "pago"),
        },
      ],
    );
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
              const valor = valorDaDivida(item);

              return (
                <React.Fragment key={item.id}>
                  <LinhaDivida
                    divida={item.divida}
                    valor={valor}
                    pago={pago}
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
