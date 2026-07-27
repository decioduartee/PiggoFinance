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
  DividasFixasCard,
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

  // ==========================================================
  // Modais / Interface
  // ==========================================================

  const [oculto, setOculto] = useState(false);

  const [modalGasto, setModalGasto] = useState(false);

  const [modalFluxo, setModalFluxo] = useState(false);

  const [modalCofrinho, setModalCofrinho] = useState(false);

  const [modalDividas, setModalDividas] = useState(false);

  const [modalConfiguracoes, setModalConfiguracoes] =
    useState(false);

  // ==========================================================
  // Finance Context
  // ==========================================================

  const {
    salarios,
    dividas,
    ocorrenciasDividas,
    transacoes,
    cofrinho,

    perfilAtual,
    trocarPerfil,

    modoEscuro,
    alterarModoEscuro,

    setSalarios,
    setCofrinho,

    adicionarTransacao,
    adicionarSalario,

    adicionarDivida,
    editarDivida,
    excluirDivida,
    alterarStatusDivida,
    alterarStatusOcorrencia,

    totalEntradas,
    totalDividas,
  } = useFinance();

  // ==========================================================
  // Tema
  // ==========================================================

  const cores = temaCores(modoEscuro);

  const fundoIcone =
    modoEscuro
      ? "#2A2D33"
      : "#F3F4F6";

  // ==========================================================
  // Mês atual
  // ==========================================================

  const mesAtual = getMesAtualKey();

  const agora = new Date();

  const competenciaAtual =
    `${agora.getFullYear()}-` +
    `${String(
      agora.getMonth() + 1,
    ).padStart(2, "0")}`;

  // ==========================================================
  // Normalização da competência
  // ==========================================================

  function normalizarCompetencia(
    valor: string,
  ) {
    if (!valor) {
      return "";
    }

    /*
     * Aceita tanto:
     *
     * 2026-07
     *
     * quanto:
     *
     * 2026-07-01T03:00:00.000Z
     */

    return String(valor).slice(0, 7);
  }

  // ==========================================================
  // Ocorrências das dívidas do mês atual
  // ==========================================================

  const ocorrenciasMesAtual =
    useMemo(() => {
      return ocorrenciasDividas.filter(
        (ocorrencia) =>
          normalizarCompetencia(
            ocorrencia.competencia,
          ) === competenciaAtual,
      );
    }, [
      ocorrenciasDividas,
      competenciaAtual,
    ]);

  // ==========================================================
  // Status Pago / Pendente
  // ==========================================================

  const statusDividas =
    useMemo<
      Record<string, boolean>
    >(() => {
      const status:
        Record<string, boolean> =
        {};

      ocorrenciasMesAtual.forEach(
        (ocorrencia) => {
          status[
            ocorrencia.dividaId
          ] =
            ocorrencia.status ===
            "pago";
        },
      );

      return status;
    }, [ocorrenciasMesAtual]);

  // ==========================================================
  // Alterar pagamento da dívida
  // ==========================================================

  async function alterarPagamentoDivida(
    dividaId: string,
  ) {
    try {
      const ocorrencia =
        ocorrenciasDividas.find(
          (item) =>
            item.dividaId ===
              dividaId &&
            normalizarCompetencia(
              item.competencia,
            ) ===
              competenciaAtual,
        );

      if (!ocorrencia) {
        console.warn(
          "Ocorrência da dívida não encontrada:",
          dividaId,
          "competência:",
          competenciaAtual,
        );

        return;
      }

      const novoStatus =
        ocorrencia.status ===
        "pago"
          ? "pendente"
          : "pago";

      /*
       * O AppContext agora faz:
       *
       * 1. Atualização otimista
       * 2. Atualização de parcelasPagas
       * 3. Requisição para backend
       * 4. Sincronização com Google Sheets
       * 5. Rollback em caso de erro
       */

      await alterarStatusOcorrencia(
        ocorrencia.id,
        novoStatus,
      );
    } catch (error) {
      console.error(
        "Erro ao alterar pagamento da dívida:",
        error,
      );
    }
  }

  // ==========================================================
  // Gastos do mês
  // ==========================================================

  const gastosDoMes =
    useMemo(
      () =>
        filtrarGastosDoMes(
          transacoes,
          mesAtual,
        ),
      [
        transacoes,
        mesAtual,
      ],
    );

  const grupos =
    useMemo(
      () =>
        agruparPorDia(
          gastosDoMes,
        ),
      [gastosDoMes],
    );

  const gruposLimitados =
    useMemo(
      () =>
        limitarTransacoesDosGrupos(
          grupos,
          5,
        ),
      [grupos],
    );

  const quantidadeGastosMes =
    gastosDoMes.length;

  const totalSaidasMes =
    useMemo(
      () =>
        somarGastos(
          gastosDoMes,
        ),
      [gastosDoMes],
    );

  const saldoDisponivelMes =
    totalEntradas -
    totalSaidasMes -
    totalDividas;

  // ==========================================================
  // Gráfico
  // ==========================================================

  const dadosGrafico =
    useGraficoSaldo(
      salarios,
      transacoes,
    );

  // ==========================================================
  // Render
  // ==========================================================

  return (
    <SafeAreaView
      style={[
        styles.screen,
        {
          backgroundColor:
            cores.BG,
        },
      ]}
    >
      {/* ==================================================== */}
      {/* FLUXO DE CAIXA */}
      {/* ==================================================== */}

      <FluxoCaixaModal
        visivel={modalFluxo}
        salarios={salarios}
        dividas={dividas}
        onFechar={() =>
          setModalFluxo(false)
        }
        onAbrirDividas={() => {
          setModalFluxo(false);

          setModalDividas(true);
        }}
        onSalvarSalario={async (
          id,
          nome,
          valor,
        ) => {
          try {
            if (id) {
              const atualizado =
                await FinanceService
                  .editarSalario({
                    id,
                    nome,
                    valor,
                    data:
                      hojeISO(),
                    responsavel:
                      perfilAtual.id,
                  });

              setSalarios(
                (prev) =>
                  prev.map(
                    (salario) =>
                      salario.id ===
                      id
                        ? {
                            ...atualizado,

                            responsavel:
                              perfilAtual.id,
                          }
                        : salario,
                  ),
              );

              return;
            }

            /*
             * Salário novo já possui
             * atualização otimista.
             */

            void adicionarSalario({
              nome,
              valor,
              data:
                hojeISO(),
            });
          } catch (error) {
            console.error(
              "Erro ao salvar salário:",
              error,
            );
          }
        }}
        onApagarSalario={async (
          id,
        ) => {
          try {
            await FinanceService
              .excluirSalario(
                id,
              );

            setSalarios(
              (prev) =>
                prev.filter(
                  (salario) =>
                    salario.id !==
                    id,
                ),
            );
          } catch (error) {
            console.error(
              "Erro ao excluir salário:",
              error,
            );
          }
        }}
      />

      {/* ==================================================== */}
      {/* COFRINHO */}
      {/* ==================================================== */}

      <CofrinhoModal
        visivel={modalCofrinho}
        valorAtual={cofrinho}
        onFechar={() =>
          setModalCofrinho(
            false,
          )
        }
        onSalvar={(
          tipo,
          valor,
        ) => {
          setCofrinho(
            (prev) =>
              tipo ===
              "deposito"
                ? prev + valor
                : Math.max(
                    0,
                    prev - valor,
                  ),
          );
        }}
      />

      {/* ==================================================== */}
      {/* DÍVIDAS FIXAS */}
      {/* ==================================================== */}

      <DividasFixasModal
        visivel={modalDividas}
        dividas={dividas}
        onFechar={() =>
          setModalDividas(
            false,
          )
        }

        // ====================================================
        // Criar / editar
        // ====================================================

        onSalvar={async (
          dados,
          id,
        ) => {
          try {
            if (id) {
              await editarDivida(
                id,
                dados,
              );

              return;
            }

            await adicionarDivida(
              dados,
            );
          } catch (error) {
            console.error(
              "Erro ao salvar dívida:",
              error,
            );
          }
        }}

        // ====================================================
        // Excluir
        // ====================================================

        onExcluir={async (
          id,
        ) => {
          try {
            await excluirDivida(
              id,
            );
          } catch (error) {
            console.error(
              "Erro ao excluir dívida:",
              error,
            );
          }
        }}

        // ====================================================
        // Ativar / desativar
        // ====================================================

        onAlterarStatus={async (
          id,
          ativa,
        ) => {
          try {
            await alterarStatusDivida(
              id,
              ativa,
            );
          } catch (error) {
            console.error(
              "Erro ao alterar status da dívida:",
              error,
            );
          }
        }}
      />

      {/* ==================================================== */}
      {/* NOVO GASTO */}
      {/* ==================================================== */}

      <NovoGastoModal
        visivel={modalGasto}
        onFechar={() =>
          setModalGasto(false)
        }
        onSalvar={async (
          transacao,
        ) => {
          try {
            await adicionarTransacao(
              transacao,
            );

            setModalGasto(
              false,
            );
          } catch (error) {
            console.error(
              "Erro ao salvar transação:",
              error,
            );
          }
        }}
      />

      {/* ==================================================== */}
      {/* CONFIGURAÇÕES */}
      {/* ==================================================== */}

      <ConfiguracoesModal
        visivel={
          modalConfiguracoes
        }
        perfilAtual={
          perfilAtual
        }
        modoEscuro={
          modoEscuro
        }
        sincronizado
        sincronizando={false}
        onFechar={() =>
          setModalConfiguracoes(
            false,
          )
        }
        onTrocarPerfil={
          trocarPerfil
        }
        onAlterarModoEscuro={
          alterarModoEscuro
        }
        onSincronizar={() => {}}
      />

      {/* ==================================================== */}
      {/* CONTEÚDO */}
      {/* ==================================================== */}

      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <InicioHeader
          nomePerfil={
            perfilAtual.nome
          }
          oculto={oculto}
          cores={cores}
          onAlternarOculto={() =>
            setOculto(
              (valor) =>
                !valor,
            )
          }
          onAbrirConfiguracoes={() =>
            setModalConfiguracoes(
              true,
            )
          }
        />

        {/* ================================================== */}
        {/* CARDS SUPERIORES */}
        {/* ================================================== */}

        <TopCards
          cores={cores}
          oculto={oculto}
          cofrinho={cofrinho}
          totalEntradas={
            totalEntradas
          }
          totalDividas={
            totalDividas
          }
          totalSaidasMes={
            totalSaidasMes
          }
          saldoDisponivelMes={
            saldoDisponivelMes
          }
          onAbrirCofrinho={() =>
            setModalCofrinho(
              true,
            )
          }
          onAbrirFluxo={() =>
            setModalFluxo(
              true,
            )
          }
        />

        {/* ================================================== */}
        {/* SALDO DO MÊS */}
        {/* ================================================== */}

        <SaldoMesCard
          cores={cores}
          oculto={oculto}
          saldoDisponivelMes={
            saldoDisponivelMes
          }
        />

        {/* ================================================== */}
        {/* GASTOS DO MÊS */}
        {/* ================================================== */}

        <GastosMesCard
          cores={cores}
          fundoIcone={
            fundoIcone
          }
          oculto={oculto}
          modoEscuro={
            modoEscuro
          }
          quantidadeGastosMes={
            quantidadeGastosMes
          }
          ultimoGasto={
            gastosDoMes[0]
          }
          onAdicionarGasto={() =>
            setModalGasto(
              true,
            )
          }
          onVerTodas={() =>
            navigation.navigate(
              "Historico",
            )
          }
        />

        {/* ================================================== */}
        {/* DÍVIDAS FIXAS */}
        {/* ================================================== */}

        <DividasFixasCard
          cores={cores}
          modoEscuro={
            modoEscuro
          }
          dividas={dividas}
          statusPagamentos={
            statusDividas
          }
          onAlterarPagamento={
            alterarPagamentoDivida
          }
          onVerMais={() =>
            setModalDividas(
              true,
            )
          }
        />

        {/* ================================================== */}
        {/* GRÁFICO */}
        {/* ================================================== */}

        <GraficoCard
          cores={cores}
          dadosGrafico={
            dadosGrafico
          }
          oculto={oculto}
        />

        {/* ================================================== */}
        {/* GASTOS RECENTES */}
        {/* ================================================== */}

        <ListaGastosRecentes
          grupos={
            gruposLimitados
          }
          cores={cores}
          fundoIcone={
            fundoIcone
          }
          oculto={oculto}
          modoEscuro={
            modoEscuro
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}