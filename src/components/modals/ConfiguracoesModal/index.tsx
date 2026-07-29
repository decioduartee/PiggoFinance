import React, { useEffect, useState } from "react";
import {
  Keyboard,
  LayoutAnimation,
  Modal,
  Pressable,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Check,
  Database,
  RefreshCw,
  Sun,
  Moon,
  UserRound,
  X,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PERFIS, type PerfilUsuario } from "../../../features/perfil/perfis";
import { LIME_DARK, temaCores } from "../../../theme/colors";
import useFinance from "../../../hooks/useFinance";
import { createStyles } from "./styles";

type ConfiguracoesModalProps = {
  visivel: boolean;
  perfilAtual: PerfilUsuario;

  modoEscuro: boolean;
  sincronizado?: boolean;
  sincronizando?: boolean;

  onFechar: () => void;
  onTrocarPerfil: (perfil: PerfilUsuario) => void;
  onAlterarModoEscuro: (ativo: boolean) => Promise<void>;
  onSincronizar: () => void;
};

export default function ConfiguracoesModal({
  visivel,
  perfilAtual,
  modoEscuro,
  sincronizado = true,
  sincronizando = false,
  onFechar,
  onTrocarPerfil,
  onAlterarModoEscuro,
  onSincronizar,
}: ConfiguracoesModalProps) {
  const [perfilExpandido, setPerfilExpandido] = useState(false);

  const { modoEscuro: temaEscuro } = useFinance();
  const insets = useSafeAreaInsets();

  const cores = temaCores(temaEscuro);

  const styles = createStyles(cores, insets.bottom);

  useEffect(() => {
    if (!visivel) {
      setPerfilExpandido(false);
    }
  }, [visivel]);

  function animarLayout() {
    LayoutAnimation.configureNext({
      duration: 250,
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      delete: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
    });
  }

  function alternarPerfis() {
    animarLayout();
    setPerfilExpandido((anterior) => !anterior);
  }

  function selecionarPerfil(perfil: PerfilUsuario) {
    if (perfil.id === perfilAtual.id) {
      animarLayout();
      setPerfilExpandido(false);
      return;
    }

    onTrocarPerfil(perfil);

    animarLayout();
    setPerfilExpandido(false);
  }

  function fecharModal() {
    Keyboard.dismiss();
    setPerfilExpandido(false);
    onFechar();
  }

  return (
    <Modal
      visible={visivel}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={fecharModal}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={fecharModal} />

        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.titulo}>Configurações</Text>

            <TouchableOpacity
              activeOpacity={0.75}
              onPress={fecharModal}
              style={styles.fecharButton}
            >
              <X size={27} color={cores.INK} strokeWidth={2.2} />
            </TouchableOpacity>
          </View>

          {/* Perfil ativo */}
          <View style={styles.card}>
            <View style={styles.linhaPrincipal}>
              <View
                style={[
                  styles.avatar,
                  {
                    backgroundColor: perfilAtual.cor,
                  },
                ]}
              >
                <Text style={styles.avatarTexto}>
                  {perfilAtual.inicial}
                </Text>
              </View>

              <View style={styles.textos}>
                <Text style={styles.cardTitulo}>Perfil ativo</Text>
                <Text style={styles.cardSubtitulo}>
                  {perfilAtual.nome}
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={alternarPerfis}
                style={styles.botaoSecundario}
              >
                <UserRound size={19} color={cores.INK} />

                <Text style={styles.botaoSecundarioTexto}>
                  {perfilExpandido ? "Fechar" : "Trocar"}
                </Text>
              </TouchableOpacity>
            </View>

            {perfilExpandido && (
              <View style={styles.listaPerfis}>
                {PERFIS.map((perfil) => {
                  const selecionado = perfil.id === perfilAtual.id;

                  return (
                    <TouchableOpacity
                      key={perfil.id}
                      activeOpacity={0.82}
                      onPress={() => selecionarPerfil(perfil)}
                      style={[
                        styles.perfilOpcao,
                        selecionado &&
                          styles.perfilOpcaoSelecionado,
                      ]}
                    >
                      <View
                        style={[
                          styles.avatarOpcao,
                          {
                            backgroundColor: perfil.cor,
                          },
                        ]}
                      >
                        <Text style={styles.avatarOpcaoTexto}>
                          {perfil.inicial}
                        </Text>
                      </View>

                      <Text style={styles.perfilNome}>
                        {perfil.nome}
                      </Text>

                      {selecionado && (
                        <Check
                          size={21}
                          color={LIME_DARK}
                          strokeWidth={2.5}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* Tema */}
          <View style={styles.card}>
            <View style={styles.linhaPrincipal}>
              <View style={styles.iconeNeutro}>
                {modoEscuro ? (
                  <Moon size={22} color={cores.INK} />
                ) : (
                  <Sun size={22} color="#c6a447" />
                )}
              </View>

              <View style={styles.textos}>
                <Text style={styles.cardTitulo}>
                  Modo escuro
                </Text>

                <Text style={styles.cardSubtitulo}>
                  {modoEscuro ? "Ativado" : "Desativado"}
                </Text>
              </View>

              <Switch
                value={modoEscuro}
                onValueChange={onAlterarModoEscuro}
                trackColor={{
                  false: cores.LINE_DASH,
                  true: "#b9e781",
                }}
                thumbColor="#ffffff"
                ios_backgroundColor={cores.LINE_DASH}
              />
            </View>
          </View>

          <Text style={styles.textoExplicativo}>
            A preferência de tema fica salva no celular — da próxima vez que
            você abrir o app, ele já carrega no modo escolhido aqui.
          </Text>

          {/* Banco de dados */}
          <View style={styles.card}>
            <View style={styles.linhaPrincipal}>
              <View style={styles.iconeNeutro}>
                <Database size={23} color={LIME_DARK} />
              </View>

              <View style={styles.textos}>
                <Text style={styles.cardTitulo}>
                  Banco de dados
                </Text>

                <Text
                  style={[
                    styles.status,
                    sincronizado
                      ? styles.statusSincronizado
                      : styles.statusPendente,
                  ]}
                >
                  {sincronizando
                    ? "Sincronizando..."
                    : sincronizado
                    ? "Sincronizado"
                    : "Pendente"}
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                disabled={sincronizando}
                onPress={onSincronizar}
                style={[
                  styles.botaoSecundario,
                  sincronizando &&
                    styles.botaoDesabilitado,
                ]}
              >
                <RefreshCw
                  size={19}
                  color={cores.INK}
                  strokeWidth={2.2}
                />

                <Text style={styles.botaoSecundarioTexto}>
                  {sincronizando
                    ? "Aguarde"
                    : "Sincronizar"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.textoExplicativo}>
            Os dados ficam salvos no celular e são enviados para a planilha
            automaticamente sempre que houver conexão. Para garantir o envio
            imediato, use o botão "Sincronizar".
          </Text>
        </View>
      </View>
    </Modal>
  );
}
