import React, { useMemo } from "react";
import { Text, useWindowDimensions, View } from "react-native";
import { TrendingDown } from "lucide-react-native";
import { LineChart } from "react-native-gifted-charts";

import Valor from "../ValorBlur";
import { CORAL, LIME_DARK, PURPLE } from "../../theme/colors";
import { styles } from "./styles";
import { GraficoSaldoProps } from "./types";

export default function GraficoSaldo({
  data,
  cores,
  oculto,
}: GraficoSaldoProps) {
  const { width: larguraTela } = useWindowDimensions();

  const larguraGrafico = Math.max(larguraTela - 61, 230);
  const margemLateral = 8;
  const espacoEntrePontos =
    (larguraGrafico - margemLateral * 2) / Math.max(data.length - 1, 1);

  const maiorGasto = useMemo(
    () =>
      data.reduce(
        (maior, item) => (item.gastoDia > maior.gastoDia ? item : maior),
        data[0],
      ),
    [data],
  );

  const maiorDividaPaga = useMemo(
    () =>
      data.reduce(
        (maior, item) =>
          item.dividaPagaDia > maior.dividaPagaDia ? item : maior,
        data[0],
      ),
    [data],
  );

  const maiorMovimentoDia = useMemo(
    () =>
      Math.max(
        ...data.flatMap((item) => [item.gastoDia, item.dividaPagaDia]),
        0,
      ),
    [data],
  );

  const maiorSaldoAbsoluto = useMemo(
    () => Math.max(...data.map((item) => Math.abs(item.saldo)), 100),
    [data],
  );

  const escalaMovimentos = useMemo(() => {
    if (maiorMovimentoDia <= 0) {
      return 1;
    }

    const alturaMinimaVisivel = maiorSaldoAbsoluto * 0.32;

    if (maiorMovimentoDia >= alturaMinimaVisivel) {
      return 1;
    }

    return alturaMinimaVisivel / maiorMovimentoDia;
  }, [maiorMovimentoDia, maiorSaldoAbsoluto]);

  const maiorValor = useMemo(
    () =>
      Math.max(
        ...data.flatMap((item) => [
          item.saldo,
          item.gastoDia * escalaMovimentos,
          item.dividaPagaDia * escalaMovimentos,
        ]),
        100,
      ),
    [data, escalaMovimentos],
  );

  const menorValor = useMemo(
    () => Math.min(...data.map((item) => item.saldo), 0),
    [data],
  );

  const saldoData = useMemo(
    () =>
      data.map((item) => ({
        value: item.saldo,
        label: item.label,
        customDataPoint: () => null,
      })),
    [data],
  );

  const gastosData = useMemo(
    () =>
      data.map((item) => ({
        value: item.gastoDia * escalaMovimentos,
        label: item.label,
        customDataPoint: () => null,
      })),
    [data, escalaMovimentos],
  );

  const dividasPagasData = useMemo(
    () =>
      data.map((item) => ({
        value: item.dividaPagaDia * escalaMovimentos,
        label: item.label,
        customDataPoint: () => null,
      })),
    [data, escalaMovimentos],
  );

  const temDividasPagas = useMemo(
    () => data.some((item) => item.dividaPagaDia > 0),
    [data],
  );

  if (data.length === 0) {
    return (
      <View style={[styles.container, styles.vazioContainer]}>
        <Text style={[styles.vazio, { color: cores.GRAY }]}>
          Nenhum gasto lançado neste mês.
        </Text>
      </View>
    );
  }

  const destacarGasto = maiorGasto.gastoDia > 0;
  const destacarDivida = !destacarGasto && maiorDividaPaga.dividaPagaDia > 0;
  const tituloDestaque = destacarGasto
    ? maiorGasto.dataFormatada
    : destacarDivida
      ? maiorDividaPaga.dataFormatada
      : "Sem gastos no mês";
  const valorDestaque = destacarGasto
    ? maiorGasto.gastoDia
    : maiorDividaPaga.dividaPagaDia;
  const corDestaque = destacarDivida ? PURPLE : CORAL;
  const fundoDestaque = destacarDivida ? cores.SUB_CARD : cores.CORAL_BG;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={[styles.eyebrow, { color: cores.GRAY }]}>
            {destacarDivida ? "DÍVIDA PAGA" : "MAIOR GASTO"}
          </Text>

          <View style={styles.tituloLinha}>
            <Text style={[styles.titulo, { color: cores.INK }]}>
              {tituloDestaque}
            </Text>

            {valorDestaque > 0 && (
              <View
                style={[
                  styles.valorPill,
                  {
                    backgroundColor: fundoDestaque,
                  },
                ]}
              >
                <Valor
                  valor={valorDestaque}
                  oculto={oculto}
                  negativo
                  cor={corDestaque}
                  style={styles.valorPillTexto}
                />
              </View>
            )}
          </View>

          <Text style={[styles.subtitulo, { color: cores.GRAY }]}>
            {destacarDivida
              ? "Pagamento confirmado no mês"
              : "Gasto mais alto do mês"}
          </Text>
        </View>

        <View style={[styles.iconeCard, { backgroundColor: cores.SUB_CARD }]}>
          <TrendingDown size={22} color={CORAL} strokeWidth={3} />
        </View>
      </View>

      <View style={styles.chart}>
        <LineChart
          key={JSON.stringify(data)}
          data={saldoData}
          data2={gastosData}
          data3={temDividasPagas ? dividasPagasData : undefined}
          width={larguraGrafico}
          height={180}
          areaChart
          curved={false}
          color1={LIME_DARK}
          thickness1={3}
          zIndex1={2}
          color2={CORAL}
          thickness2={3}
          zIndex2={4}
          color3={PURPLE}
          thickness3={2}
          zIndex3={1}
          startFillColor1={LIME_DARK}
          endFillColor1={LIME_DARK}
          startOpacity1={0.14}
          endOpacity1={0.02}
          startFillColor2={CORAL}
          endFillColor2={CORAL}
          startOpacity2={0.1}
          endOpacity2={0.01}
          startFillColor3={PURPLE}
          endFillColor3={PURPLE}
          startOpacity3={0.05}
          endOpacity3={0.01}
          dataPointsRadius3={0}
          dataPointsColor3={PURPLE}
          hideRules
          hideYAxisText
          yAxisThickness={0}
          xAxisThickness={0}
          dataPointsRadius1={0}
          dataPointsRadius2={0}
          xAxisLabelTextStyle={[styles.labelMes, { color: cores.GRAY }]}
          disableScroll
          initialSpacing={margemLateral}
          endSpacing={margemLateral}
          spacing={espacoEntrePontos}
          maxValue={maiorValor * 1.18}
          mostNegativeValue={menorValor < 0 ? menorValor * 1.18 : undefined}
          noOfSections={4}
          noOfSectionsBelowXAxis={menorValor < 0 ? 2 : 0}
          overflowTop={24}
          animationDuration={0}
          backgroundColor="transparent"
        />
      </View>

      <View style={styles.legenda}>
        <View style={styles.legendaItem}>
          <View style={[styles.legendaPonto, { backgroundColor: LIME_DARK }]} />
          <View>
            <Text style={[styles.legendaTitulo, { color: cores.INK }]}>
              Saldo disponível
            </Text>
          </View>
        </View>

        <View style={styles.legendaItem}>
          <View style={[styles.legendaPonto, { backgroundColor: CORAL }]} />
          <View>
            <Text style={[styles.legendaTitulo, { color: cores.INK }]}>
              Gastos
            </Text>
          </View>
        </View>

        {temDividasPagas ? (
          <View style={styles.legendaItem}>
            <View style={[styles.legendaPonto, { backgroundColor: PURPLE }]} />
            <View>
              <Text style={[styles.legendaTitulo, { color: cores.INK }]}>
                Dívidas pagas
              </Text>
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}
