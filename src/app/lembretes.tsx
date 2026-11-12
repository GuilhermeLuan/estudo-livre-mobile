import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import * as Linking from 'expo-linking';
import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Cabecalho } from '@/components/Cabecalho';
import { Botao } from '@/components/ui/Botao';
import { Chip } from '@/components/ui/Chip';
import { Icone } from '@/components/ui/Icone';
import { Interruptor } from '@/components/ui/Interruptor';
import { Texto } from '@/components/ui/Texto';
import { cores, espaco, padding, raio } from '@/constants/tema';
import { buscarProximaEtapa, carregarLembretes, obterPermissaoNotificacoes, salvarELembrar } from '@/services/lembretes';
import { useToast } from '@/store/toast';
import { textoLembreteDiario } from '@/utils/lembretes';
import { CONFIGURACAO_LEMBRETES_PADRAO, type ConfiguracaoLembretes, type DiaDaSemana } from '@/types/lembretes';

const DIAS: { id: DiaDaSemana; texto: string }[] = [
  { id: 1, texto: 'D' }, { id: 2, texto: 'S' }, { id: 3, texto: 'T' }, { id: 4, texto: 'Q' },
  { id: 5, texto: 'Q' }, { id: 6, texto: 'S' }, { id: 7, texto: 'S' },
];

function dataDoHorario(hora: number, minuto: number) {
  const data = new Date();
  data.setHours(hora, minuto, 0, 0);
  return data;
}

export default function Lembretes() {
  const db = useSQLiteContext();
  const mostrarToast = useToast((s) => s.mostrar);
  const [configuracao, setConfiguracao] = useState<ConfiguracaoLembretes>(CONFIGURACAO_LEMBRETES_PADRAO);
  const [bloqueada, setBloqueada] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [previa, setPrevia] = useState<string>(textoLembreteDiario(null).corpo);

  const carregar = useCallback(async () => {
    try {
      const dados = await carregarLembretes(db);
      setConfiguracao(dados);
      setPrevia(textoLembreteDiario(await buscarProximaEtapa(db)).corpo);
    } catch {
      mostrarToast('Não foi possível carregar os lembretes.');
    } finally {
      setCarregando(false);
    }
  }, [db, mostrarToast]);

  useFocusEffect(useCallback(() => { void carregar(); }, [carregar]));

  const atualizar = (mudanca: Partial<ConfiguracaoLembretes>) => setConfiguracao((atual) => ({ ...atual, ...mudanca }));
  const alternar = async (campo: 'lembreteDiarioAtivo' | 'avisoCronometroAtivo') => {
    if (!configuracao[campo]) {
      const permissao = await obterPermissaoNotificacoes();
      if (!permissao.granted) {
        setBloqueada(permissao.blocked);
        mostrarToast('Permita notificações para ativar este aviso.');
        return;
      }
    }
    atualizar({ [campo]: !configuracao[campo] });
  };
  const trocarDia = (dia: DiaDaSemana) => atualizar({ dias: configuracao.dias.includes(dia) ? configuracao.dias.filter((item) => item !== dia) : [...configuracao.dias, dia].sort() as DiaDaSemana[] });
  const selecionarHorario = () => DateTimePickerAndroid.open({ value: dataDoHorario(configuracao.hora, configuracao.minuto), mode: 'time', is24Hour: true, onChange: (_, data) => data && atualizar({ hora: data.getHours(), minuto: data.getMinutes() }) });
  const salvar = async () => {
    if (configuracao.lembreteDiarioAtivo && configuracao.dias.length === 0) {
      mostrarToast('Selecione ao menos um dia para o lembrete diário.');
      return;
    }
    setSalvando(true);
    try {
      await salvarELembrar(db, configuracao);
      mostrarToast('Lembretes salvos.');
      router.back();
    } catch {
      mostrarToast('Não foi possível salvar os lembretes.');
    } finally { setSalvando(false); }
  };
  const horario = useMemo(() => `${String(configuracao.hora).padStart(2, '0')}:${String(configuracao.minuto).padStart(2, '0')}`, [configuracao.hora, configuracao.minuto]);
  const desabilitado = bloqueada || carregando;

  return (
    <View style={estilos.tela}>
      <SafeAreaView edges={['top']}><Cabecalho mostrarSino={false} /></SafeAreaView>
      <ScrollView contentContainerStyle={estilos.conteudo}>
        <View style={estilos.titulo}>
          <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={() => router.back()} style={estilos.voltar}><Icone nome="voltar" /></Pressable>
          <View><Texto estilo="tituloH1">Lembretes</Texto><Texto estilo="lista14" cor={cores.ink2}>Notificações no aparelho</Texto></View>
        </View>
        {bloqueada ? <View style={estilos.bloqueio}><Texto estilo="lista14Forte" cor={cores.red}>Notificações bloqueadas</Texto><Texto estilo="meta13" cor={cores.ink2}>Ative nas configurações do aparelho para receber lembretes de estudo.</Texto><Botao rotulo="Abrir configurações" variante="secundario" tamanho="lista" onPress={() => void Linking.openSettings()} /></View> : null}
        <View style={[estilos.card, desabilitado && estilos.opaco]}>
          <View style={estilos.linhaTitulo}><View><Texto estilo="lista14Forte">Lembrete diário</Texto><Texto estilo="meta13" cor={cores.ink2}>Aviso para estudar a próxima etapa do ciclo ativo</Texto></View><Interruptor ligado={configuracao.lembreteDiarioAtivo} desabilitado={desabilitado} onPress={() => void alternar('lembreteDiarioAtivo')} /></View>
          <View style={estilos.separador} />
          <View style={estilos.horario}><Texto estilo="meta13Medio" cor={cores.ink2}>Horário</Texto><Pressable disabled={!configuracao.lembreteDiarioAtivo || desabilitado} onPress={selecionarHorario} style={estilos.caixaHorario}><Texto estilo="lista14Forte">{horario}</Texto></Pressable></View>
          {Platform.OS === 'ios' && configuracao.lembreteDiarioAtivo ? <DateTimePicker value={dataDoHorario(configuracao.hora, configuracao.minuto)} mode="time" themeVariant="dark" onChange={(_, data) => data && atualizar({ hora: data.getHours(), minuto: data.getMinutes() })} /> : null}
          <Texto estilo="meta13Medio" cor={cores.ink2}>Repetir em</Texto>
          <View style={estilos.dias}>{DIAS.map((dia) => <Chip key={`${dia.id}-${dia.texto}`} texto={dia.texto} selecionado={configuracao.dias.includes(dia.id)} onPress={() => trocarDia(dia.id)} />)}</View>
        </View>
        <View style={[estilos.card, desabilitado && estilos.opaco]}>
          <View style={estilos.linhaTitulo}><View><Texto estilo="lista14Forte">Aviso do cronômetro</Texto><Texto estilo="meta13" cor={cores.ink2}>Notifica quando a sessão passa do tempo da etapa</Texto></View><Interruptor ligado={configuracao.avisoCronometroAtivo} desabilitado={desabilitado} onPress={() => void alternar('avisoCronometroAtivo')} /></View>
        </View>
        <View style={estilos.previa}><Texto estilo="rotulo11" cor={cores.ink2}>PRÉVIA</Texto><Texto estilo="lista14Forte">Hora de estudar</Texto><Texto estilo="meta13" cor={cores.ink2}>{previa}</Texto></View>
        <Botao rotulo="Salvar lembretes" onPress={() => void salvar()} desabilitado={salvando || desabilitado} />
      </ScrollView>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.paper }, conteudo: { gap: espaco[12], padding: espaco[16], paddingBottom: padding.fimDaTela },
  titulo: { flexDirection: 'row', alignItems: 'center', gap: espaco[10], marginBottom: espaco[8] }, voltar: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  card: { gap: espaco[14], padding: padding.card, backgroundColor: cores.surface, borderWidth: 1, borderColor: cores.line, borderRadius: raio.lg },
  linhaTitulo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: espaco[12] }, separador: { height: 1, backgroundColor: cores.line }, horario: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, caixaHorario: { minWidth: 76, alignItems: 'center', paddingHorizontal: espaco[12], paddingVertical: espaco[8], borderRadius: raio.control, backgroundColor: cores.paper, borderWidth: 1, borderColor: cores.line },
  dias: { flexDirection: 'row', justifyContent: 'space-between', gap: espaco[4] }, previa: { gap: espaco[4], padding: padding.card, backgroundColor: cores.surface2, borderRadius: raio.control, borderWidth: 1, borderColor: cores.line },
  bloqueio: { gap: espaco[8], padding: padding.card, borderRadius: raio.lg, backgroundColor: cores.redSoft, borderWidth: 1, borderColor: cores.red }, opaco: { opacity: 0.4 },
});
