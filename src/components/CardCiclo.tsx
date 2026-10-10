import { Pressable, StyleSheet, View } from 'react-native';

import { cores, espaco, padding, raio } from '@/constants/tema';
import { Pilula } from './ui/Pilula';
import { Texto } from './ui/Texto';

type Props = {
  nome: string;
  ativo: boolean;
  voltaAtual: number;
  totalEtapas: number;
  totalMinutos: number;
  onPress: () => void;
};

/** Formata minutos como "10h", "1h30" ou "45min". */
export function formatarDuracao(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  if (h === 0) return `${m}min`;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`;
}

/** Card de ciclo compacto, usado na lista da aba Ciclos. */
export function CardCiclo({ nome, ativo, voltaAtual, totalEtapas, totalMinutos, onPress }: Props) {
  const etapas = `${totalEtapas} ${totalEtapas === 1 ? 'etapa' : 'etapas'}`;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ciclo ${nome}`}
      onPress={onPress}
      style={({ pressed }) => [estilos.card, pressed && { opacity: 0.8 }]}
    >
      <View style={estilos.linha}>
        <Texto estilo="tituloH2" numberOfLines={1} style={estilos.nome}>
          {nome}
        </Texto>
        {ativo ? <Pilula texto="Ativo" cor="azul" /> : null}
      </View>
      <Texto estilo="meta13" cor={cores.ink2}>
        {`Volta ${voltaAtual} · ${etapas} · ${formatarDuracao(totalMinutos)}`}
      </Texto>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  card: {
    gap: espaco[6],
    padding: padding.card,
    backgroundColor: cores.surface,
    borderWidth: 1,
    borderColor: cores.line,
    borderRadius: raio.lg,
  },
  linha: { flexDirection: 'row', alignItems: 'center', gap: espaco[8] },
  nome: { flex: 1 },
});
