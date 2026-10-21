import type { Etapa, Registro } from '../../types/banco';
import { calcularEstatisticas } from '../estatisticas';
import { normalizarMateria } from '../normalizar';

const AGORA = '2026-01-07';

function registro(
  id: number,
  data: string,
  materia: string,
  minutos: number,
  opcoes: {
    cicloId?: number;
    volta?: number;
    questoes?: number | null;
    acertos?: number | null;
  } = {},
): Registro {
  return {
    id,
    cicloId: opcoes.cicloId ?? 1,
    volta: opcoes.volta ?? 1,
    chaveMateria: materia,
    conteudo: null,
    data,
    minutos,
    tipo: null,
    questoes: opcoes.questoes ?? null,
    acertos: opcoes.acertos ?? null,
    anotacao: null,
    criadoEm: Date.UTC(2026, 0, 7, 12),
  };
}

function etapa(id: number, cicloId: number, materia: string): Etapa {
  return {
    id,
    cicloId,
    posicao: 0,
    materia,
    chaveMateria: normalizarMateria(materia),
    minutos: 60,
  };
}

describe('calcularEstatisticas', () => {
  it('retorna as oito semanas de segunda a domingo, atravessando o ano', () => {
    const resultado = calcularEstatisticas({
      agora: AGORA,
      registros: [
        registro(1, '2025-11-16', 'Direito', 90), // Fora da janela.
        registro(2, '2025-11-17', 'Direito', 60), // Primeira segunda.
        registro(3, '2025-12-28', 'Direito', 120), // Domingo da sexta semana.
        registro(4, '2025-12-29', 'Direito', 180), // Segunda da sétima semana.
        registro(5, '2026-01-04', 'Direito', 60), // Domingo da sétima semana.
        registro(6, '2026-01-05', 'Direito', 300), // Semana atual.
        registro(7, '2026-01-08', 'Direito', 600), // Data futura.
      ],
    });

    expect(resultado.semanas).toHaveLength(8);
    expect(resultado.semanas[0]).toMatchObject({
      inicio: '2025-11-17',
      fim: '2025-11-23',
      minutos: 60,
      horas: 1,
      esta: false,
    });
    expect(resultado.semanas[5].minutos).toBe(120);
    expect(resultado.semanas[6]).toMatchObject({
      inicio: '2025-12-29',
      fim: '2026-01-04',
      minutos: 240,
    });
    expect(resultado.semanas[7]).toMatchObject({
      inicio: '2026-01-05',
      fim: '2026-01-11',
      minutos: 300,
      horas: 5,
      esta: true,
    });
    expect(resultado.semanas.filter((semana) => semana.esta)).toHaveLength(1);
  });

  it('faz a média das sete semanas fechadas com semanas vazias como zero', () => {
    const resultado = calcularEstatisticas({
      agora: AGORA,
      registros: [
        registro(1, '2025-11-17', 'Direito', 60),
        registro(2, '2025-12-28', 'Direito', 120),
        registro(3, '2025-12-29', 'Direito', 180),
        registro(4, '2026-01-04', 'Direito', 60),
        registro(5, '2026-01-05', 'Direito', 600),
      ],
    });

    expect(resultado.semanas.slice(0, 7).map((semana) => semana.minutos)).toEqual([
      60, 0, 0, 0, 0, 120, 240,
    ]);
    expect(resultado.mediaSemanalMinutos).toBe(60);
    expect(resultado.mediaSemanalHoras).toBe(1);
  });

  it('calcula acerto pela soma de acertos sobre a soma de questões', () => {
    const resultado = calcularEstatisticas({
      agora: AGORA,
      registros: [
        registro(1, AGORA, ' DIREITO ', 30, { questoes: 2, acertos: 2 }),
        registro(2, AGORA, 'direito', 45, { questoes: 8, acertos: 4 }),
        registro(3, AGORA, 'Direito', 15),
        registro(4, AGORA, 'Português', 20, { questoes: 0, acertos: 0 }),
      ],
    });

    expect(resultado.materias.find((item) => item.chaveMateria === 'direito'))
      .toMatchObject({
        minutos: 90,
        horas: 1.5,
        questoes: 10,
        acertos: 6,
        taxaAcerto: 0.6,
      });
    expect(resultado.materias.find((item) => item.chaveMateria === 'portugues'))
      .toMatchObject({ questoes: 0, acertos: 0, taxaAcerto: null });
  });

  it('soma todas as voltas e une a mesma matéria em Todos os ciclos', () => {
    const registros = [
      registro(1, AGORA, 'História', 30, { cicloId: 1, volta: 1 }),
      registro(2, AGORA, ' HISTÓRIA ', 45, { cicloId: 1, volta: 2 }),
      registro(3, AGORA, 'historia', 60, { cicloId: 2, volta: 1 }),
      registro(4, AGORA, 'Geografia', 15, { cicloId: 2, volta: 1 }),
    ];
    const etapas = [etapa(2, 2, 'HISTÓRIA'), etapa(1, 1, 'História')];

    const todos = calcularEstatisticas({ agora: AGORA, registros, etapas });
    const ciclo1 = calcularEstatisticas({
      agora: AGORA,
      registros,
      etapas,
      cicloId: 1,
    });

    expect(todos.materias.find((item) => item.chaveMateria === 'historia'))
      .toMatchObject({ materia: 'História', minutos: 135, horas: 2.25 });
    expect(todos.semanas[7].minutos).toBe(150);
    expect(ciclo1.materias).toHaveLength(1);
    expect(ciclo1.materias[0]).toMatchObject({
      chaveMateria: 'historia',
      minutos: 75,
      horas: 1.25,
    });
    expect(ciclo1.semanas[7].minutos).toBe(75);
  });

  it('retorna zero e sem matérias quando não há registros', () => {
    const resultado = calcularEstatisticas({ agora: AGORA, registros: [] });

    expect(resultado.semanas.map((semana) => semana.minutos)).toEqual(
      Array(8).fill(0),
    );
    expect(resultado.mediaSemanalHoras).toBe(0);
    expect(resultado.materias).toEqual([]);
  });

  it('é determinística e preserva a ordem dos dados recebidos', () => {
    const registros = [
      registro(2, AGORA, 'Português', 30),
      registro(1, AGORA, 'Direito', 60),
    ];
    const etapas = [etapa(2, 1, 'Português'), etapa(1, 1, 'Direito')];
    const entrada = { agora: AGORA, registros, etapas };

    const primeiro = calcularEstatisticas(entrada);
    expect(calcularEstatisticas(entrada)).toEqual(primeiro);
    expect(calcularEstatisticas({
      ...entrada,
      registros: [...registros].reverse(),
      etapas: [...etapas].reverse(),
    })).toEqual(primeiro);
    expect(primeiro.calculadoEm).toBe(AGORA);
    expect(registros.map((item) => item.id)).toEqual([2, 1]);
    expect(etapas.map((item) => item.id)).toEqual([2, 1]);
  });

  it('rejeita um agora inválido', () => {
    expect(() => calcularEstatisticas({ agora: '2026-02-30', registros: [] }))
      .toThrow('agora deve estar no formato AAAA-MM-DD');
  });
});
