import { useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { formatarDuracao } from '@/components/CardCiclo';
import { ItemEtapa } from '@/components/ItemEtapa';
import { Botao } from '@/components/ui/Botao';
import { Campo } from '@/components/ui/Campo';
import { DialogoConfirmacao } from '@/components/ui/DialogoConfirmacao';
import { Texto } from '@/components/ui/Texto';
import { cores, espaco, raio } from '@/constants/tema';
import {
  atualizarEtapa,
  buscarCiclo,
  criarEtapa,
  excluirEtapa,
  listarEtapas,
  renomearCiclo,
} from '@/services/database';
import type { Ciclo as CicloTipo, Etapa } from '@/types/banco';
import { horasParaMinutos } from '@/utils/carga';

const LIMITE_NOME = 60;

export default function Ciclo() {
  const db = useSQLiteContext();
  const { id } = useLocalSearchParams<{ id: string }>();
  const cicloId = Number(id);
  const [ciclo, setCiclo] = useState<CicloTipo | null>(null);
  const [nome, setNome] = useState('');
  const [etapas, setEtapas] = useState<Etapa[]>([]);
  const [aberta, setAberta] = useState<number | null>(null);
  const [remover, setRemover] = useState<{ etapa: Etapa; posicao: number } | null>(null);
  const [novaMateria, setNovaMateria] = useState('');
  const [novasHoras, setNovasHoras] = useState('');

  const carregar = useCallback(async () => {
    const [c, e] = await Promise.all([buscarCiclo(db, cicloId), listarEtapas(db, cicloId)]);
    setCiclo(c);
    setEtapas(e);
  }, [db, cicloId]);

  useEffect(() => {
    let ativo = true;
    Promise.all([buscarCiclo(db, cicloId), listarEtapas(db, cicloId)]).then(([c, e]) => {
      if (!ativo) return;
      setCiclo(c);
      setNome(c?.nome ?? '');
      setEtapas(e);
    });
    return () => {
      ativo = false;
    };
  }, [db, cicloId]);

  const totalMinutos = etapas.reduce((soma, e) => soma + e.minutos, 0);
  const nomeLimpo = nome.trim();
  const nomeValido = nomeLimpo.length > 0 && nomeLimpo.length <= LIMITE_NOME;
  const nomeAlterado = ciclo !== null && nomeLimpo !== ciclo.nome;

  const novosMinutos = horasParaMinutos(novasHoras);
  const novaValida = novaMateria.trim().length > 0 && novosMinutos !== null;

  const [ocupado, setOcupado] = useState(false);
  const travado = useRef(false);

  async function executar(acao: () => Promise<void>, erro: string) {
    if (travado.current) return;
    travado.current = true;
    setOcupado(true);
    try {
      let gravou = false;
      try {
        await acao();
        gravou = true;
      } catch {
        Alert.alert(erro, 'Tente novamente.');
      }
      if (gravou) {
        try {
          await carregar();
        } catch {
          Alert.alert('Salvo, mas não foi possível atualizar a lista', 'Saia da tela e volte para recarregar.');
        }
      }
    } finally {
      travado.current = false;
      setOcupado(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={estilos.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
    <ScrollView
      style={{ backgroundColor: cores.paper }}
      contentContainerStyle={estilos.conteudo}
      keyboardShouldPersistTaps="handled"
    >
      <View style={estilos.titulo}>
        <Texto estilo="tituloH1">{ciclo?.nome ?? 'Ciclo'}</Texto>
        <Texto estilo="lista14" cor={cores.ink2}>
          Cada ciclo tem as próprias matérias. Uma matéria pode ter várias etapas, cada uma com as suas horas. A ordem é só
          uma sugestão.
        </Texto>
      </View>

      <View style={estilos.card}>
        <Texto estilo="tituloH2">Nome do ciclo</Texto>
        <Campo tipo="texto" rotulo="Nome do ciclo" valor={nome} onChangeText={setNome} maxLength={LIMITE_NOME} />
        <View style={estilos.inicio}>
          <Botao
            rotulo="Renomear ciclo"
            desabilitado={!nomeValido || !nomeAlterado || ocupado}
            onPress={() => executar(() => renomearCiclo(db, cicloId, nomeLimpo), 'Não foi possível renomear')}
          />
        </View>
      </View>

      <View style={estilos.card}>
        <View style={estilos.cabecalhoCard}>
          <Texto estilo="tituloH2">Etapas</Texto>
          <Texto estilo="meta13" cor={cores.ink2}>
            {`Total de horas: ${formatarDuracao(totalMinutos)}`}
          </Texto>
        </View>
        {etapas.length === 0 ? (
          <Texto estilo="meta13" cor={cores.ink2}>
            Nenhuma etapa ainda. Adicione a primeira abaixo.
          </Texto>
        ) : (
          <View style={estilos.lista}>
            {etapas.map((e, i) => (
              <ItemEtapa
                key={`${e.id}-${e.materia}-${e.minutos}`}
                posicao={i + 1}
                materia={e.materia}
                minutos={e.minutos}
                aberto={aberta === e.id}
                ocupado={ocupado}
                onAbrir={() => setAberta(e.id)}
                onFechar={() => setAberta(null)}
                onSalvar={(materia, minutos) =>
                  executar(async () => {
                    await atualizarEtapa(db, e.id, materia, minutos);
                    setAberta(null);
                  }, 'Não foi possível salvar a etapa')
                }
                onRemover={() => setRemover({ etapa: e, posicao: i + 1 })}
              />
            ))}
          </View>
        )}
      </View>

      <View style={estilos.card}>
        <Texto estilo="tituloH2">Adicionar etapa</Texto>
        <Campo tipo="texto" rotulo="Nome da matéria" valor={novaMateria} onChangeText={setNovaMateria} />
        <Campo
          tipo="texto"
          rotulo="Carga horária (h)"
          valor={novasHoras}
          onChangeText={setNovasHoras}
          keyboardType="decimal-pad"
        />
        <View style={estilos.inicio}>
          <Botao
            rotulo="Adicionar etapa"
            desabilitado={!novaValida || ocupado}
            onPress={() =>
              novosMinutos !== null &&
              executar(async () => {
                await criarEtapa(db, cicloId, novaMateria, novosMinutos);
                setNovaMateria('');
                setNovasHoras('');
              }, 'Não foi possível adicionar a etapa')
            }
          />
        </View>
      </View>

      <DialogoConfirmacao
        visivel={remover !== null}
        titulo="Remover etapa?"
        mensagem={`A etapa ${remover?.posicao}. ${remover?.etapa.materia} sai do ciclo. As horas já registradas continuam nas estatísticas.`}
        tom="perigo"
        rotuloConfirmar="Remover"
        onCancelar={() => setRemover(null)}
        onConfirmar={() => {
          const alvo = remover;
          setRemover(null);
          if (!alvo) return;
          setAberta(null);
          executar(() => excluirEtapa(db, alvo.etapa.id), 'Não foi possível remover a etapa');
        }}
      />
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  flex: { flex: 1 },
  conteudo: { gap: espaco[20], paddingTop: espaco[20], paddingHorizontal: espaco[16], paddingBottom: 120 },
  titulo: { gap: espaco[4] },
  card: {
    gap: espaco[12],
    padding: espaco[14],
    backgroundColor: cores.surface,
    borderWidth: 1,
    borderColor: cores.line,
    borderRadius: raio.lg,
  },
  cabecalhoCard: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', columnGap: espaco[8] },
  lista: { gap: espaco[8] },
  inicio: { flexDirection: 'row' },
});
