import type { Etapa } from '@/types/banco';
import { materiasDoCiclo, proximaEtapa } from '../proximaEtapa';

const etapa = (posicao: number, materia: string, minutos: number): Etapa => ({
  id: posicao + 1,
  cicloId: 1,
  posicao,
  materia,
  chaveMateria: materia.toLowerCase(),
  minutos,
});

const etapas = [etapa(0, 'Português', 60), etapa(1, 'Direito', 120), etapa(2, 'Português', 60)];

describe('proximaEtapa', () => {
  it('sem registros, é a primeira etapa', () => {
    expect(proximaEtapa(etapas, [])?.posicao).toBe(0);
  });

  it('pula etapas cheias', () => {
    expect(proximaEtapa(etapas, [{ chaveMateria: 'português', minutos: 60 }])?.posicao).toBe(1);
  });

  it('estudo fora de ordem não muda a primeira etapa vazia', () => {
    expect(proximaEtapa(etapas, [{ chaveMateria: 'direito', minutos: 120 }])?.posicao).toBe(0);
  });

  it('horas de uma matéria repetida enchem a primeira etapa antes da segunda', () => {
    const registros = [{ chaveMateria: 'português', minutos: 90 }];
    expect(proximaEtapa(etapas, registros)?.posicao).toBe(1);
    expect(proximaEtapa(etapas, [...registros, { chaveMateria: 'direito', minutos: 120 }])?.posicao).toBe(2);
  });

  it('devolve null quando todas estão cheias', () => {
    const registros = [
      { chaveMateria: 'português', minutos: 200 },
      { chaveMateria: 'direito', minutos: 120 },
    ];
    expect(proximaEtapa(etapas, registros)).toBeNull();
  });
});

describe('materiasDoCiclo', () => {
  it('lista cada matéria uma vez, na ordem das etapas', () => {
    expect(materiasDoCiclo(etapas).map((m) => m.nome)).toEqual(['Português', 'Direito']);
  });
});
