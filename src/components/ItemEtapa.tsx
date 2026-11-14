import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { cores, espaco, raio } from '@/constants/tema';
import { horasParaMinutos, minutosParaHoras } from '@/utils/carga';
import { Botao } from './ui/Botao';
import { Campo } from './ui/Campo';
import { Icone } from './ui/Icone';
import { Texto } from './ui/Texto';

type Props = {
  posicao: number;
  materia: string;
  minutos: number;
  aberto: boolean;
  ocupado?: boolean;
  /** Chamado ao soltar a alça: quantas posições a etapa andou (negativo = para cima). */
  onArrastar?: (deslocamento: number) => void;
  onAbrir: () => void;
  onFechar: () => void;
  onSalvar: (materia: string, minutos: number) => void;
  onRemover: () => void;
};

/** Item de etapa do Figma: variante fechada (resumo + "Editar") e Aberto (edição no próprio item). */
export function ItemEtapa({ posicao, materia, minutos, aberto, ocupado, onArrastar, onAbrir, onFechar, onSalvar, onRemover }: Props) {
  const [nome, setNome] = useState(materia);
  const [horas, setHoras] = useState(minutosParaHoras(minutos));

  const nomeLimpo = nome.trim();
  const novosMinutos = horasParaMinutos(horas);
  const valido = nomeLimpo.length > 0 && novosMinutos !== null;

  // Altura da linha fechada + gap da lista; só um item fica aberto e o arrasto fecha-o, então o passo é uniforme.
  const passo = useSharedValue(0);
  const dy = useSharedValue(0);
  const arrastando = useSharedValue(false);
  const pan = usePanGesture({
    enabled: !ocupado && !!onArrastar,
    onActivate: () => {
      'worklet';
      arrastando.value = true;
      scheduleOnRN(onFechar);
    },
    onUpdate: (e) => {
      'worklet';
      dy.value = e.translationY;
    },
    onFinalize: () => {
      'worklet';
      const n = passo.value > 0 ? Math.round(dy.value / passo.value) : 0;
      dy.value = 0;
      arrastando.value = false;
      if (n !== 0 && onArrastar) scheduleOnRN(onArrastar, n);
    },
  });
  const estiloArrasto = useAnimatedStyle(() => ({
    transform: [{ translateY: dy.value }, { scale: arrastando.value ? 1.02 : 1 }],
    zIndex: arrastando.value ? 10 : 0,
    opacity: arrastando.value ? 0.9 : 1,
  }));

  function alternar() {
    if (aberto) return onFechar();
    setNome(materia);
    setHoras(minutosParaHoras(minutos));
    onAbrir();
  }

  return (
    <Animated.View
      style={[estilos.item, estiloArrasto]}
      onLayout={(e) => {
        if (!aberto) passo.value = e.nativeEvent.layout.height + espaco[8];
      }}
    >
      <View style={estilos.resumo}>
        <GestureDetector gesture={pan}>
          <View style={estilos.alca} accessibilityLabel={`Arrastar etapa ${materia}`}>
            <Icone nome="alca" />
          </View>
        </GestureDetector>
        <Texto estilo="lista14" cor={cores.ink2}>
          {posicao}
        </Texto>
        <Texto estilo="lista14Forte" numberOfLines={1} style={estilos.flex}>
          {materia}
        </Texto>
        <Texto estilo="lista14" cor={cores.ink2}>
          {`${minutosParaHoras(minutos)} h`}
        </Texto>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${aberto ? 'Fechar' : 'Editar'} etapa ${materia}`}
          onPress={alternar}
          hitSlop={8}
        >
          <Texto estilo="lista14" cor={cores.accentInk}>
            {aberto ? 'Fechar' : 'Editar'}
          </Texto>
        </Pressable>
      </View>

      {aberto ? (
        <View style={estilos.edicao}>
          <View style={estilos.campos}>
            <View style={estilos.flex}>
              <Campo tipo="texto" rotulo="Nome da matéria" valor={nome} onChangeText={setNome} />
            </View>
            <View style={estilos.carga}>
              <Campo tipo="texto" rotulo="Carga (h)" valor={horas} onChangeText={setHoras} keyboardType="decimal-pad" />
            </View>
          </View>
          <View style={estilos.acoes}>
            <Botao
              rotulo="Salvar etapa"
              tamanho="lista"
              desabilitado={!valido || ocupado}
              onPress={() => valido && onSalvar(nomeLimpo, novosMinutos)}
            />
            <Botao
              rotulo="Remover etapa"
              variante="discreto"
              tom="perigo"
              tamanho="lista"
              desabilitado={ocupado}
              onPress={onRemover}
            />
          </View>
        </View>
      ) : null}
    </Animated.View>
  );
}

const estilos = StyleSheet.create({
  item: {
    gap: espaco[12],
    padding: espaco[12],
    backgroundColor: cores.surface2,
    borderWidth: 1,
    borderColor: cores.line,
    borderRadius: raio.md,
  },
  resumo: { flexDirection: 'row', alignItems: 'center', gap: espaco[12] },
  alca: { width: 28, height: 36, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
  edicao: { gap: espaco[12] },
  campos: { flexDirection: 'row', alignItems: 'flex-start', gap: espaco[12] },
  carga: { width: 96 },
  acoes: { flexDirection: 'row', alignItems: 'center', gap: espaco[8] },
});
