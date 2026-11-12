import * as Notifications from 'expo-notifications';
import type { SQLiteDatabase } from 'expo-sqlite';
import { Platform } from 'react-native';

import { buscarCiclo, buscarCicloAtivo, buscarConfiguracao, CHAVE_LEMBRETES, listarEtapas, listarRegistrosDoCiclo, salvarConfiguracao } from '@/services/database';
import type { SessaoCronometro } from '@/types/banco';
import { CONFIGURACAO_LEMBRETES_PADRAO, type ConfiguracaoLembretes } from '@/types/lembretes';
import { dataDoAvisoCronometro, type EtapaDoLembrete, planejarLembreteDiario, textoAvisoCronometro, textoLembreteDiario } from '@/utils/lembretes';
import { calcularProgressoVolta } from '@/utils/progresso';
import { tempoDecorridoMs } from '@/utils/tempoCronometro';

const CANAL = 'lembretes-estudo';

export async function prepararNotificacoes(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CANAL, {
      name: 'Lembretes de estudo',
      // eslint-disable-next-line import/namespace -- o enum existe nos tipos (tsc valida); o plugin não resolve `export *`.
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

export async function obterPermissaoNotificacoes() {
  if (Platform.OS === 'web') return { granted: false, blocked: false };
  const atual = await Notifications.getPermissionsAsync();
  if (atual.granted) return { granted: true, blocked: false };
  const resposta = atual.canAskAgain ? await Notifications.requestPermissionsAsync() : atual;
  return { granted: resposta.granted, blocked: !resposta.granted && !resposta.canAskAgain };
}

export async function carregarLembretes(db: SQLiteDatabase): Promise<ConfiguracaoLembretes> {
  return (await buscarConfiguracao<ConfiguracaoLembretes>(db, CHAVE_LEMBRETES)) ?? CONFIGURACAO_LEMBRETES_PADRAO;
}

async function cancelar(ids: readonly string[]) {
  await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined)));
}

export async function buscarProximaEtapa(db: SQLiteDatabase): Promise<EtapaDoLembrete | null> {
  const ciclo = await buscarCicloAtivo(db);
  if (!ciclo) return null;
  const [etapas, registros] = await Promise.all([listarEtapas(db, ciclo.id), listarRegistrosDoCiclo(db, ciclo.id, ciclo.voltaAtual)]);
  return calcularProgressoVolta({ cicloId: ciclo.id, volta: ciclo.voltaAtual, etapas, registros, agora: Date.now() }).proximaEtapa ?? null;
}

export async function salvarELembrar(db: SQLiteDatabase, configuracao: ConfiguracaoLembretes): Promise<ConfiguracaoLembretes> {
  const plano = planejarLembreteDiario(configuracao);
  await cancelar(plano.cancelar);
  const proxima = { ...configuracao, idsLembretes: [] as string[] };
  if (plano.agendar.length > 0 && Platform.OS !== 'web') {
    const texto = textoLembreteDiario(await buscarProximaEtapa(db));
    proxima.idsLembretes = await Promise.all(plano.agendar.map(({ weekday, hour, minute }) => Notifications.scheduleNotificationAsync({
      content: { title: texto.titulo, body: texto.corpo, data: { url: '/(tabs)' } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday, hour, minute, channelId: CANAL },
    })));
  }
  if (!proxima.avisoCronometroAtivo && proxima.idAvisoCronometro) {
    await cancelar([proxima.idAvisoCronometro]);
    proxima.idAvisoCronometro = null;
  }
  await salvarConfiguracao(db, CHAVE_LEMBRETES, proxima);
  return proxima;
}

export async function cancelarAvisoCronometro(db: SQLiteDatabase): Promise<void> {
  const configuracao = await carregarLembretes(db);
  if (configuracao.idAvisoCronometro) await cancelar([configuracao.idAvisoCronometro]);
  await salvarConfiguracao(db, CHAVE_LEMBRETES, { ...configuracao, idAvisoCronometro: null });
}

/** Agenda o alerta exatamente para o restante da próxima etapa em andamento. */
export async function reagendarAvisoCronometro(db: SQLiteDatabase, sessao: SessaoCronometro): Promise<void> {
  const configuracao = await carregarLembretes(db);
  if (!configuracao.avisoCronometroAtivo || Platform.OS === 'web') return;
  if (configuracao.idAvisoCronometro) await cancelar([configuracao.idAvisoCronometro]);

  const ciclo = await buscarCiclo(db, sessao.cicloId);
  if (!ciclo) return;
  const [etapas, registros] = await Promise.all([listarEtapas(db, ciclo.id), listarRegistrosDoCiclo(db, ciclo.id, ciclo.voltaAtual)]);
  const proxima = calcularProgressoVolta({ cicloId: ciclo.id, volta: ciclo.voltaAtual, etapas, registros, agora: Date.now() }).proximaEtapa;
  if (!proxima) return;

  const restanteMs = proxima.minutosFaltantes * 60_000 - tempoDecorridoMs(sessao, Date.now());
  const data = dataDoAvisoCronometro(Date.now(), restanteMs);
  const texto = textoAvisoCronometro(proxima.materia, Math.round((tempoDecorridoMs(sessao, Date.now()) + Math.max(0, restanteMs)) / 60_000));
  const id = await Notifications.scheduleNotificationAsync({
    content: { title: texto.titulo, body: texto.corpo, data: { url: '/registrar-sessao' } },
    trigger: data ? { type: Notifications.SchedulableTriggerInputTypes.DATE, date: data, channelId: CANAL } : null,
  });
  await salvarConfiguracao(db, CHAVE_LEMBRETES, { ...configuracao, idAvisoCronometro: id });
}
