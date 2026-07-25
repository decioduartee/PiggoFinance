import React, { useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Search,
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronLeft,
  ArrowDownToDot,
  ArrowUpFromDot,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { styles } from "./styles";
import { CORAL, ICON_INK, LIME_DARK } from "../../theme/colors";
import useFinance from "../../hooks/useFinance";
import Valor from "../../components/Valor";
import { rotuloDia } from "../../utils/formatadores";
import MovimentacaoCard from "./MovimentacaoCard";
import { Transacao } from "../../features/financas";
import NovoGastoModal from "../../components/modals/NovoGastoModal";

type Ordem = "recentes" | "antigos";

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

function chaveMes(data: string) {
  return data.slice(0, 7); // 2026-07
}

function nomeMes(chave: string) {
  const [ano, mes] = chave.split("-");
  const indexMes = Number(mes) - 1;

  return `${mesesNome[indexMes]} ${ano}`;
}

function valorTexto(valor: number) {
  return String(Math.abs(valor)).replace(".", ",");
}

export default function Historico() {
  const [busca, setBusca] = useState("");
  const [oculto, setOculto] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [movimentacaoEditando, setMovimentacaoEditando] =
    useState<Transacao | null>(null);

  const [ordem, setOrdem] = useState<Ordem>("recentes");

  const navigation = useNavigation();

  const { transacoes, setTransacoes, salarios, dividas } = useFinance();

  const mesesDisponiveis = useMemo(() => {
    const meses = new Set<string>();

    transacoes.forEach((item) => {
      if (item.data) {
        meses.add(chaveMes(item.data));
      }
    });

    salarios.forEach((item) => {
      if (item.data) {
        meses.add(chaveMes(item.data));
      }
    });

    return Array.from(meses).sort((a, b) => b.localeCompare(a));
  }, [transacoes, salarios]);

  const [mesSelecionado, setMesSelecionado] = useState<string | null>(null);

  const mesAtual =
    mesSelecionado ?? mesesDisponiveis[0] ?? chaveMes(new Date().toISOString());

  const transacoesDoMes = useMemo(() => {
    return transacoes.filter((item) => chaveMes(item.data) === mesAtual);
  }, [transacoes, mesAtual]);

  const transacoesFiltradas = useMemo(() => {
    const texto = busca.trim().toLowerCase().replace(",", ".");

    return [...transacoesDoMes]
      .filter((item) => {
        if (!texto) return true;

        const nome = item.nome.toLowerCase();
        const categoria = item.categoria.toLowerCase();
        const valor = valorTexto(item.valor);

        return (
          nome.includes(texto) ||
          categoria.includes(texto) ||
          valor.includes(texto)
        );
      })
      .sort((a, b) => {
        if (a.data !== b.data) {
          return ordem === "recentes"
            ? b.data.localeCompare(a.data)
            : a.data.localeCompare(b.data);
        }

        return ordem === "recentes"
          ? Number(b.id) - Number(a.id)
          : Number(a.id) - Number(b.id);
      });
  }, [transacoesDoMes, busca, ordem]);

  const totalSaidasMes = useMemo(() => {
    return Math.abs(
      transacoesDoMes
        .filter((item) => item.tipo === "saida")
        .reduce((soma, item) => soma + Math.abs(item.valor), 0),
    );
  }, [transacoesDoMes]);

  const totalEntradasMes = useMemo(() => {
    const entradasTransacoes = transacoesDoMes
      .filter((item) => item.tipo === "entrada")
      .reduce((soma, item) => soma + Math.abs(item.valor), 0);

    const entradasSalarios = salarios
      .filter((item) => chaveMes(item.data) === mesAtual)
      .reduce((soma, item) => soma + Math.abs(item.valor), 0);

    return entradasTransacoes + entradasSalarios;
  }, [transacoesDoMes, salarios, mesAtual]);

  const totalDividasMes = useMemo(() => {
    return dividas
      .filter((item) => item.ativa !== false)
      .reduce((soma, item) => soma + Math.abs(item.valor), 0);
  }, [dividas]);

  const saldoDisponivelMes = totalEntradasMes - totalSaidasMes;

  const grupos = useMemo(() => {
    const out: Record<string, typeof transacoesFiltradas> = {};

    transacoesFiltradas.forEach((item) => {
      const rotulo = rotuloDia(item.data);

      if (!out[rotulo]) out[rotulo] = [];

      out[rotulo].push(item);
    });

    return out;
  }, [transacoesFiltradas]);

  function alternarOrdem() {
    setOrdem((atual) => (atual === "recentes" ? "antigos" : "recentes"));
  }

  function excluir(id: string) {
    Alert.alert(
      "Excluir movimentação",
      "Deseja realmente excluir esta movimentação?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => {
            setTransacoes((prev) => prev.filter((item) => item.id !== id));
          },
        },
      ],
    );
  }
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
          setTransacoes((prev) =>
            prev.map((item) => (item.id === nova.id ? nova : item)),
          );

          setModalEditar(false);
          setMovimentacaoEditando(null);
        }}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ChevronLeft size={22} color="#16181a" />
            <Text style={styles.tituloButton}>Inicio</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.olhoBotao}
            onPress={() => setOculto((v) => !v)}
          >
            {oculto ? (
              <EyeOff size={22} color="#8b8f94" />
            ) : (
              <Eye size={22} color="#8b8f94" />
            )}
          </TouchableOpacity>
        </View>

        <View>
          <Text style={styles.titulo}>Histórico</Text>

          <Text style={styles.subtitulo}>
            Todas as movimentações feitas no mês
          </Text>
        </View>

        {/* BUSCA */}

        <View style={styles.buscaBox}>
          <Search size={18} color="#8b8f94" />

          <TextInput
            placeholder="Buscar nome, categoria ou valor..."
            placeholderTextColor="#8b8f94"
            value={busca}
            onChangeText={setBusca}
            style={styles.buscaInput}
          />
        </View>

        {/* MESES */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.meses}
        >
          {mesesDisponiveis.map((mes) => {
            const selecionado = mes === mesAtual;

            return (
              <TouchableOpacity
                key={mes}
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
          })}
        </ScrollView>

        {/* RESUMO */}

        <View style={styles.resumo}>
          <View style={styles.resumoCard}>
            <View style={styles.resumoIconeEntrada}>
              <ArrowUpRight size={17} color={LIME_DARK} />
            </View>

            <Text style={styles.resumoLabel}>Saldo disponível</Text>

            <Valor
              valor={saldoDisponivelMes}
              oculto={oculto}
              cor={saldoDisponivelMes >= 0 ? LIME_DARK : CORAL}
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
              style={styles.resumoValor}
            />
          </View>
        </View>

        {/* ORDENAÇÃO */}

        <TouchableOpacity
          style={styles.ordenacao}
          activeOpacity={0.8}
          onPress={alternarOrdem}
        >
          {ordem === "recentes" ? (
            <ArrowUpFromDot
              size={16}
              color="#8b8f94"
              style={{ marginRight: 6 }}
            />
          ) : (
            <ArrowDownToDot
              size={16}
              color="#8b8f94"
              style={{ marginRight: 6 }}
            />
          )}

          <Text style={styles.ordenacaoTexto}>
            {ordem === "recentes" ? "Mais recentes" : "Mais antigos"}
          </Text>
        </TouchableOpacity>

        {/* LISTA */}

        {Object.keys(grupos).length === 0 && (
          <Text style={styles.vazio}>Nenhuma movimentação encontrada.</Text>
        )}

        {Object.entries(grupos).map(([grupo, itens]) => (
          <View key={grupo} style={styles.grupo}>
            <Text style={styles.grupoTitulo}>{grupo}</Text>

            {itens.map((item) => (
              <MovimentacaoCard
                key={item.id}
                item={item}
                oculto={oculto}
                onEditar={(item) => {
                  setMovimentacaoEditando(item);
                  setModalEditar(true);
                }}
                onExcluir={excluir}
              />
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
