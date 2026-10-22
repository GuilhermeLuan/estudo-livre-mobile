import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Botao } from '@/components/ui/Botao';
import { Campo } from '@/components/ui/Campo';
import { Chip } from '@/components/ui/Chip';
import { EstadoVazio } from '@/components/ui/EstadoVazio';
import { Texto } from '@/components/ui/Texto';
import { cores, espaco, raio } from '@/constants/tema';
import {
  buscarCicloAtivo,
  criarRegistro,
  listarEtapas,
  listarRegistrosDoCiclo,
} from '@/services/database';
import { useToast } from '@/store/toast';
import type { Ciclo, Etapa, TipoEstudo } from '@/types/banco';
import { formatarDataBR, formatarDataISO } from '@/utils/data';
import { proximaEtapa } from '@/utils/proximaEtapa';

const TIPOS: { valor: TipoEstudo; rotulo: string }[] = [
  { valor: 'teoria', rotulo: 'Teoria' },
  { valor: 'exercicios', rotulo: 'Exercícios' },
  { valor: 'revisao', rotulo: 'Revisão' },
  { valor: 'videoaula', rotulo: 'Videoaula' },
  { valor: 'leitura_lei', rotulo: 'Leitura de lei' },
];

const soDigitos = (v: string) => v.replace(/\D/g, '');
const paraInteiro = (v: string) => (v === '' ? 0 : Number(v));

export default function RegistrarEstudo() {
  const db = useSQLiteContext();
  const { top, bottom } = useSafeAreaInsets();
  const mostrarToast = useToast((s) => s.mostrar);

  const [carregado, setCarregado] = useState(false);
  const [ciclo, setCiclo] = useState<Ciclo | null>(null);
  const [etapas, setEtapas] = useState<Etapa[]>([]);
  const [chaveMateria, setChaveMateria] = useState<string | null>(null);
  const [horas, setHoras] = useState('');
  const [minutos, setMinutos] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [tipo, setTipo] = useState<TipoEstudo | null>(null);
  const [questoes, setQuestoes] = useState('');
  const [acertos, setAcertos] = useState('');
  const [data, setData] = useState(() => new Date());
  const [anotacao, setAnotacao] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    let ativo = true;
    (async () => {
      const c = await buscarCicloAtivo(db);
      if (!c) return ativo && setCarregado(true);
      const [es, registros] = await Promise.all([
        listarEtapas(db, c.id),
        listarRegistrosDoCiclo(db, c.id, c.voltaAtual),
      ]);
      if (!ativo) return;
      setCiclo(c);
      setEtapas(es);
      setChaveMateria((proximaEtapa(es, registros) ?? es[0])?.chaveMateria ?? null);
      setCarregado(true);
    })();
    return () => {
      ativo = false;
    };
  }, [db]);

  const materias = useMemo(() => {
    const vistas = new Map<string, string>();
    for (const e of etapas) if (!vistas.has(e.chaveMateria)) vistas.set(e.chaveMateria, e.materia);
    return [...vistas].map(([chave, nome]) => ({ chave, nome }));
  }, [etapas]);

  const duracao = paraInteiro(horas) * 60 + paraInteiro(minutos);
  const nQuestoes = paraInteiro(questoes);
  const comQuestoes = nQuestoes > 0;
  const nAcertos = paraInteiro(acertos);
  const acertosInvalidos = comQuestoes && nAcertos > nQuestoes;
  const podeSalvar = chaveMateria !== null && duracao > 0 && !acertosInvalidos && !salvando;

  const aoMudarQuestoes = (v: string) => {
    const limpo = soDigitos(v);
    setQuestoes(limpo);
    if (paraInteiro(limpo) === 0) setAcertos('');
  };

  const escolherData = (nova: Date) => {
    const hoje = new Date();
    setData(nova > hoje ? hoje : nova);
  };

  const abrirSeletorAndroid = () =>
    DateTimePickerAndroid.open({
      value: data,
      mode: 'date',
      maximumDate: new Date(),
      onValueChange: (_, d) => escolherData(d),
    });

  const salvar = async () => {
    if (!podeSalvar || chaveMateria === null) return;
    setSalvando(true);
    try {
      // A volta é a que está aberta agora, independentemente da data informada.
      const atual = await buscarCicloAtivo(db);
      if (!atual) return;
      await criarRegistro(db, {
        cicloId: atual.id,
        volta: atual.voltaAtual,
        chaveMateria,
        conteudo: conteudo.trim() || null,
        data: formatarDataISO(data),
        minutos: duracao,
        tipo,
        questoes: comQuestoes ? nQuestoes : null,
        acertos: comQuestoes && acertos !== '' ? nAcertos : null,
        anotacao: anotacao.trim() || null,
      });
      mostrarToast('Estudo registrado');
      router.back();
    } finally {
      setSalvando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[estilos.tela, { paddingTop: Platform.OS === 'ios' ? 0 : top }]}
    >
      <View style={estilos.topo}>
        <Texto estilo="tituloH1">Registrar estudo</Texto>
        {ciclo ? (
          <Texto estilo="lista14" cor={cores.ink2}>
            {ciclo.nome}
          </Texto>
        ) : null}
      </View>

      {carregado && !ciclo ? (
        <View style={estilos.centro}>
          <EstadoVazio titulo="Nenhum ciclo ativo" texto="Crie ou ative um ciclo para registrar estudos." />
          <Botao rotulo="Fechar" variante="secundario" onPress={() => router.back()} />
        </View>
      ) : (
        <>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={estilos.formulario}
          >
            <View style={estilos.grupo}>
              <Texto estilo="meta13Medio" cor={cores.ink2}>
                Matéria
              </Texto>
              <View style={estilos.chips}>
                {materias.map((m) => (
                  <Chip
                    key={m.chave}
                    texto={m.nome}
                    selecionado={m.chave === chaveMateria}
                    onPress={() => setChaveMateria(m.chave)}
                  />
                ))}
              </View>
            </View>

            <View style={estilos.linha}>
              <View style={estilos.metade}>
                <Campo
                  tipo="texto"
                  rotulo="Horas"
                  valor={horas}
                  onChangeText={(v) => setHoras(soDigitos(v).slice(0, 2))}
                  keyboardType="number-pad"
                  placeholder="0"
                  maxLength={2}
                />
              </View>
              <View style={estilos.metade}>
                <Campo
                  tipo="texto"
                  rotulo="Minutos"
                  valor={minutos}
                  onChangeText={(v) => setMinutos(soDigitos(v).slice(0, 3))}
                  keyboardType="number-pad"
                  placeholder="0"
                  maxLength={3}
                />
              </View>
            </View>

            <Campo
              tipo="texto"
              rotulo="Conteúdo (opcional)"
              valor={conteudo}
              onChangeText={setConteudo}
              placeholder="Ex.: Princípios da administração"
            />

            <View style={estilos.grupo}>
              <Texto estilo="meta13Medio" cor={cores.ink2}>
                Tipo de estudo (opcional)
              </Texto>
              <View style={estilos.chips}>
                {TIPOS.map((t) => (
                  <Chip
                    key={t.valor}
                    texto={t.rotulo}
                    selecionado={tipo === t.valor}
                    onPress={() => setTipo(tipo === t.valor ? null : t.valor)}
                  />
                ))}
              </View>
            </View>

            <View style={estilos.linha}>
              <View style={estilos.metade}>
                <Campo
                  tipo="texto"
                  rotulo="Questões"
                  valor={questoes}
                  onChangeText={aoMudarQuestoes}
                  keyboardType="number-pad"
                  placeholder="0"
                  maxLength={4}
                />
              </View>
              <View style={estilos.metade}>
                <Campo
                  tipo="texto"
                  rotulo="Acertos"
                  valor={acertos}
                  onChangeText={(v) => setAcertos(soDigitos(v).slice(0, 4))}
                  keyboardType="number-pad"
                  placeholder="0"
                  maxLength={4}
                  desabilitado={!comQuestoes}
                />
              </View>
            </View>
            {acertosInvalidos ? (
              <Texto estilo="meta13Medio" cor={cores.red}>
                Acertos não pode passar de questões.
              </Texto>
            ) : null}

            <View style={estilos.grupo}>
              <Texto estilo="meta13Medio" cor={cores.ink2}>
                Data
              </Texto>
              {Platform.OS === 'android' ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={abrirSeletorAndroid}
                  style={estilos.campoData}
                >
                  <Texto estilo="lista14">{formatarDataBR(data)}</Texto>
                </Pressable>
              ) : (
                <View style={estilos.dataIos}>
                  <DateTimePicker
                    value={data}
                    mode="date"
                    maximumDate={new Date()}
                    themeVariant="dark"
                    onValueChange={(_, d) => escolherData(d)}
                  />
                </View>
              )}
            </View>

            <Campo
              tipo="areaDeTexto"
              rotulo="Anotação (opcional)"
              valor={anotacao}
              onChangeText={setAnotacao}
              placeholder="O que vale lembrar?"
            />
          </ScrollView>

          <View style={[estilos.rodape, { paddingBottom: Math.max(bottom, espaco[16]) }]}>
            <Botao rotulo="Cancelar" variante="secundario" onPress={() => router.back()} />
            <Botao rotulo="Salvar" desabilitado={!podeSalvar} onPress={salvar} />
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.paper },
  topo: { gap: espaco[4], paddingHorizontal: espaco[16], paddingTop: espaco[20], paddingBottom: espaco[8] },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: espaco[16], padding: espaco[16] },
  formulario: { gap: espaco[16], padding: espaco[16] },
  grupo: { gap: espaco[6] },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: espaco[8] },
  linha: { flexDirection: 'row', gap: espaco[12] },
  metade: { flex: 1 },
  campoData: {
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: espaco[12],
    borderWidth: 1,
    borderColor: cores.line,
    borderRadius: raio.control,
    backgroundColor: cores.paper,
  },
  dataIos: { alignItems: 'flex-start' },
  rodape: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: espaco[10],
    paddingHorizontal: espaco[16],
    paddingTop: espaco[12],
    borderTopWidth: 1,
    borderTopColor: cores.line,
    backgroundColor: cores.surface,
  },
});
