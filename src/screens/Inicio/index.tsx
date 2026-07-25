import React, { useMemo, useState } from "react";
import { ScrollView } from "react-native";
import { styles } from "./styles";
import { temaCores } from "../../theme/colors";
import { getMesAtualKey, hojeISO } from "../../utils/formatadores";
import { SafeAreaView } from "react-native-safe-area-context";
import useFinance from "../../hooks/useFinance";
import NovoGastoModal from "../../components/modals/NovoGastoModal";
import FluxoCaixaModal from "../../components/modals/FluxoCaixaModal";
import CofrinhoModal from "../../components/modals/CofrinhoModal";
import DividasFixasModal from "../../components/modals/DividasFixasModal";
import useGraficoSaldo from "../../hooks/useGraficoSaldo";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/AppNavigator";
import ConfiguracoesModal from "../../components/modals/ConfiguracoesModal";
import { FinanceService } from "../../features/financas";
import {
  agruparPorDia,
  filtrarGastosDoMes,
  limitarTransacoesDosGrupos,
  somarGastos,
} from "./helpers";
import {
  GastosMesCard,
  GraficoCard,
  InicioHeader,
  ListaGastosRecentes,
  SaldoMesCard,
  TopCards,
} from "./components";

export default function Inicio() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [oculto, setOculto] = useState(false);
  const [modalGasto, setModalGasto] = useState(false);
  const [modalFluxo, setModalFluxo] = useState(false);
  const [modalCofrinho, setModalCofrinho] = useState(false);
  const [modalDividas, setModalDividas] = useState(false);
  const [modalConfiguracoes, setModalConfiguracoes] = useState(false);

  const {
    salarios,
    dividas,
    transacoes,
    cofrinho,

    perfilAtual,
    trocarPerfil,

    modoEscuro,
    alterarModoEscuro,

    setSalarios,
    setDividas,
    setCofrinho,

    adicionarTransacao,
    adicionarSalario,

    totalEntradas,
    totalDividas,
  } = useFinance();

  const cores = temaCores(modoEscuro);
  const fundoIcone = modoEscuro ? "#2A2D33" : "#F3F4F6";
  const mesAtual = getMesAtualKey();

  const gastosDoMes = useMemo(
    () => filtrarGastosDoMes(transacoes, mesAtual),
    [transacoes, mesAtual],
  );

  const grupos = useMemo(() => agruparPorDia(gastosDoMes), [gastosDoMes]);

  const gruposLimitados = useMemo(
    () => limitarTransacoesDosGrupos(grupos, 5),
    [grupos],
  );

  const quantidadeGastosMes = gastosDoMes.length;
  const totalSaidasMes = useMemo(() => somarGastos(gastosDoMes), [gastosDoMes]);
  const saldoDisponivelMes = totalEntradas - totalSaidasMes - totalDividas;
  const dadosGrafico = useGraficoSaldo(salarios, transacoes);

  return (
    <SafeAreaView
      style={[
        styles.screen,
        {
          backgroundColor: cores.BG,
        },
      ]}
    >
      <FluxoCaixaModal
        visivel={modalFluxo}
        salarios={salarios}
        dividas={dividas}
        onFechar={() => setModalFluxo(false)}
        onAbrirDividas={() => {
          setModalFluxo(false);
          setModalDividas(true);
        }}
        onSalvarSalario={async (id, nome, valor) => {
          try {
            if (id) {
              const atualizado = await FinanceService.editarSalario({
                id,
                nome,
                valor,
                data: hojeISO(),
                responsavel: perfilAtual.id,
              });

              setSalarios((prev) =>
                prev.map((s) =>
                  s.id === id
                    ? {
                        ...atualizado,
                        responsavel: perfilAtual.id,
                      }
                    : s,
                ),
              );
            } else {
              // Atualização otimista: aparece imediatamente na interface.
              // O AppContext/store sincroniza com o Google Sheets em segundo plano.
              void adicionarSalario({
                nome,
                valor,
                data: hojeISO(),
              });
            }
          } catch (error) {
            console.error("Erro ao salvar salário:", error);
          }
        }}
        onApagarSalario={async (id) => {
          try {
            await FinanceService.excluirSalario(id);

            setSalarios((prev) => prev.filter((s) => s.id !== id));
          } catch (error) {
            console.error("Erro ao excluir salário:", error);
          }
        }}
      />

      <CofrinhoModal
        visivel={modalCofrinho}
        valorAtual={cofrinho}
        onFechar={() => setModalCofrinho(false)}
        onSalvar={(tipo, valor) => {
          setCofrinho((prev) =>
            tipo === "deposito" ? prev + valor : Math.max(0, prev - valor),
          );
        }}
      />

      <DividasFixasModal
        visivel={modalDividas}
        dividas={dividas}
        onFechar={() => setModalDividas(false)}
        onSalvar={(divida) => {
          setDividas((prev) => {
            const existe = prev.some((d) => d.id === divida.id);

            if (existe) {
              return prev.map((d) => (d.id === divida.id ? divida : d));
            }

            return [...prev, divida];
          });
        }}
        onExcluir={(id) => {
          setDividas((prev) => prev.filter((d) => d.id !== id));
        }}
        onAlterarStatus={(id, ativa) => {
          setDividas((prev) =>
            prev.map((d) => (d.id === id ? { ...d, ativa } : d)),
          );
        }}
      />

      <NovoGastoModal
        visivel={modalGasto}
        onFechar={() => setModalGasto(false)}
        onSalvar={async (transacao) => {
          try {
            await adicionarTransacao(transacao);

            setModalGasto(false);
          } catch (error) {
            console.error("Erro ao salvar transação:", error);
          }
        }}
      />

      <ConfiguracoesModal
        visivel={modalConfiguracoes}
        perfilAtual={perfilAtual}
        modoEscuro={modoEscuro}
        sincronizado
        sincronizando={false}
        onFechar={() => setModalConfiguracoes(false)}
        onTrocarPerfil={trocarPerfil}
        onAlterarModoEscuro={alterarModoEscuro}
        onSincronizar={() => {}}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <InicioHeader
          nomePerfil={perfilAtual.nome}
          oculto={oculto}
          cores={cores}
          onAlternarOculto={() => setOculto((v) => !v)}
          onAbrirConfiguracoes={() => setModalConfiguracoes(true)}
        />

        <TopCards
          cores={cores}
          oculto={oculto}
          cofrinho={cofrinho}
          totalEntradas={totalEntradas}
          totalDividas={totalDividas}
          totalSaidasMes={totalSaidasMes}
          saldoDisponivelMes={saldoDisponivelMes}
          onAbrirCofrinho={() => setModalCofrinho(true)}
          onAbrirFluxo={() => setModalFluxo(true)}
        />

        <SaldoMesCard
          cores={cores}
          oculto={oculto}
          saldoDisponivelMes={saldoDisponivelMes}
        />

        <GastosMesCard
          cores={cores}
          fundoIcone={fundoIcone}
          oculto={oculto}
          modoEscuro={modoEscuro}
          quantidadeGastosMes={quantidadeGastosMes}
          ultimoGasto={gastosDoMes[0]}
          onAdicionarGasto={() => setModalGasto(true)}
          onVerTodas={() => navigation.navigate("Historico")}
        />

        <GraficoCard
          cores={cores}
          dadosGrafico={dadosGrafico}
          oculto={oculto}
        />

        <ListaGastosRecentes
          grupos={gruposLimitados}
          cores={cores}
          fundoIcone={fundoIcone}
          oculto={oculto}
          modoEscuro={modoEscuro}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
