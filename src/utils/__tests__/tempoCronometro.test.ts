import type { SessaoCronometro } from '@/types/banco';
import { formatarCronometro, minutosArredondados, tempoDecorridoMs } from '../tempoCronometro';

const inicio = new Date('2026-10-26T23:59:50-03:00').getTime();
const sessao: SessaoCronometro = {
  cicloId: 1, iniciadoEm: inicio, acumuladoMs: 0, pausadoEm: null,
};

describe('cronômetro', () => {
  it('continua contando normalmente ao atravessar a meia-noite', () => {
    expect(tempoDecorridoMs(sessao, inicio + 20_000)).toBe(20_000);
  });

  it('não soma o intervalo pausado e retoma do tempo acumulado', () => {
    const pausada = { ...sessao, acumuladoMs: 20_000, pausadoEm: inicio + 20_000 };
    expect(tempoDecorridoMs(pausada, inicio + 80_000)).toBe(20_000);
    const retomada = { ...pausada, iniciadoEm: inicio + 80_000, pausadoEm: null };
    expect(tempoDecorridoMs(retomada, inicio + 100_000)).toBe(40_000);
  });

  it('arredonda minutos e formata horas, minutos e segundos', () => {
    expect(minutosArredondados(42 * 60_000 + 30_000)).toBe(43);
    expect(formatarCronometro(3_617_000)).toBe('01:00:17');
  });
});
