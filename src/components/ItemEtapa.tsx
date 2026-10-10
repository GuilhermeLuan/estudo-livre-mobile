import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

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
  onAbrir: () => void;
  onFechar: () => void;
  onSalvar: (materia: string, minutos: number) => void;
  onRemover: () => void;
};

/** Item de etapa do Figma: variante fechada (resumo + "Editar") e Aberto (edição no próprio item). */
export function ItemEtapa({ posicao, materia, minutos, aberto, ocupado, onAbrir, onFechar, onSalvar, onRemover }: Props) {
  const [nome, setNome] = useState(materia);
  const [horas, setHoras] = useState(minutosParaHoras(minutos));

  const nomeLimpo = nome.trim();
  const novosMinutos = horasParaMinutos(horas);
  const valido = nomeLimpo.length > 0 && novosMinutos !== null;

  function alternar() {
    if (aberto) return onFechar();
    setNome(materia);
    setHoras(minutosParaHoras(minutos));
    onAbrir();
  }

  return (
    <View style={estilos.item}>
      <View style={estilos.resumo}>
        <View style={estilos.alca}>
          <Icone nome="alca" />
        </View>
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
    </View>
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
