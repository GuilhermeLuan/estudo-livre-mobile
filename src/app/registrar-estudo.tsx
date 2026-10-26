import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Botao } from '@/components/ui/Botao';
import { Campo } from '@/components/ui/Campo';
import { CampoNumerico } from '@/components/ui/CampoNumerico';
import { Chip } from '@/components/ui/Chip';
import { Icone } from '@/components/ui/Icone';
import { Texto } from '@/components/ui/Texto';
import { cores, espaco, padding, raio, sombras } from '@/constants/tema';
import {
  buscarCicloAtivo,
  listarEtapas,
  listarRegistrosDoCiclo,
  registrarEstudo,
} from '@/services/database';
import { useToast } from '@/store/toast';
import type { Ciclo, Etapa, TipoEstudo } from '@/types/banco';
import { formatarDataBR, formatarDataISO } from '@/utils/data';
import { materiasDoCiclo, proximaEtapa } from '@/utils/proximaEtapa';

const TIPOS: { valor: TipoEstudo; rotulo: string }[] = [
  { valor: 'teoria', rotulo: 'Teoria' },
  { valor: 'exercicios', rotulo: 'Exercícios' },
  { valor: 'revisao', rotulo: 'Revisão' },
  { valor: 'videoaula', rotulo: 'Videoaula' },
  { valor: 'leitura_lei', rotulo: 'Leitura de lei' },
];

type Formulario = {
  chaveMateria: string | null;
  conteudo: string;
  data: Date;
  horas: string;
  minutos: string;
  tipo: TipoEstudo | null;
  questoes: string;
  acertos: string;
  anotacao: string;
};

const paraInteiro = (v: string) => (v === '' ? 0 : Number(v));
const ehIOS = Platform.OS === 'ios';

export default function RegistrarEstudo() {
  const db = useSQLiteContext();
  const { top, bottom } = useSafeAreaInsets();
  const { height: alturaJanela } = useWindowDimensions();
  const mostrarToast = useToast((s) => s.mostrar);

  const [ciclo, setCiclo] = useState<Ciclo | null>(null);
  const [etapas, setEtapas] = useState<Etapa[]>([]);
  const [semCiclo, setSemCiclo] = useState(false);
  const [listaAberta, setListaAberta] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [form, setForm] = useState<Formulario>({
    chaveMateria: null,
    conteudo: '',
    data: new Date(),
    horas: '',
    minutos: '',
    tipo: null,
    questoes: '',
    acertos: '',
    anotacao: '',
  });

  const alterar = <K extends keyof Formulario>(campo: K, valor: Formulario[K]) =>
    setForm((f) => ({ ...f, [campo]: valor }));

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        const cicloAtivo = await buscarCicloAtivo(db);
        if (!ativo) return;
        if (!cicloAtivo) return setSemCiclo(true);
        const [lista, registros] = await Promise.all([
          listarEtapas(db, cicloAtivo.id),
          listarRegistrosDoCiclo(db, cicloAtivo.id, cicloAtivo.voltaAtual),
        ]);
        if (!ativo) return;
        setCiclo(cicloAtivo);
        setEtapas(lista);
        // Se todas as etapas estiverem cheias, sugere a primeira.
        const sugerida = proximaEtapa(lista, registros) ?? lista[0];
        setForm((f) => ({ ...f, chaveMateria: sugerida?.chaveMateria ?? null }));
      } catch {
        if (ativo) setErro('Não foi possível carregar o ciclo.');
      }
    })();
    return () => {
      ativo = false;
    };
  }, [db]);

  const materias = useMemo(() => materiasDoCiclo(etapas), [etapas]);
  const materiaEscolhida = materias.find((m) => m.chave === form.chaveMateria);

  const duracaoMinutos = paraInteiro(form.horas) * 60 + paraInteiro(form.minutos);
  const totalQuestoes = paraInteiro(form.questoes);
  const comQuestoes = totalQuestoes > 0;
  const totalAcertos = paraInteiro(form.acertos);
  const acertosAcimaDeQuestoes = comQuestoes && totalAcertos > totalQuestoes;

  const pendencia =
    form.chaveMateria === null
      ? 'Escolha a matéria.'
      : duracaoMinutos <= 0
        ? 'Informe a duração: horas ou minutos maiores que zero.'
        : acertosAcimaDeQuestoes
          ? 'Acertos não pode passar de questões.'
          : null;
  const podeSalvar = pendencia === null && !salvando;

  const alterarQuestoes = (v: string) =>
    setForm((f) => ({ ...f, questoes: v, acertos: paraInteiro(v) === 0 ? '' : f.acertos }));

  const alterarData = (nova: Date) => alterar('data', nova > new Date() ? new Date() : nova);

  const abrirSeletorAndroid = () =>
    DateTimePickerAndroid.open({
      value: form.data,
      mode: 'date',
      maximumDate: new Date(),
      onValueChange: (_, d) => alterarData(d),
    });

  const salvar = async () => {
    if (!podeSalvar || form.chaveMateria === null) return;
    setSalvando(true);
    setErro(null);
    try {
      // A volta é a que está aberta agora, independentemente da data informada.
      const atual = await buscarCicloAtivo(db);
      if (!atual) {
        setErro('Nenhum ciclo ativo. Ative um ciclo para registrar.');
        return;
      }
      const voltaFechou = await registrarEstudo(db, {
        cicloId: atual.id,
        volta: atual.voltaAtual,
        chaveMateria: form.chaveMateria,
        conteudo: form.conteudo.trim() || null,
        data: formatarDataISO(form.data),
        minutos: duracaoMinutos,
        tipo: form.tipo,
        questoes: comQuestoes ? totalQuestoes : null,
        acertos: comQuestoes && form.acertos !== '' ? totalAcertos : null,
        anotacao: form.anotacao.trim() || null,
      });
      mostrarToast(voltaFechou ? `Estudo registrado. Volta ${atual.voltaAtual} concluída!` : 'Estudo registrado');
      router.back();
    } catch {
      setErro('Não foi possível salvar o estudo. Tente de novo.');
    } finally {
      setSalvando(false);
    }
  };

  const cancelar = () => router.back();

  return (
    <KeyboardAvoidingView
      behavior={ehIOS ? 'padding' : undefined}
      style={estilos.scrim}
    >
      <Pressable accessibilityLabel="Fechar sem salvar" style={StyleSheet.absoluteFill} onPress={cancelar} />
      <View
        accessibilityViewIsModal
        style={[estilos.dialogo, { maxHeight: alturaJanela - top - bottom - espaco[24] * 2 }]}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={estilos.formulario}
        >
          <View style={estilos.cabecalho}>
            <View style={estilos.titulo}>
              <Texto estilo="tituloDialogo">Registrar estudo</Texto>
              {ciclo ? (
                <Texto estilo="meta13" cor={cores.ink2}>
                  {ciclo.nome}
                </Texto>
              ) : null}
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fechar"
              onPress={cancelar}
              style={estilos.fechar}
            >
              <Icone nome="fechar" tamanho={20} />
            </Pressable>
          </View>

          {semCiclo ? (
            <Texto estilo="lista14" cor={cores.ink2}>
              Nenhum ciclo ativo. Crie ou ative um ciclo para registrar estudos.
            </Texto>
          ) : (
            <>
              <View style={estilos.grupo}>
                <Campo
                  tipo="selecao"
                  rotulo="Matéria"
                  valor={materiaEscolhida?.nome ?? ''}
                  placeholder="Escolha a matéria"
                  onPress={() => setListaAberta((a) => !a)}
                />
                {listaAberta ? (
                  <View style={estilos.lista}>
                    {materias.map((m) => (
                      <Pressable
                        key={m.chave}
                        accessibilityRole="button"
                        accessibilityState={{ selected: m.chave === form.chaveMateria }}
                        onPress={() => {
                          alterar('chaveMateria', m.chave);
                          setListaAberta(false);
                        }}
                        style={estilos.opcao}
                      >
                        <Texto
                          estilo="lista14Medio"
                          cor={m.chave === form.chaveMateria ? cores.accentInk : cores.ink}
                        >
                          {m.nome}
                        </Texto>
                      </Pressable>
                    ))}
                  </View>
                ) : null}
              </View>

              <Campo
                tipo="texto"
                rotulo="Conteúdo livre"
                valor={form.conteudo}
                onChangeText={(v) => alterar('conteudo', v)}
                placeholder="Opcional. Ex.: crase antes de horas"
              />

              <View style={estilos.grupo}>
                <Texto estilo="meta13Medio" cor={cores.ink2}>
                  Data
                </Texto>
                {Platform.OS === 'android' ? (
                  <Pressable accessibilityRole="button" onPress={abrirSeletorAndroid} style={estilos.campoData}>
                    <Texto estilo="lista14">{formatarDataBR(form.data)}</Texto>
                  </Pressable>
                ) : (
                  <View style={estilos.campoData}>
                    <Texto estilo="lista14">{formatarDataBR(form.data)}</Texto>
                    {/* O seletor nativo fica transparente por cima para o texto seguir o tamanho do Figma. */}
                    <DateTimePicker
                      style={estilos.seletorTransparente}
                      value={form.data}
                      mode="date"
                      locale="pt-BR"
                      maximumDate={new Date()}
                      // O app é só no tema escuro (userInterfaceStyle: dark).
                      themeVariant="dark"
                      onValueChange={(_, d) => alterarData(d)}
                    />
                  </View>
                )}
              </View>

              <View style={estilos.linha}>
                <View style={estilos.metade}>
                  <CampoNumerico
                    rotulo="Horas"
                    valor={form.horas}
                    onChange={(v) => alterar('horas', v)}
                    digitos={2}
                  />
                </View>
                <View style={estilos.metade}>
                  <CampoNumerico
                    rotulo="Minutos"
                    valor={form.minutos}
                    onChange={(v) => alterar('minutos', v)}
                    digitos={3}
                  />
                </View>
              </View>

              <View style={estilos.grupo}>
                <Texto estilo="meta13Medio" cor={cores.ink2}>
                  Tipo de estudo
                </Texto>
                <View style={estilos.chips}>
                  {TIPOS.map((t) => (
                    <Chip
                      key={t.valor}
                      texto={t.rotulo}
                      selecionado={form.tipo === t.valor}
                      onPress={() => alterar('tipo', form.tipo === t.valor ? null : t.valor)}
                    />
                  ))}
                </View>
              </View>

              <View style={estilos.linha}>
                <View style={estilos.metade}>
                  <CampoNumerico
                    rotulo="Questões"
                    valor={form.questoes}
                    onChange={alterarQuestoes}
                    digitos={4}
                    placeholder="Opcional"
                  />
                </View>
                <View style={estilos.metade}>
                  <CampoNumerico
                    rotulo="Acertos"
                    valor={form.acertos}
                    onChange={(v) => alterar('acertos', v)}
                    digitos={4}
                    placeholder="Opcional"
                    desabilitado={!comQuestoes}
                  />
                </View>
              </View>

              <Campo
                tipo="areaDeTexto"
                rotulo="Anotação"
                valor={form.anotacao}
                onChangeText={(v) => alterar('anotacao', v)}
                placeholder="Opcional"
              />
            </>
          )}
        </ScrollView>
        {semCiclo ? null : (
          <View style={estilos.rodape}>
            {pendencia || erro ? (
              <Texto estilo="meta13Medio" cor={erro ? cores.red : cores.ink2}>
                {erro ?? pendencia}
              </Texto>
            ) : null}
            <View style={estilos.botoes}>
              <Botao rotulo="Cancelar" variante="discreto" onPress={cancelar} />
              <Botao rotulo="Salvar registro" desabilitado={!podeSalvar} onPress={salvar} />
            </View>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  scrim: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: espaco[16],
    backgroundColor: cores.scrim,
  },
  dialogo: {
    backgroundColor: cores.surface,
    borderWidth: 1,
    borderColor: cores.line,
    borderRadius: raio.lg,
    overflow: 'hidden',
    ...sombras.flutuante,
  },
  formulario: { gap: espaco[16], padding: padding.hero },
  cabecalho: { flexDirection: 'row', alignItems: 'flex-start', gap: espaco[12] },
  titulo: { flex: 1 },
  fechar: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  grupo: { gap: espaco[6] },
  lista: {
    borderWidth: 1,
    borderColor: cores.line,
    borderRadius: raio.control,
    backgroundColor: cores.paper,
    overflow: 'hidden',
  },
  opcao: { paddingHorizontal: espaco[12], paddingVertical: espaco[10] },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: espaco[6] },
  linha: { flexDirection: 'row', gap: espaco[12] },
  metade: { flex: 1 },
  seletorTransparente: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, opacity: 0.02 },
  campoData: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: espaco[12],
    borderWidth: 1,
    borderColor: cores.line,
    borderRadius: raio.control,
    backgroundColor: cores.paper,
  },
  rodape: {
    gap: espaco[12],
    paddingHorizontal: padding.hero,
    paddingVertical: espaco[16],
    borderTopWidth: 1,
    borderTopColor: cores.line,
  },
  botoes: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: espaco[10] },
});
