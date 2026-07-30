import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import {
  Send,
  Pin,
  Check,
  ChevronRight,
  DollarSign,
  Eye,
  EyeOff,
  PiggyBank,
  Plus,
  Settings,
} from "lucide-react-native";

import Valor from "../../components/ValorBlur";
import GraficoSaldo from "../../components/GraficoSaldo";
import {
  CORAL,
  LIME,
  LIME_DARK,
  PURPLE,
  ORANGE,
  temaCores,
} from "../../theme/colors";
import { letraMaiuscula, rotuloDia } from "../../utils/formatadores";
import type { Divida, Transacao } from "../../features/financas/types";
import { GraficoSaldoItem } from "../../hooks/useGraficoSaldo";
import { renderizarIconeCategoria } from "../../constants/categorias";

import { styles } from "./styles";
import type { GrupoTransacoes } from "../../features/financas/helpers";

type Cores = ReturnType<typeof temaCores>;

type HeaderProps = {
  nomePerfil: string;
  oculto: boolean;
  cores: Cores;
  onAlternarOculto: () => void;
  onAbrirConfiguracoes: () => void;
};

export function InicioHeader({
  nomePerfil,
  oculto,
  cores,
  onAlternarOculto,
  onAbrirConfiguracoes,
}: HeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerBoasVindas}>
        <Text style={[styles.ola, { color: cores.INK }]}>
          Olá, {nomePerfil} 👋
        </Text>

        <Text style={[styles.subtitulo, { color: cores.INK }]}>
          Organize suas finanças com tranquilidade.
        </Text>
      </View>

      <View style={styles.headerActions}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onAlternarOculto}
          style={[styles.headerButton, { backgroundColor: cores.CARD }]}
        >
          {oculto ? (
            <EyeOff size={22} color={cores.GRAY} />
          ) : (
            <Eye size={22} color={cores.GRAY} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onAbrirConfiguracoes}
          style={[styles.headerButton, { backgroundColor: cores.CARD }]}
        >
          <Settings size={22} color={cores.GRAY} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

type TopCardsProps = {
  cores: Cores;
  oculto: boolean;
  cofrinho: number;
  totalEntradas: number;
  totalDividas: number;
  totalSaidasMes: number;
  saldoDisponivelMes: number;
  onAbrirCofrinho: () => void;
  onAbrirFluxo: () => void;
};

export function TopCards({
  cores,
  oculto,
  cofrinho,
  totalEntradas,
  totalDividas,
  totalSaidasMes,
  saldoDisponivelMes,
  onAbrirCofrinho,
  onAbrirFluxo,
}: TopCardsProps) {
  const baseCalculo = Math.max(totalEntradas, 1);

  return (
    <View style={styles.topRow}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onAbrirCofrinho}
        style={[styles.cardHalf, { backgroundColor: cores.CARD }]}
      >
        <View style={styles.rowBetweenTop}>
          <View style={[styles.pigIcon, { backgroundColor: cores.SUB_CARD }]}>
            <PiggyBank size={22} color={cores.GRAY} />
          </View>

          <ChevronRight size={16} strokeWidth={2} color={cores.GRAY} />
        </View>

        <Text style={styles.cardLabel}>Cofrinho</Text>
        <Valor
          valor={cofrinho}
          oculto={oculto}
          cor={cores.INK}
          shrink
          style={styles.cardValue}
        />
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onAbrirFluxo}
        style={[styles.cardHalf, { backgroundColor: cores.CARD }]}
      >
        <View style={styles.fluxoHeader}>
          <Text style={styles.cardLabel}>Fluxo de caixa</Text>
          <ChevronRight size={16} strokeWidth={2} color={cores.GRAY} />
        </View>

        <Valor
          valor={totalEntradas}
          oculto={oculto}
          shrink
          style={styles.cardValue}
        />

        {totalDividas > 0 && (
          <View style={styles.miniRow}>
            <Valor
              valor={totalDividas}
              oculto={oculto}
              negativo
              cor={PURPLE}
              style={styles.miniValue}
            />
            <Text style={styles.miniLabel}>fixo</Text>
          </View>
        )}

        {totalSaidasMes > 0 && (
          <View style={styles.miniRow}>
            <Valor
              valor={totalSaidasMes}
              oculto={oculto}
              negativo
              cor={CORAL}
              style={styles.miniValue}
            />
            <Text style={styles.miniLabel}>contas</Text>
          </View>
        )}

        <View style={styles.barras}>
          <View
            style={[
              styles.barra,
              {
                width: `${Math.max(
                  0,
                  Math.min(100, (saldoDisponivelMes / baseCalculo) * 100),
                )}%`,
                backgroundColor: LIME,
              },
            ]}
          />

          <View
            style={[
              styles.barra,
              {
                width: `${Math.min(100, (totalDividas / baseCalculo) * 100)}%`,
                backgroundColor: PURPLE,
              },
            ]}
          />

          <View
            style={[
              styles.barra,
              {
                width: `${Math.min(100, (totalSaidasMes / baseCalculo) * 100)}%`,
                backgroundColor: CORAL,
              },
            ]}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
}

type SaldoMesCardProps = {
  cores: Cores;
  oculto: boolean;
  saldoDisponivelMes: number;
};

export function SaldoMesCard({
  cores,
  oculto,
  saldoDisponivelMes,
}: SaldoMesCardProps) {
  return (
    <View style={[styles.saldoBox, { backgroundColor: cores.CARD }]}>
      <View style={styles.saldoIcone}>
        <DollarSign size={18} color="#fff" strokeWidth={3} />
      </View>

      <View>
        <Text style={[styles.saldoLabel, { color: cores.GRAY }]}>
          Saldo disponível este mês
        </Text>

        <Valor
          valor={saldoDisponivelMes}
          oculto={oculto}
          cor={saldoDisponivelMes >= 0 ? LIME_DARK : CORAL}
          shrink
          style={styles.saldoValor}
        />
      </View>
    </View>
  );
}

type GastosMesCardProps = {
  cores: Cores;
  fundoIcone: string;
  oculto: boolean;
  modoEscuro: boolean;
  quantidadeGastosMes: number;
  ultimoGasto?: Transacao;
  onAdicionarGasto: () => void;
  onVerTodas: () => void;
};

export function GastosMesCard({
  cores,
  fundoIcone,
  oculto,
  modoEscuro,
  quantidadeGastosMes,
  ultimoGasto,
  onAdicionarGasto,
  onVerTodas,
}: GastosMesCardProps) {
  return (
    <View style={[styles.gastosBox, { backgroundColor: cores.CARD }]}>
      <View style={styles.gastosHeader}>
        <Text style={[styles.sectionLabel, { color: cores.INK }]}>
          Gastos lançados este mês
        </Text>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onAdicionarGasto}
          style={[
            styles.botaoGasto,
            {
              borderWidth: 1.5,
              borderColor: cores.LIMEBOTAO,
              backgroundColor: cores.TRANSPARENT,
            },
          ]}
        >
          <Plus size={13} color="#ffff" />
          <Text style={styles.botaoGastoTexto}>Gasto</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.gastosNumero, { color: cores.INK }]}>
        {quantidadeGastosMes}
      </Text>

      <Text style={styles.gastosDescricao}>
        {quantidadeGastosMes === 0
          ? "nenhum gasto ainda"
          : "movimentações registradas"}
      </Text>

      {ultimoGasto && (
        <TransacaoResumo
          item={ultimoGasto}
          oculto={oculto}
          cores={cores}
          fundoIcone={fundoIcone}
          modoEscuro={modoEscuro}
          mostrarDia
        />
      )}

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onVerTodas}
        style={styles.verTodas}
      >
        <Text style={styles.verTodasTexto}>Ver todas as movimentações</Text>
        <ChevronRight size={16} color={cores.GRAY} />
      </TouchableOpacity>
    </View>
  );
}

type DividasFixasCardProps = {
  cores: Cores;
  modoEscuro: boolean;
  oculto: boolean;
  dividas: Divida[];
  statusPagamentos: Record<string, boolean>;

  dividasAtualizando: Set<string>;

  onAlterarPagamento: (id: string) => void;
  onVerMais: () => void;
};

export function DividasFixasCard({
  cores,
  modoEscuro,
  oculto,
  dividas,
  statusPagamentos,
  dividasAtualizando,
  onAlterarPagamento,
  onVerMais,
}: DividasFixasCardProps) {
  const dividasAtivas = dividas.filter((divida) => divida.ativa);

  if (dividasAtivas.length === 0) {
    return null;
  }

  const dividasVisiveis = [...dividasAtivas]
    .sort((a, b) => {
      const aPago = Boolean(statusPagamentos[a.id]);
      const bPago = Boolean(statusPagamentos[b.id]);

      if (aPago === bPago) {
        return 0;
      }

      return aPago ? 1 : -1;
    })
    .slice(0, 2);

  const quantidadePagas = dividasAtivas.filter(
    (divida) => statusPagamentos[divida.id],
  ).length;

  return (
    <View style={[styles.dividasCard, { backgroundColor: cores.CARD }]}>
      <View style={styles.dividasHeader}>
        <Text style={[styles.dividasTitulo, { color: cores.INK }]}>
          Dívidas fixas
        </Text>

        <Text style={[styles.dividasContador, { color: cores.GRAY }]}>
          {quantidadePagas}/{dividasAtivas.length} pagas
        </Text>
      </View>

      {dividasVisiveis.map((divida) => {
        const pago = Boolean(statusPagamentos[divida.id]);
        const atualizando = dividasAtualizando.has(divida.id);

        const estiloStatus = [
          styles.dividaStatus,
          {
            backgroundColor: PURPLE,
            borderColor: PURPLE,
          },
        ];

        const textoStatus = [
          styles.dividaStatusTexto,
          {
            color: "#FFFFFF",
          },
        ];

        return (
          <View
            key={divida.id}
            style={[
              styles.dividaItem,
              {
                backgroundColor: cores.SUB_CARD,
              },
            ]}
          >
            <View
              style={[
                styles.dividaIcone,
                {
                  backgroundColor: cores.CARD,
                },
              ]}
            >
              <Pin
                size={17}
                strokeWidth={2}
                color={pago ? PURPLE : PURPLE}
              />
            </View>

            <View style={styles.dividaConteudo}>
              <Text
                numberOfLines={1}
                style={[
                  styles.dividaNome,
                  {
                    color: cores.INK,
                  },
                ]}
              >
                {divida.nome}
              </Text>

              <Valor
                valor={Math.abs(Number(divida.valor) || 0)}
                oculto={oculto}
                cor={cores.GRAY}
                shrink
                style={styles.dividaValor}
              />
            </View>

            {pago ? (
              <View
                style={[
                  styles.dividaStatusPago,
                  {
                    backgroundColor: cores.LIME_BG,
                    borderColor: LIME_DARK,
                  },
                ]}
              >
                <Check size={18} color={LIME_DARK} strokeWidth={2.5} />
              </View>
            ) : (
              <TouchableOpacity
                activeOpacity={0.75}
                disabled={atualizando}
                onPress={() => onAlterarPagamento(divida.id)}
                style={[
                  ...estiloStatus,
                  {
                    opacity: atualizando ? 0.55 : 1,
                  },
                ]}
              >
                <Text style={textoStatus}>
                  {atualizando ? "Salvando..." : "Pendente"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}

      <TouchableOpacity
        style={styles.verMaisDividas}
        activeOpacity={0.7}
        onPress={onVerMais}
      >
        <Text style={styles.verTodasTexto}>Ver todas as dividas Fixas</Text>
        <ChevronRight size={16} color={cores.GRAY} />
      </TouchableOpacity>
    </View>
  );
}

type GraficoCardProps = {
  cores: Cores;
  dadosGrafico: GraficoSaldoItem[];
  oculto: boolean;
};

export function GraficoCard({ cores, dadosGrafico, oculto }: GraficoCardProps) {
  return (
    <View style={[styles.graficoBox, { backgroundColor: cores.CARD }]}>
      <GraficoSaldo data={dadosGrafico} cores={cores} oculto={oculto} />
    </View>
  );
}

type ListaGastosProps = {
  grupos: GrupoTransacoes;
  cores: Cores;
  fundoIcone: string;
  oculto: boolean;
  modoEscuro: boolean;
};

export function ListaGastosRecentes({
  grupos,
  cores,
  fundoIcone,
  oculto,
  modoEscuro,
}: ListaGastosProps) {
  if (Object.keys(grupos).length === 0) {
    return (
      <Text style={[styles.vazio, { color: cores.GRAY }]}>
        Nenhum gasto neste mês.
      </Text>
    );
  }

  return (
    <>
      {Object.entries(grupos).map(([grupo, itens]) => (
        <View key={grupo} style={styles.grupo}>
          <Text style={[styles.grupoTitulo, { color: cores.GRAY }]}>
            {grupo}
          </Text>

          {itens.map((item) => (
            <View
              key={item.id}
              style={[styles.transacaoLinha, { backgroundColor: cores.CARD }]}
            >
              <TransacaoConteudo
                item={item}
                oculto={oculto}
                cores={cores}
                fundoIcone={fundoIcone}
                modoEscuro={modoEscuro}
              />
            </View>
          ))}
        </View>
      ))}
    </>
  );
}

type TransacaoProps = {
  item: Transacao;
  oculto: boolean;
  cores: Cores;
  fundoIcone: string;
  modoEscuro: boolean;
};

function TransacaoResumo({
  item,
  oculto,
  cores,
  fundoIcone,
  modoEscuro,
  mostrarDia = false,
}: TransacaoProps & { mostrarDia?: boolean }) {
  return (
    <View style={[styles.transacaoCard, { backgroundColor: cores.SUB_CARD }]}>
      <TransacaoConteudo
        item={item}
        oculto={oculto}
        cores={cores}
        fundoIcone={fundoIcone}
        modoEscuro={modoEscuro}
        mostrarDia={mostrarDia}
      />
    </View>
  );
}

function TransacaoConteudo({
  item,
  oculto,
  cores,
  fundoIcone,
  modoEscuro,
  mostrarDia = false,
}: TransacaoProps & { mostrarDia?: boolean }) {
  const textoSecundario = mostrarDia
    ? `${rotuloDia(item.data)} · ${item.categoria}`
    : item.categoria;

  return (
    <>
      <View style={[styles.icone, { backgroundColor: fundoIcone }]}>
        {renderizarIconeCategoria(item.categoria, modoEscuro)}
      </View>

      <View style={styles.transacaoInfo}>
        <Text
          numberOfLines={1}
          style={[styles.transacaoNome, { color: cores.INK }]}
        >
          {letraMaiuscula(item.nome)}
        </Text>

        <Text style={[styles.transacaoSub, { color: cores.GRAY }]}>
          {textoSecundario}
        </Text>
      </View>

      <Valor
        valor={Math.abs(item.valor)}
        oculto={oculto}
        negativo={item.tipo === "saida"}
        cor={item.tipo === "saida" ? CORAL : LIME_DARK}
        style={styles.transacaoValor}
      />
    </>
  );
}
