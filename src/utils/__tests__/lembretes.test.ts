import { CONFIGURACAO_LEMBRETES_PADRAO, type ConfiguracaoLembretes } from '@/types/lembretes';
import { dataDoAvisoCronometro, planejarLembreteDiario, proximoDisparoDiario, textoAvisoCronometro, textoLembreteDiario } from '../lembretes';

const config = (mudanca: Partial<ConfiguracaoLembretes> = {}): ConfiguracaoLembretes => ({
  ...CONFIGURACAO_LEMBRETES_PADRAO,
  lembreteDiarioAtivo: true,
  hora: 19,
  minuto: 30,
  dias: [2, 4],
  ...mudanca,
});

describe('planejarLembreteDiario', () => {
  it('agenda um disparo semanal por dia selecionado', () => {
    expect(planejarLembreteDiario(config()).agendar).toEqual([
      { weekday: 2, hour: 19, minute: 30 },
      { weekday: 4, hour: 19, minute: 30 },
    ]);
  });

  it('cancela os ids anteriores ao reagendar, sem duplicar dias', () => {
    const plano = planejarLembreteDiario(config({ idsLembretes: ['a', 'b'], dias: [4, 2, 4], hora: 7, minuto: 5 }));
    expect(plano.cancelar).toEqual(['a', 'b']);
    expect(plano.agendar).toEqual([
      { weekday: 2, hour: 7, minute: 5 },
      { weekday: 4, hour: 7, minute: 5 },
    ]);
  });

  it('desligado: cancela tudo e não agenda nada', () => {
    expect(planejarLembreteDiario(config({ lembreteDiarioAtivo: false, idsLembretes: ['a'] }))).toEqual({ cancelar: ['a'], agendar: [] });
  });

  it('ligado sem dias não agenda nada', () => {
    expect(planejarLembreteDiario(config({ dias: [] })).agendar).toEqual([]);
  });
});

describe('proximoDisparoDiario', () => {
  // 2026-11-11 é quarta-feira (weekday 4 no padrão do Expo).
  it('usa hoje quando o horário ainda não passou', () => {
    expect(proximoDisparoDiario(new Date(2026, 10, 11, 10, 0), 19, 30, [4])).toEqual(new Date(2026, 10, 11, 19, 30));
  });

  it('pula para a próxima semana quando o horário de hoje já passou', () => {
    expect(proximoDisparoDiario(new Date(2026, 10, 11, 20, 0), 19, 30, [4])).toEqual(new Date(2026, 10, 18, 19, 30));
  });

  it('escolhe o próximo dia selecionado', () => {
    expect(proximoDisparoDiario(new Date(2026, 10, 11, 20, 0), 19, 30, [2, 6])).toEqual(new Date(2026, 10, 13, 19, 30));
  });

  it('retorna null sem dias', () => {
    expect(proximoDisparoDiario(new Date(2026, 10, 11), 19, 30, [])).toBeNull();
  });
});

describe('textoLembreteDiario', () => {
  it('usa a matéria da próxima etapa do ciclo ativo', () => {
    expect(textoLembreteDiario({ materia: 'Banco de Dados', minutosFeitos: 70, minutos: 120 }).corpo)
      .toBe('Próxima etapa: Banco de Dados (1h10 de 2h nesta volta).');
  });

  it('tem texto genérico sem ciclo ativo', () => {
    expect(textoLembreteDiario(null).corpo).toContain('próxima etapa');
  });
});

describe('textoAvisoCronometro', () => {
  it('cita o tempo da sessão e a matéria', () => {
    expect(textoAvisoCronometro('Banco de Dados', 120)).toEqual({
      titulo: 'Sua sessão passou de 2h',
      corpo: 'Toque para registrar o estudo de Banco de Dados.',
    });
  });
});

describe('dataDoAvisoCronometro', () => {
  it('agenda para o fim do tempo restante', () => {
    expect(dataDoAvisoCronometro(1_000, 60_000)).toEqual(new Date(61_000));
  });

  it('avisa na hora quando o tempo já estourou', () => {
    expect(dataDoAvisoCronometro(1_000, 0)).toBeNull();
    expect(dataDoAvisoCronometro(1_000, -5_000)).toBeNull();
  });
});
