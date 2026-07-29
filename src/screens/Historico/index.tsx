import React, { useEffect, useMemo, useState } from "react";

import {
  Alert,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  ArrowDownLeft,
  ArrowDownUp,
  ArrowUpRight,
  CalendarClock,
  ChevronLeft,
  Eye,
  EyeOff,
  Repeat,
  Search,
} from "lucide-react-native";

import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

import Valor from "../../components/ValorBlur";
import NovoGastoModal from "../../components/modals/NovoGastoModal";
import type {
  Divida,
  OcorrenciaDivida,
  Transacao,
} from "../../features/financas/types";
import useFinance from "../../hooks/useFinance";
import { CORAL, LIME_DARK, PURPLE, temaCores } from "../../theme/colors";
import { rotuloDia } from "../../utils/formatadores";

import MovimentacaoCard from "./MovimentacaoCard";
import { createStyles } from "./styles";

type Ordem = "recentes" | "antigos";

type ItemHistorico =
  | {
      tipoItem: "transacao";
      id: string;
      data: string;
      transacao: Transacao;
    }
  | {
      tipoItem: "divida";
      id: string;
      data: string;
      ocorrencia: OcorrenciaDivida;
      divida: Divida;
    };

const mesesNome = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function chaveMes(data?: string) {
  if (!data) return "";

  const match = String(data).match(/^(\d{4})-(\d{2})/);

  if (!match) return "";

  return `${match[1]}-${match[2]}`;
}

function nomeMes(chave: string) {
  const [ano, mes] = chave.split("-");
  const indexMes = Number(mes) - 1;

  if (!ano || indexMes < 0 || indexMes > 11) {
    return chave;
  }

  return `${mesesNome[indexMes]} ${ano}`;
}

function valorTexto(valor: number) {
  return Math.abs(Number(valor) || 0)
    .toFixed(2)
    .replace(".", ",");
}

function adicionarMeses(competencia: string, quantidade: number) {
  const [ano, mes] = competencia.split("-").map(Number);

  if (!ano || !mes) {
    return "";
  }

  const data = new Date(ano, mes - 1 + quantidade, 1);

  return (
    `${data.getFullYear()}-` + `${String(data.getMonth() + 1).padStart(2, "0")}`
  );
}

function competenciaDaParcela(inicio: string, numeroParcela: number) {
  const competenciaInicio = chaveMes(inicio);

  if (!competenciaInicio || numeroParcela < 1) {
    return "";
  }

  return adicionarMeses(competenciaInicio, numeroParcela - 1);
}

function criarOcorrenciaPrevista(
  divida: Divida,
  competencia: string,
  numeroParcela?: number,
): OcorrenciaDivida {
  const dia = Math.min(Math.max(Number(divida.vencimento) || 1, 1), 28);

  return {
    id: `PREV_${divida.id}_${competencia}`,
    dividaId: divida.id,
    competencia,
    numeroParcela,
    status: "pendente",
    vencimento: `${competencia}-${String(dia).padStart(2, "0")}`,
    pagoEm: "",
  };
}

function dataOcorrencia(ocorrencia: OcorrenciaDivida, divida: Divida) {
  if (ocorrencia.vencimento) {
    return ocorrencia.vencimento;
  }

  const competencia =
    chaveMes(ocorrencia.competencia) || chaveMes(divida.inicio);

  if (!competencia) {
    return "";
  }

  const dia = Math.min(Math.max(Number(divida.vencimento) || 1, 1), 28);

  return `${competencia}-${String(dia).padStart(2, "0")}`;
}

export default function Historico() {
  const [busca, setBusca] = useState("");
  const [oculto, setOculto] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [movimentacaoEditando, setMovimentacaoEditando] =
    useState<Transacao | null>(null);
  const [ordem, setOrdem] = useState<Ordem>("recentes");
  const [mesSelecionado, setMesSelecionado] = useState<string | null>(null);

  const navigation = useNavigation();

  const {
    transacoes,
    salarios,
    dividas,
    ocorrenciasDividas,
    modoEscuro,
    competenciaAtual,
    editarTransacao,
    excluirTransacao,
  } = useFinance();

  const cores = useMemo(() => temaCores(modoEscuro), [modoEscuro]);

  const styles = useMemo(() => createStyles(modoEscuro), [modoEscuro]);

  // Sempre abre na competência real atual.
  const mesAtual = mesSelecionado ?? competenciaAtual;
  const mesFuturo = mesAtual > competenciaAtual;

  // ========================================================
  // Previsões de dívidas
  // ========================================================

  const ocorrenciasPrevistas = useMemo(() => {
    const previstas: OcorrenciaDivida[] = [];

    const chavesReais = new Set(
      ocorrenciasDividas.map(
        (item) => `${item.dividaId}_${chaveMes(item.competencia)}`,
      ),
    );

    /*
     * Primeiro descobrimos até qual competência realmente
     * existe uma dívida parcelada a pagar.
     *
     * Dívidas fixas NÃO criam meses futuros sozinhas.
     */
    let ultimaCompetenciaParcelada = competenciaAtual;

    dividas.forEach((divida) => {
      if (!divida.ativa || divida.tipo !== "parcelada") {
        return;
      }

      const total = Number(divida.parcelas || 0);
      const pagas = Number(divida.parcelasPagas || 0);

      if (total <= 0 || pagas >= total) {
        return;
      }

      const competenciaFinal = competenciaDaParcela(divida.inicio, total);

      if (competenciaFinal && competenciaFinal > ultimaCompetenciaParcelada) {
        ultimaCompetenciaParcelada = competenciaFinal;
      }
    });

    const existeParceladaFutura = ultimaCompetenciaParcelada > competenciaAtual;

    dividas.forEach((divida) => {
      if (!divida.ativa) {
        return;
      }

      // ----------------------------------------------------
      // PARCELADAS
      // ----------------------------------------------------
      if (divida.tipo === "parcelada") {
        const total = Number(divida.parcelas || 0);
        const pagas = Number(divida.parcelasPagas || 0);

        for (let numero = pagas + 1; numero <= total; numero += 1) {
          const competencia = competenciaDaParcela(divida.inicio, numero);

          if (!competencia || competencia < competenciaAtual) {
            continue;
          }

          const chave = `${divida.id}_${competencia}`;

          if (!chavesReais.has(chave)) {
            previstas.push(
              criarOcorrenciaPrevista(divida, competencia, numero),
            );
          }
        }

        return;
      }

      // ----------------------------------------------------
      // FIXAS
      // ----------------------------------------------------
      /*
       * Uma dívida fixa só acompanha meses futuros quando
       * alguma parcelada também exige esses meses.
       *
       * Sem parcelada futura, a fixa fica somente até o
       * mês atual (ou usa a ocorrência real já existente).
       */
      const inicio = chaveMes(divida.inicio);

      const limite = existeParceladaFutura
        ? ultimaCompetenciaParcelada
        : competenciaAtual;

      let competencia = competenciaAtual;

      while (competencia <= limite) {
        if (!inicio || competencia >= inicio) {
          const chave = `${divida.id}_${competencia}`;

          if (!chavesReais.has(chave)) {
            previstas.push(criarOcorrenciaPrevista(divida, competencia));
          }
        }

        competencia = adicionarMeses(competencia, 1);
      }
    });

    return previstas;
  }, [dividas, ocorrenciasDividas, competenciaAtual]);

  const todasOcorrencias = useMemo(
    () => [...ocorrenciasDividas, ...ocorrenciasPrevistas],
    [ocorrenciasDividas, ocorrenciasPrevistas],
  );

  // ========================================================
  // Competências disponíveis
  // ========================================================

  const mesesDisponiveis = useMemo(() => {
    const meses = new Set<string>();

    transacoes.forEach((item) => {
      const competencia = chaveMes(item.data);
      if (competencia) meses.add(competencia);
    });

    salarios.forEach((item) => {
      const competencia = chaveMes(item.data);
      if (competencia) meses.add(competencia);
    });

    todasOcorrencias.forEach((item) => {
      const competencia = chaveMes(item.competencia);
      if (competencia) meses.add(competencia);
    });

    if (competenciaAtual) {
      meses.add(competenciaAtual);
    }

    return Array.from(meses).sort((a, b) => a.localeCompare(b));
  }, [transacoes, salarios, todasOcorrencias, competenciaAtual]);

  useEffect(() => {
    if (mesSelecionado && !mesesDisponiveis.includes(mesSelecionado)) {
      setMesSelecionado(null);
    }
  }, [mesSelecionado, mesesDisponiveis]);

  // ========================================================
  // Dados da competência
  // ========================================================

  const transacoesDoMes = useMemo(
    () => transacoes.filter((item) => chaveMes(item.data) === mesAtual),
    [transacoes, mesAtual],
  );

  /*
   * ========================================================
   * SALÁRIO VIGENTE
   * ========================================================
   *
   * O salário continua valendo nos meses seguintes até que
   * exista um novo salário cadastrado.
   *
   * Exemplo:
   *
   * Julho     R$ 3.000 cadastrado
   * Agosto    usa R$ 3.000
   * Setembro  usa R$ 3.000
   *
   * Outubro   R$ 3.500 cadastrado
   * Novembro  usa R$ 3.500
   *
   * Isso permite calcular corretamente os meses futuros sem
   * precisar criar salários artificiais no backend.
   */

  const salariosVigentes = useMemo(() => {
    if (!mesAtual) {
      return [];
    }

    /*
     * Primeiro pegamos somente salários que já começaram
     * até a competência selecionada.
     */
    const salariosValidos = salarios.filter((item) => {
      const competenciaSalario = chaveMes(item.data);

      return competenciaSalario && competenciaSalario <= mesAtual;
    });

    if (salariosValidos.length === 0) {
      return [];
    }

    /*
     * Descobrimos qual é a competência de salário mais
     * recente até o mês selecionado.
     */
    const ultimaCompetenciaSalario = salariosValidos.reduce((ultima, item) => {
      const competencia = chaveMes(item.data);

      if (!ultima || competencia > ultima) {
        return competencia;
      }

      return ultima;
    }, "");

    /*
     * Mantemos todos os salários cadastrados nessa última
     * competência.
     *
     * Isso é importante caso existam duas ou mais fontes
     * de salário cadastradas no mesmo mês.
     */
    return salariosValidos.filter(
      (item) => chaveMes(item.data) === ultimaCompetenciaSalario,
    );
  }, [salarios, mesAtual]);

  const ocorrenciasDoMes = useMemo(
    () =>
      todasOcorrencias.filter(
        (item) => chaveMes(item.competencia) === mesAtual,
      ),
    [todasOcorrencias, mesAtual],
  );

  // ========================================================
  // Timeline unificada: transações + dívidas
  // ========================================================

  const itensDoMes = useMemo<ItemHistorico[]>(() => {
    const transacoesTimeline: ItemHistorico[] = transacoesDoMes.map(
      (transacao) => ({
        tipoItem: "transacao",
        id: `TR_${transacao.id}`,
        data: transacao.data,
        transacao,
      }),
    );

    const dividasTimeline: ItemHistorico[] = ocorrenciasDoMes.flatMap(
      (ocorrencia) => {
        const divida = dividas.find((item) => item.id === ocorrencia.dividaId);

        if (!divida) {
          return [];
        }

        return [
          {
            tipoItem: "divida" as const,
            id: `DB_${ocorrencia.id}`,
            data: dataOcorrencia(ocorrencia, divida),
            ocorrencia,
            divida,
          },
        ];
      },
    );

    return [...transacoesTimeline, ...dividasTimeline];
  }, [transacoesDoMes, ocorrenciasDoMes, dividas]);

  const itensFiltrados = useMemo(() => {
    const texto = busca.trim().toLowerCase();
    const textoValor = texto.replace(".", ",");

    return [...itensDoMes]
      .filter((item) => {
        if (!texto) return true;

        if (item.tipoItem === "transacao") {
          const transacao = item.transacao;

          return (
            String(transacao.nome ?? "")
              .toLowerCase()
              .includes(texto) ||
            String(transacao.categoria ?? "")
              .toLowerCase()
              .includes(texto) ||
            valorTexto(transacao.valor).includes(textoValor)
          );
        }

        const { divida, ocorrencia } = item;

        const detalhe =
          divida.tipo === "parcelada"
            ? `parcela ${ocorrencia.numeroParcela ?? ""}/${divida.parcelas ?? ""}`
            : "dívida fixa";

        return (
          String(divida.nome ?? "")
            .toLowerCase()
            .includes(texto) ||
          detalhe.toLowerCase().includes(texto) ||
          String(ocorrencia.status ?? "")
            .toLowerCase()
            .includes(texto) ||
          valorTexto(divida.valor).includes(textoValor)
        );
      })
      .sort((a, b) => {
        const comparacao = String(a.data).localeCompare(String(b.data));

        if (comparacao !== 0) {
          return ordem === "recentes" ? -comparacao : comparacao;
        }

        return ordem === "recentes"
          ? b.id.localeCompare(a.id)
          : a.id.localeCompare(b.id);
      });
  }, [itensDoMes, busca, ordem]);

  // ========================================================
  // Totais
  // ========================================================

  /*
   * Gastos normais registrados no mês.
   */
  const totalGastosMes = useMemo(
    () =>
      transacoesDoMes
        .filter((item) => item.tipo === "saida")
        .reduce((soma, item) => soma + Math.abs(Number(item.valor) || 0), 0),
    [transacoesDoMes],
  );

  /*
   * Dívidas pertencentes à competência.
   *
   * Cada dívida é contabilizada apenas uma vez no mês,
   * mesmo que exista alguma ocorrência duplicada.
   */
  const totalDividasMes = useMemo(() => {
    const contabilizadas = new Set<string>();

    return ocorrenciasDoMes.reduce((soma, ocorrencia) => {
      if (contabilizadas.has(ocorrencia.dividaId)) {
        return soma;
      }

      const divida = dividas.find((item) => item.id === ocorrencia.dividaId);

      if (!divida) {
        return soma;
      }

      contabilizadas.add(ocorrencia.dividaId);

      return soma + Math.abs(Number(divida.valor) || 0);
    }, 0);
  }, [ocorrenciasDoMes, dividas]);

  /*
   * O card "Saídas" representa agora todo dinheiro
   * comprometido naquele mês:
   *
   * gastos normais + dívidas.
   */
  const totalSaidasMes = totalGastosMes + totalDividasMes;

  /*
   * Entradas avulsas cadastradas naquele mês.
   */
  const totalEntradasAvulsasMes = useMemo(
    () =>
      transacoesDoMes
        .filter((item) => item.tipo === "entrada")
        .reduce((soma, item) => soma + Math.abs(Number(item.valor) || 0), 0),
    [transacoesDoMes],
  );

  /*
   * Salário vigente.
   *
   * Se não existir um novo salário no mês seguinte,
   * continuamos usando o salário mais recente.
   */
  const totalSalariosVigentes = useMemo(
    () =>
      salariosVigentes.reduce(
        (soma, item) => soma + Math.abs(Number(item.valor) || 0),
        0,
      ),
    [salariosVigentes],
  );

  /*
   * Entradas totais utilizadas no cálculo do saldo.
   */
  const totalEntradasMes = totalEntradasAvulsasMes + totalSalariosVigentes;

  /*
   * Saldo disponível / previsto:
   *
   * salário vigente
   * + outras entradas
   * - gastos
   * - dívidas
   */
  const saldoMes = totalEntradasMes - totalSaidasMes;

  // ========================================================
  // Agrupamento
  // ========================================================

  const grupos = useMemo(() => {
    const resultado: Record<string, ItemHistorico[]> = {};

    itensFiltrados.forEach((item) => {
      const rotulo = item.data ? rotuloDia(item.data) : "Sem data";

      if (!resultado[rotulo]) {
        resultado[rotulo] = [];
      }

      resultado[rotulo].push(item);
    });

    return resultado;
  }, [itensFiltrados]);

  // ========================================================
  // Ações
  // ========================================================

  function alternarOrdem() {
    setOrdem((atual) => (atual === "recentes" ? "antigos" : "recentes"));
  }

  function abrirEdicao(item: Transacao) {
    if (item.id.includes("TEMP_")) return;

    setMovimentacaoEditando(item);
    setModalEditar(true);
  }

  function excluir(id: string) {
    if (id.includes("TEMP_")) return;

    Alert.alert(
      "Excluir movimentação",
      "Deseja realmente excluir esta movimentação?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => {
            void excluirTransacao(id);
          },
        },
      ],
    );
  }

  const gruposLista = useMemo(
    () =>
      Object.entries(grupos).map(([titulo, itens]) => ({
        titulo,
        itens,
      })),
    [grupos],
  );

  const headerHistorico = (
    <>
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ChevronLeft size={22} color={cores.INK} />
          <Text style={styles.tituloButton}>Inicio</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.olhoBotao}
          onPress={() => setOculto((valor) => !valor)}
        >
          {oculto ? (
            <EyeOff size={22} color={cores.GRAY} />
          ) : (
            <Eye size={22} color={cores.GRAY} />
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.titulo}>Histórico</Text>

      <Text style={styles.subtitulo}>
        {mesFuturo
          ? "Movimentações e compromissos previstos"
          : "Movimentações e compromissos do mês"}
      </Text>

      <View style={styles.buscaBox}>
        <Search size={18} color={cores.GRAY} />

        <TextInput
          placeholder="Buscar nome, categoria ou valor..."
          placeholderTextColor={cores.GRAY}
          value={busca}
          onChangeText={setBusca}
          style={styles.buscaInput}
        />
      </View>

      <FlatList
        horizontal
        data={mesesDisponiveis}
        keyExtractor={(mes) => mes}
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.meses}
        renderItem={({ item: mes }) => {
          const selecionado = mes === mesAtual;

          return (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setMesSelecionado(mes)}
              style={[
                styles.mesButton,
                selecionado && styles.mesButtonSelecionado,
              ]}
            >
              <Text
                style={[
                  styles.mesTexto,
                  selecionado && styles.mesTextoSelecionado,
                ]}
              >
                {nomeMes(mes)}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {mesFuturo && (
        <View style={styles.previsaoBox}>
          <CalendarClock size={16} color={PURPLE} />
          <Text style={styles.previsaoTexto}>
            Este mês contém valores previstos.
          </Text>
        </View>
      )}

      <View style={styles.resumo}>
        <View style={styles.resumoCard}>
          <View style={styles.resumoIconeEntrada}>
            <ArrowUpRight size={17} color={LIME_DARK} />
          </View>

          <Text style={styles.resumoLabel}>
            {mesFuturo ? "Saldo previsto" : "Saldo disponível"}
          </Text>

          <Valor
            valor={saldoMes}
            oculto={oculto}
            cor={saldoMes >= 0 ? LIME_DARK : CORAL}
            shrink
            style={styles.resumoValor}
          />
        </View>

        <View style={styles.resumoCard}>
          <View style={styles.resumoIconeSaida}>
            <ArrowDownLeft size={17} color={CORAL} />
          </View>

          <Text style={styles.resumoLabel}>Saídas</Text>

          <Valor
            valor={totalSaidasMes}
            oculto={oculto}
            negativo
            cor={CORAL}
            shrink
            style={styles.resumoValor}
          />
        </View>
      </View>

      <TouchableOpacity
        style={styles.ordenacao}
        activeOpacity={0.8}
        onPress={alternarOrdem}
      >
        <ArrowDownUp size={16} color={cores.GRAY} style={{ marginRight: 6 }} />
        <Text style={styles.ordenacaoTexto}>
          {ordem === "recentes" ? "Mais recentes" : "Mais antigos"}
        </Text>
      </TouchableOpacity>
    </>
  );

  return (
    <SafeAreaView style={styles.screen}>
      <NovoGastoModal
        visivel={modalEditar}
        transacao={movimentacaoEditando}
        onFechar={() => {
          setModalEditar(false);
          setMovimentacaoEditando(null);
        }}
        onSalvar={(nova) => {
          setModalEditar(false);
          setMovimentacaoEditando(null);
          void editarTransacao(nova);
        }}
      />

      <FlatList
        data={gruposLista}
        keyExtractor={(item) => item.titulo}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
        ListHeaderComponent={headerHistorico}
        ListEmptyComponent={
          <Text style={styles.vazio}>
            Nenhuma movimentação ou compromisso encontrado.
          </Text>
        }
        renderItem={({ item: grupo }) => (
          <View style={styles.grupo}>
            <Text style={styles.grupoTitulo}>{grupo.titulo}</Text>

            {grupo.itens.map((item) => {
              if (item.tipoItem === "transacao") {
                return (
                  <MovimentacaoCard
                    key={item.id}
                    item={item.transacao}
                    oculto={oculto}
                    onEditar={abrirEdicao}
                    onExcluir={excluir}
                  />
                );
              }

              const { divida, ocorrencia } = item;
              const futuro =
                chaveMes(ocorrencia.competencia) > competenciaAtual;

              const status = futuro
                ? "Previsto"
                : ocorrencia.status === "pago"
                  ? "Pago"
                  : "Pendente";

              const detalhe =
                divida.tipo === "parcelada"
                  ? `Parcela ${ocorrencia.numeroParcela ?? "?"}/${divida.parcelas ?? "?"}`
                  : "Dívida fixa";

              return (
                <View key={item.id} style={styles.linha}>
                  <View style={styles.iconeDivida}>
                    <Repeat size={20} color={PURPLE} />
                  </View>

                  <View style={styles.info}>
                    <Text numberOfLines={1} style={styles.nome}>
                      {divida.nome}
                    </Text>

                    <View style={styles.dividaDetalhes}>
                      <Text style={styles.categoria}>{detalhe}</Text>

                      <Text style={styles.dividaSeparador}>•</Text>

                      <Text
                        style={[
                          styles.dividaStatus,
                          futuro
                            ? styles.statusPrevisto
                            : ocorrencia.status === "pago"
                              ? styles.statusPago
                              : styles.statusPendente,
                        ]}
                      >
                        {status}
                      </Text>
                    </View>
                  </View>

                  <Valor
                    valor={Math.abs(Number(divida.valor) || 0)}
                    oculto={oculto}
                    negativo
                    cor={CORAL}
                    style={styles.valor}
                  />
                </View>
              );
            })}
          </View>
        )}
      />
    </SafeAreaView>
  );
}
