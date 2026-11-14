import type { SQLiteDatabase } from 'expo-sqlite';

import { cancelarAvisoCronometro, reagendarAvisoCronometro } from '@/services/lembretes';
import { buscarSessao, descartarSessao, salvarSessao } from '@/services/database/cronometro';
import type { SessaoCronometro } from '@/types/banco';
import { tempoDecorridoMs } from '@/utils/tempoCronometro';
import { useCronometro } from '../cronometro';

jest.mock('@/services/database/cronometro', () => ({
  buscarSessao: jest.fn(),
  salvarSessao: jest.fn(),
  descartarSessao: jest.fn(),
}));

jest.mock('@/services/lembretes', () => ({
  reagendarAvisoCronometro: jest.fn(),
  cancelarAvisoCronometro: jest.fn(),
}));

const db = {} as SQLiteDatabase;
let persistida: SessaoCronometro | null;

beforeEach(() => {
  persistida = null;
  useCronometro.setState({ sessao: null, pronto: false, ocupado: false });
  jest.mocked(buscarSessao).mockImplementation(async () => persistida);
  jest.mocked(salvarSessao).mockImplementation(async (_, sessao) => { persistida = sessao; });
  jest.mocked(descartarSessao).mockImplementation(async () => { persistida = null; });
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
});

it('pausa, retoma e recupera o tempo correto após reabrir o app', async () => {
  const relogio = jest.spyOn(Date, 'now');
  relogio.mockReturnValue(1_000);
  await useCronometro.getState().iniciar(db, 7);

  relogio.mockReturnValue(41_000);
  await useCronometro.getState().pausar(db);
  expect(persistida?.acumuladoMs).toBe(40_000);

  relogio.mockReturnValue(101_000);
  await useCronometro.getState().retomar(db);
  relogio.mockReturnValue(121_000);

  useCronometro.setState({ sessao: null, pronto: false });
  await useCronometro.getState().hidratar(db);
  expect(tempoDecorridoMs(useCronometro.getState().sessao!, Date.now())).toBe(60_000);
});

it('mantém uma única sessão ligada ao ciclo onde começou', async () => {
  await useCronometro.getState().iniciar(db, 7);
  await useCronometro.getState().iniciar(db, 8);
  expect(persistida?.cicloId).toBe(7);
  await useCronometro.getState().descartar(db);
  expect(persistida).toBeNull();
});

it('agenda o aviso ao iniciar/retomar e cancela ao pausar e descartar', async () => {
  await useCronometro.getState().iniciar(db, 7);
  expect(reagendarAvisoCronometro).toHaveBeenCalledTimes(1);
  await useCronometro.getState().pausar(db);
  expect(cancelarAvisoCronometro).toHaveBeenCalledTimes(1);
  await useCronometro.getState().retomar(db);
  expect(reagendarAvisoCronometro).toHaveBeenCalledTimes(2);
  await useCronometro.getState().descartar(db);
  expect(cancelarAvisoCronometro).toHaveBeenCalledTimes(2);
});
