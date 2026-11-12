import * as Notifications from 'expo-notifications';
import type { SQLiteDatabase } from 'expo-sqlite';

import { buscarCiclo, buscarCicloAtivo, buscarConfiguracao, listarEtapas, listarRegistrosDoCiclo, salvarConfiguracao } from '@/services/database';
import type { SessaoCronometro } from '@/types/banco';
import { CONFIGURACAO_LEMBRETES_PADRAO, type ConfiguracaoLembretes } from '@/types/lembretes';
import { cancelarAvisoCronometro, obterPermissaoNotificacoes, reagendarAvisoCronometro, salvarELembrar } from '../lembretes';

jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  AndroidImportance: { DEFAULT: 3 },
  SchedulableTriggerInputTypes: { WEEKLY: 'weekly', DATE: 'date' },
}));
jest.mock('@/services/database', () => ({
  CHAVE_LEMBRETES: 'lembretes',
  buscarCiclo: jest.fn(),
  buscarCicloAtivo: jest.fn(),
  buscarConfiguracao: jest.fn(),
  listarEtapas: jest.fn(),
  listarRegistrosDoCiclo: jest.fn(),
  salvarConfiguracao: jest.fn(),
}));

const db = {} as SQLiteDatabase;
const ciclo = { id: 1, voltaAtual: 1 } as never;
const etapas = [{ id: 1, cicloId: 1, posicao: 1, materia: 'Matemática', chaveMateria: 'matematica', minutos: 60 }] as never;
const ativa = (mudanca: Partial<ConfiguracaoLembretes> = {}): ConfiguracaoLembretes => ({ ...CONFIGURACAO_LEMBRETES_PADRAO, lembreteDiarioAtivo: true, dias: [2, 4], ...mudanca });

let contador: number;
beforeEach(() => {
  jest.clearAllMocks();
  contador = 0;
  jest.mocked(Notifications.scheduleNotificationAsync).mockImplementation(async () => `id-${(contador += 1)}`);
  jest.mocked(Notifications.cancelScheduledNotificationAsync).mockResolvedValue(undefined);
  jest.mocked(buscarCicloAtivo).mockResolvedValue(ciclo);
  jest.mocked(buscarCiclo).mockResolvedValue(ciclo);
  jest.mocked(listarEtapas).mockResolvedValue(etapas);
  jest.mocked(listarRegistrosDoCiclo).mockResolvedValue([]);
});

describe('salvarELembrar', () => {
  it('agenda um lembrete por dia com o texto do ciclo ativo e salva os ids', async () => {
    const salva = await salvarELembrar(db, ativa());
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(2);
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(expect.objectContaining({
      content: expect.objectContaining({ body: 'Próxima etapa: Matemática (0h de 1h nesta volta).', data: { url: '/(tabs)' } }),
      trigger: expect.objectContaining({ weekday: 2, hour: 19, minute: 30 }),
    }));
    expect(salva.idsLembretes).toEqual(['id-1', 'id-2']);
    expect(salvarConfiguracao).toHaveBeenCalledWith(db, 'lembretes', salva);
  });

  it('ao mudar o horário cancela os ids antigos e não duplica', async () => {
    const salva = await salvarELembrar(db, ativa({ idsLembretes: ['velho-1', 'velho-2'], hora: 8, minuto: 0 }));
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('velho-1');
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('velho-2');
    expect(salva.idsLembretes).toHaveLength(2);
    expect(salva.idsLembretes).not.toContain('velho-1');
  });

  it('desligado cancela tudo e não agenda', async () => {
    const salva = await salvarELembrar(db, ativa({ lembreteDiarioAtivo: false, idsLembretes: ['a'] }));
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('a');
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    expect(salva.idsLembretes).toEqual([]);
  });

  it('desligar o aviso do cronômetro cancela o aviso agendado', async () => {
    const salva = await salvarELembrar(db, ativa({ lembreteDiarioAtivo: false, avisoCronometroAtivo: false, idAvisoCronometro: 'aviso' }));
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('aviso');
    expect(salva.idAvisoCronometro).toBeNull();
  });

  it('usa texto genérico quando não há ciclo ativo', async () => {
    jest.mocked(buscarCicloAtivo).mockResolvedValue(null);
    await salvarELembrar(db, ativa({ dias: [2] }));
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(expect.objectContaining({
      content: expect.objectContaining({ body: expect.stringContaining('próxima etapa') }),
    }));
  });
});

describe('aviso do cronômetro', () => {
  const sessao: SessaoCronometro = { cicloId: 1, iniciadoEm: 0, acumuladoMs: 0, pausadoEm: null };

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(10 * 60_000);
    jest.mocked(buscarConfiguracao).mockResolvedValue(ativa({ avisoCronometroAtivo: true, idAvisoCronometro: null }));
  });
  afterEach(() => jest.restoreAllMocks());

  it('agenda para o tempo restante da etapa e abre registrar-sessao', async () => {
    await reagendarAvisoCronometro(db, sessao);
    // etapa de 60 min, 10 já decorridos → dispara aos 60 min
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(expect.objectContaining({
      content: expect.objectContaining({ title: 'Sua sessão passou de 1h', body: 'Toque para registrar o estudo de Matemática.', data: { url: '/registrar-sessao' } }),
      trigger: expect.objectContaining({ date: new Date(60 * 60_000) }),
    }));
    expect(salvarConfiguracao).toHaveBeenCalledWith(db, 'lembretes', expect.objectContaining({ idAvisoCronometro: 'id-1' }));
  });

  it('reagendar cancela o aviso anterior em vez de duplicar', async () => {
    jest.mocked(buscarConfiguracao).mockResolvedValue(ativa({ avisoCronometroAtivo: true, idAvisoCronometro: 'anterior' }));
    await reagendarAvisoCronometro(db, sessao);
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('anterior');
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
  });

  it('não agenda quando o aviso está desligado', async () => {
    jest.mocked(buscarConfiguracao).mockResolvedValue(ativa({ avisoCronometroAtivo: false }));
    await reagendarAvisoCronometro(db, sessao);
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('cancelar remove o agendamento e limpa o id salvo', async () => {
    jest.mocked(buscarConfiguracao).mockResolvedValue(ativa({ avisoCronometroAtivo: true, idAvisoCronometro: 'aviso' }));
    await cancelarAvisoCronometro(db);
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('aviso');
    expect(salvarConfiguracao).toHaveBeenCalledWith(db, 'lembretes', expect.objectContaining({ idAvisoCronometro: null }));
  });
});

describe('obterPermissaoNotificacoes', () => {
  it('já concedida não pede de novo', async () => {
    jest.mocked(Notifications.getPermissionsAsync).mockResolvedValue({ granted: true, canAskAgain: true } as never);
    expect(await obterPermissaoNotificacoes()).toEqual({ granted: true, blocked: false });
    expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
  });

  it('pede quando ainda dá e trata a negação sem lançar erro', async () => {
    jest.mocked(Notifications.getPermissionsAsync).mockResolvedValue({ granted: false, canAskAgain: true } as never);
    jest.mocked(Notifications.requestPermissionsAsync).mockResolvedValue({ granted: false, canAskAgain: false } as never);
    expect(await obterPermissaoNotificacoes()).toEqual({ granted: false, blocked: true });
  });

  it('bloqueada de vez: não pede e marca como bloqueada', async () => {
    jest.mocked(Notifications.getPermissionsAsync).mockResolvedValue({ granted: false, canAskAgain: false } as never);
    expect(await obterPermissaoNotificacoes()).toEqual({ granted: false, blocked: true });
    expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
  });
});
