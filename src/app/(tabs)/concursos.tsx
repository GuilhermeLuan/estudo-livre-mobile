import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, View } from 'react-native';

import { CardConcurso } from '@/components/CardConcurso';
import { Botao } from '@/components/ui/Botao';
import { Chip } from '@/components/ui/Chip';
import { EstadoVazio } from '@/components/ui/EstadoVazio';
import { Texto } from '@/components/ui/Texto';
import { cores, espaco, padding } from '@/constants/tema';
import { atualizarConcursos, CACHE_EMBUTIDO, carregarCacheConcursos, type CacheConcursos } from '@/services/concursos';
import type { Situacao } from '@/types/concursos';
import { filtrarConcursos } from '@/utils/concursos';
import { formatarDataISO } from '@/utils/data';

const situacoes: { valor: Situacao; rotulo: string }[] = [
  { valor: 'aberto', rotulo: 'Abertos' },
  { valor: 'previsto', rotulo: 'Previstos' },
  { valor: 'todos', rotulo: 'Todos' },
];

const dois = (n: number) => String(n).padStart(2, '0');

function textoAtualizacao(iso: string, hoje: string) {
  const d = new Date(iso);
  const hora = `${dois(d.getHours())}:${dois(d.getMinutes())}`;
  return formatarDataISO(d) === hoje ? `hoje às ${hora}` : `em ${dois(d.getDate())}/${dois(d.getMonth() + 1)} às ${hora}`;
}

export default function Concursos() {
  const db = useSQLiteContext();
  const [cache, setCache] = useState<CacheConcursos | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const [situacao, setSituacao] = useState<Situacao>('aberto');
  const [uf, setUf] = useState<string | null>(null);

  const atualizar = useCallback(async () => {
    setCarregando(true);
    try {
      setCache(await atualizarConcursos(db));
      setErro(false);
    } catch {
      setErro(true);
      setCache((atual) => atual ?? CACHE_EMBUTIDO);
    } finally {
      setCarregando(false);
    }
  }, [db]);

  useEffect(() => {
    atualizarConcursos(db).then(setCache).catch(() => {
      setErro(true);
      setCache((atual) => atual ?? CACHE_EMBUTIDO);
    }).finally(() => setCarregando(false));
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      carregarCacheConcursos(db).then((salvo) => salvo && setCache((atual) => atual ?? salvo)).catch(() => undefined);
    }, [db]),
  );

  const hoje = formatarDataISO(new Date());
  const lista = useMemo(
    () => (cache ? filtrarConcursos(cache.dados.concursos, situacao, uf, hoje) : []),
    [cache, situacao, uf, hoje],
  );
  const ufs = useMemo(
    () => Object.entries(cache?.dados.ufs ?? {}).filter(([sigla]) => sigla !== 'br').sort((a, b) => a[1].localeCompare(b[1])),
    [cache],
  );

  const limparFiltros = () => {
    setSituacao('aberto');
    setUf(null);
  };

  if (!cache) {
    return (
      <View style={estilos.centro}>
        {erro ? (
          <EstadoVazio
            titulo="Sem conexão"
            texto="Não foi possível carregar os concursos."
            rotuloAcao="Tentar de novo"
            onAcao={atualizar}
          />
        ) : (
          <ActivityIndicator color={cores.accent} />
        )}
      </View>
    );
  }

  const cabecalho = (
    <View style={estilos.cabecalho}>
      <Texto estilo="tituloH1">Concursos</Texto>
      <Texto estilo="meta13" cor={cores.ink2}>
        Atualizado {textoAtualizacao(cache.baixadoEm, hoje)} · {lista.length} concursos
      </Texto>
      {erro ? (
        <View style={estilos.aviso}>
          <Texto estilo="meta13Medio" cor={cores.red} style={{ flex: 1 }}>
            Sem conexão. Mostrando a lista salva, que pode estar desatualizada.
          </Texto>
          <Botao rotulo="Tentar de novo" variante="discreto" tamanho="lista" onPress={atualizar} />
        </View>
      ) : null}
      <View style={estilos.chips}>
        {situacoes.map((s) => (
          <Chip key={s.valor} texto={s.rotulo} selecionado={situacao === s.valor} onPress={() => setSituacao(s.valor)} />
        ))}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.chips}>
        <Chip texto="Todas as UFs" selecionado={uf === null} onPress={() => setUf(null)} />
        {ufs.map(([sigla]) => (
          <Chip key={sigla} texto={sigla.toUpperCase()} selecionado={uf === sigla} onPress={() => setUf(sigla)} />
        ))}
      </ScrollView>
    </View>
  );

  return (
    <FlatList
      style={{ backgroundColor: cores.paper }}
      contentContainerStyle={estilos.conteudo}
      data={lista}
      keyExtractor={(c, i) => `${c.link}-${i}`}
      renderItem={({ item }) => <CardConcurso concurso={item} hoje={hoje} />}
      ListHeaderComponent={cabecalho}
      ListEmptyComponent={
        <EstadoVazio
          titulo="Nenhum concurso encontrado"
          texto="Nenhum concurso bate com os filtros escolhidos."
          rotuloAcao="Limpar filtros"
          onAcao={limparFiltros}
          rotuloAcaoSecundaria="Ver previstos"
          onAcaoSecundaria={() => setSituacao('previsto')}
        />
      }
      refreshing={carregando}
      onRefresh={atualizar}
    />
  );
}

const estilos = StyleSheet.create({
  centro: { flex: 1, justifyContent: 'center', padding: espaco[16], backgroundColor: cores.paper },
  conteudo: { padding: espaco[16], gap: espaco[12], paddingBottom: padding.fimDaTela },
  cabecalho: { gap: espaco[8], paddingBottom: espaco[4] },
  chips: { flexDirection: 'row', gap: espaco[8] },
  aviso: { flexDirection: 'row', alignItems: 'center', gap: espaco[8] },
});
