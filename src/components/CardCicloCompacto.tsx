import { Pressable, StyleSheet, View } from 'react-native';

import { cores, espaco, opacidadePressionado, raio, tamanhos } from '@/constants/tema';
import { iniciaisDoCiclo } from '@/utils/hoje';
import { Barra } from './ui/Barra';
import { Texto } from './ui/Texto';

type Props = {
  nome: string;
  /** Ex.: "Volta 2. Próxima: Direito Tributário". */
  resumo: string;
  porcentagem: number;
  onPress: () => void;
};

/** Card de ciclo compacto do Figma, usado em "Outros ciclos" na aba Hoje. */
export function CardCicloCompacto({ nome, resumo, porcentagem, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ciclo ${nome}`}
      onPress={onPress}
      style={({ pressed }) => [estilos.card, pressed && { opacity: opacidadePressionado }]}
    >
      <View style={estilos.cabecalho}>
        <View style={estilos.iniciais}>
          <Texto estilo="iniciais12" cor={cores.accentInk}>
            {iniciaisDoCiclo(nome)}
          </Texto>
        </View>
        <View style={estilos.texto}>
          <Texto estilo="lista14Forte" numberOfLines={1}>
            {nome}
          </Texto>
          <Texto estilo="meta13" cor={cores.ink2} numberOfLines={1}>
            {resumo}
          </Texto>
        </View>
      </View>
      <View style={estilos.progresso}>
        <View style={estilos.barra}>
          <Barra progresso={porcentagem / 100} />
        </View>
        <Texto estilo="meta12Forte">{`${porcentagem}%`}</Texto>
      </View>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  card: {
    gap: espaco[10],
    padding: espaco[14],
    backgroundColor: cores.surface,
    borderWidth: 1,
    borderColor: cores.line,
    borderRadius: raio.lg,
  },
  cabecalho: { flexDirection: 'row', alignItems: 'center', gap: espaco[12] },
  iniciais: {
    width: tamanhos.iniciais,
    height: tamanhos.iniciais,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.accentSoft,
    borderRadius: raio.control,
  },
  texto: { flex: 1 },
  progresso: { flexDirection: 'row', alignItems: 'center', gap: espaco[10] },
  barra: { flex: 1 },
});
