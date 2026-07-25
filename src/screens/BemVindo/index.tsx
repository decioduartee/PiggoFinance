import React, { useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Check } from "lucide-react-native";

import { PERFIS, PerfilUsuario, salvarPerfilUsuario } from "../../features/perfil";
import { LIME_DARK, temaCores } from "../../theme/colors";
import { styles } from "./styles";

type Props = {
  onPerfilSelecionado: (perfil: PerfilUsuario) => void;
};

export default function WelcomeScreen({ onPerfilSelecionado }: Props) {
  const [perfilSelecionado, setPerfilSelecionado] =
    useState<PerfilUsuario | null>(null);

  const [continuando, setContinuando] = useState(false);

  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;

  const cores = temaCores(false);

  function selecionarPerfil(perfil: PerfilUsuario) {
    if (!continuando) {
      setPerfilSelecionado(perfil);
    }
  }

  async function continuar() {
    if (!perfilSelecionado || continuando) return;

    try {
      setContinuando(true);

      await salvarPerfilUsuario(perfilSelecionado.id);

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 350,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),

        Animated.timing(scale, {
          toValue: 0.97,
          duration: 350,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => {
        onPerfilSelecionado(perfilSelecionado);
      });
    } catch (e) {
      console.error(e);
      setContinuando(false);
    }
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: cores.BG,
          opacity,
          transform: [{ scale }],
        },
      ]}
    >
      <View style={styles.logoArea}>
        <View style={styles.logoCircle}>
          <Image
            source={require("../../assets/logo-porquinho.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={[styles.titulo, { color: cores.INK }]}>
          Bem-vindo!
        </Text>

        <Text style={[styles.subtitulo, { color: cores.GRAY }]}>
          Este aplicativo será usado por um casal.
        </Text>

        <Text style={[styles.subtitulo, { color: cores.GRAY }]}>
          Escolha seu perfil para começar.
        </Text>
      </View>

      <View style={styles.perfisArea}>
        {PERFIS.map((perfil) => {
          const ativo = perfilSelecionado?.id === perfil.id;

          return (
            <TouchableOpacity
              key={perfil.id}
              activeOpacity={0.85}
              disabled={continuando}
              onPress={() => selecionarPerfil(perfil)}
              style={[
                styles.perfilButton,
                {
                  backgroundColor: ativo ? "#f1fbe2" : cores.CARD,
                  borderColor: ativo ? LIME_DARK : "#e8e4d8",
                },
              ]}
            >
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: perfil.cor },
                ]}
              >
                <Text style={styles.avatarText}>
                  {perfil.inicial}
                </Text>
              </View>

              <View style={styles.textArea}>
                <Text
                  style={[
                    styles.nome,
                    { color: cores.INK },
                  ]}
                >
                  {perfil.nome}
                </Text>

                <Text
                  style={[
                    styles.desc,
                    { color: cores.GRAY },
                  ]}
                >
                  Perfil deste aparelho
                </Text>
              </View>

              {ativo && (
                <View style={styles.check}>
                  <Check
                    size={15}
                    color="#fff"
                    strokeWidth={3}
                  />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        activeOpacity={0.9}
        disabled={!perfilSelecionado || continuando}
        onPress={continuar}
        style={[
          styles.botao,
          {
            backgroundColor: perfilSelecionado
              ? LIME_DARK
              : "#d8d4c6",
            opacity: continuando ? 0.75 : 1,
          },
        ]}
      >
        <Text style={styles.botaoTexto}>
          {continuando ? "Carregando..." : "Continuar"}
        </Text>
      </TouchableOpacity>

      <Text
        style={[
          styles.subtitulo,
          {
            color: cores.GRAY,
            marginTop: 14,
            fontSize: 12,
          },
        ]}
      >
        Você poderá trocar de perfil depois nas configurações.
      </Text>
    </Animated.View>
  );
}

