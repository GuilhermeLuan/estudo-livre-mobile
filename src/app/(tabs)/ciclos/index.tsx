import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { CardCiclo } from '@/components/CardCiclo';
import { Botao } from '@/components/ui/Botao';
import { EstadoVazio } from '@/components/ui/EstadoVazio';
import { Texto } from '@/components/ui/Texto';
import { cores, espaco } from '@/constants/tema';
import { listarCiclos, listarEtapas } from '@/services/database';
import type { Ciclo } from '@/types/banco';

type ItemLista = { ciclo: Ciclo; totalEtapas: number; totalMinutos: number };

export default function Ciclos() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [itens, setItens] = useState<ItemLista[] | null>(null);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      (async () => {
        const ciclos = await listarCiclos(db);
        const lista = await Promise.all(
          ciclos.map(async (ciclo) => {
            const etapas = await listarEtapas(db, ciclo.id);
            return {
              ciclo,
              totalEtapas: etapas.length,
              totalMinutos: etapas.reduce((soma, e) => soma + e.minutos, 0),
            };
          }),
        );
        if (ativo) setItens(lista);
      })();
      return () => {
        ativo = false;
      };
    }, [db]),
  );

  const novoCiclo = () => router.push('/ciclos/novo');

  return (
    <ScrollView style={{ backgroundColor: cores.paper }} contentContainerStyle={estilos.conteudo}>
      <View style={estilos.topo}>
        <Texto estilo="tituloH1">Ciclos</Texto>
        {itens && itens.length > 0 ? (
          <Botao rotulo="Novo ciclo" tamanho="lista" onPress={novoCiclo} />
        ) : null}
      </View>
      {itens && itens.length === 0 ? (
        <EstadoVazio
          titulo="Nenhum ciclo ainda"
          texto="Crie um ciclo para montar sua rotina de estudo."
          rotuloAcao="Novo ciclo"
          onAcao={novoCiclo}
        />
      ) : null}
      {itens?.map(({ ciclo, totalEtapas, totalMinutos }) => (
        <CardCiclo
          key={ciclo.id}
          nome={ciclo.nome}
          ativo={ciclo.ativo}
          voltaAtual={ciclo.voltaAtual}
          totalEtapas={totalEtapas}
          totalMinutos={totalMinutos}
          onPress={() => router.push({ pathname: '/ciclos/[id]', params: { id: ciclo.id } })}
        />
      ))}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  conteudo: { gap: espaco[12], padding: espaco[16] },
  topo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
