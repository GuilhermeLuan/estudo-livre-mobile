import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { cores, espaco, opacidadePressionado, raio } from '@/constants/tema';
import type { Concurso } from '@/types/concursos';
import { diasRestantes } from '@/utils/concursos';
import { Pilula } from './ui/Pilula';
import { Texto } from './ui/Texto';

const dataCurta = (iso: string) => iso.split('-').reverse().slice(0, 2).join('/');

function prazo(c: Concurso, hoje: string) {
  if (c.status === 'previsto') {
    return { texto: c.publicado ? `Previsto · publicado em ${dataCurta(c.publicado)}` : 'Previsto', urgente: false };
  }
  if (!c.inscricao_fim) return { texto: 'Inscrições abertas', urgente: false };
  const dias = diasRestantes(c.inscricao_fim, hoje) ?? 0;
  const falta = dias <= 0 ? 'termina hoje' : dias === 1 ? 'falta 1 dia' : `faltam ${dias} dias`;
  return { texto: `Inscrições até ${dataCurta(c.inscricao_fim)} · ${falta}`, urgente: dias <= 7 };
}

export function CardConcurso({ concurso: c, hoje }: { concurso: Concurso; hoje: string }) {
  const { texto, urgente } = prazo(c, hoje);
  const vagas = c.vagas == null ? 'vagas não informadas' : `${c.vagas} ${c.vagas === 1 ? 'vaga' : 'vagas'}`;
  const salario = c.salario_max == null ? null : c.salario_max.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  return (
    <Pressable
      accessibilityRole="link"
      onPress={() => Linking.openURL(c.link).catch(() => undefined)}
      style={({ pressed }) => [estilos.card, pressed && { opacity: opacidadePressionado }]}
    >
      <View style={estilos.topo}>
        <Texto estilo="meta12Forte" cor={cores.ink2} style={estilos.orgao} numberOfLines={1}>
          {c.orgao}
        </Texto>
        <Pilula texto={c.status === 'aberto' ? 'Aberto' : 'Previsto'} cor={c.status === 'aberto' ? 'verde' : 'azul'} />
      </View>
      <Texto estilo="lista14Forte">{c.titulo}</Texto>
      <Texto estilo="meta13" cor={cores.ink2}>
        {[c.nacional ? 'Nacional' : c.ufs.map((u) => u.toUpperCase()).join(', '), vagas, salario && `até ${salario}`]
          .filter(Boolean)
          .join(' · ')}
      </Texto>
      <Texto estilo="meta13Medio" cor={urgente ? cores.red : cores.accentInk}>
        {texto}
      </Texto>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  card: {
    gap: espaco[6],
    padding: espaco[16],
    backgroundColor: cores.surface,
    borderWidth: 1,
    borderColor: cores.line,
    borderRadius: raio.lg,
  },
  topo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: espaco[8] },
  orgao: { flex: 1 },
});
