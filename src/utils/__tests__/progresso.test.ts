import type { Etapa, Registro } from '../../types/banco';
import { normalizarMateria } from '../normalizar';
import { calcularProgressoVolta } from '../progresso';

const AGORA = Date.UTC(2026, 9, 10, 12);

function etapa(
  id: number,
  posicao: number,
  materia: string,
  minutos: number,
  cicloId = 1,
): Etapa {
  return {
    id,
    cicloId,
    posicao,
    materia,
    chaveMateria: normalizarMateria(materia),
    minutos,
  };
}

function registro(
  id: number,
  materia: string,
  minutos: number,
  cicloId = 1,
  volta = 1,
): Registro {
  return {
    id,
    cicloId,
    volta,
    chaveMateria: normalizarMateria(materia),
    conteudo: null,
    data: '2026-10-09',
    minutos,
    tipo: null,
    questoes: null,
    acertos: null,
    anotacao: null,
    criadoEm: AGORA,
  };
}

describe('normalizarMateria', () => {
  it('ignora maiúsculas, acentos e espaços nas pontas ou repetidos', () => {
    expect(normalizarMateria('  LÍNGUA   PORTUGUESA  ')).toBe(
      'lingua portuguesa',
    );
  });
});

describe('calcularProgressoVolta', () => {
  it('enche etapas repetidas da mesma matéria na ordem', () => {
    const resultado = calcularProgressoVolta({
      cicloId: 1,
      volta: 1,
      agora: AGORA,
      etapas: [
        etapa(1, 0, 'Direito', 60),
        etapa(2, 1, 'Português', 30),
        etapa(3, 2, 'Direito', 90),
      ],
      registros: [registro(1, 'Direito', 120)],
    });

    expect(resultado.etapas.map((item) => item.minutosFeitos)).toEqual([
      60,
      0,
      60,
    ]);
    expect(resultado.etapasConcluidas).toBe(1);
    expect(resultado.minutosFaltantes).toBe(60);
  });

  it('atribui a sobra à última etapa da matéria sem abater outra matéria', () => {
    const resultado = calcularProgressoVolta({
      cicloId: 1,
      volta: 1,
      agora: AGORA,
      etapas: [
        etapa(1, 0, 'Direito', 60),
        etapa(2, 1, 'Português', 30),
        etapa(3, 2, 'Direito', 90),
      ],
      registros: [registro(1, 'Direito', 200)],
    });

    expect(resultado.etapas.map((item) => item.minutosExtras)).toEqual([
      0,
      0,
      50,
    ]);
    expect(resultado.materias.find((item) => item.chaveMateria === 'direito'))
      .toMatchObject({
        minutosFeitos: 200,
        minutosPlanejados: 150,
        minutosExtras: 50,
      });
    expect(resultado.minutosExtras).toBe(50);
    expect(resultado.minutosFaltantes).toBe(30);
    expect(resultado.voltaFechada).toBe(false);
  });

  it('sugere a primeira etapa incompleta mesmo com estudo fora de ordem', () => {
    const resultado = calcularProgressoVolta({
      cicloId: 1,
      volta: 1,
      agora: AGORA,
      etapas: [
        etapa(2, 1, 'Português', 30),
        etapa(1, 0, 'Direito', 60),
        etapa(3, 2, 'Informática', 45),
      ],
      registros: [
        registro(1, 'Português', 30),
        registro(2, 'Informática', 45),
      ],
    });

    expect(resultado.etapas.map((item) => item.id)).toEqual([1, 2, 3]);
    expect(resultado.proximaEtapa?.id).toBe(1);
    expect(resultado.etapasConcluidas).toBe(2);
  });

  it('fecha a volta quando todas as etapas estão completas', () => {
    const resultado = calcularProgressoVolta({
      cicloId: 1,
      volta: 1,
      agora: AGORA,
      etapas: [etapa(1, 0, 'Direito', 60), etapa(2, 1, 'Português', 30)],
      registros: [registro(1, 'Direito', 60), registro(2, 'Português', 30)],
    });

    expect(resultado.voltaFechada).toBe(true);
    expect(resultado.proximaEtapa).toBeNull();
    expect(resultado.etapasConcluidas).toBe(2);
    expect(resultado.minutosFaltantes).toBe(0);
  });

  it('recalcula a volta quando a carga de uma etapa muda', () => {
    const registros = [registro(1, 'Direito', 60)];
    const base = { cicloId: 1, volta: 1, agora: AGORA, registros };

    const antes = calcularProgressoVolta({
      ...base,
      etapas: [etapa(1, 0, 'Direito', 60)],
    });
    const depois = calcularProgressoVolta({
      ...base,
      etapas: [etapa(1, 0, 'Direito', 90)],
    });

    expect(antes.voltaFechada).toBe(true);
    expect(depois.voltaFechada).toBe(false);
    expect(depois.minutosFaltantes).toBe(30);
  });

  it('usa somente etapas do ciclo e registros da volta informada', () => {
    const resultado = calcularProgressoVolta({
      cicloId: 1,
      volta: 2,
      agora: AGORA,
      etapas: [etapa(1, 0, 'Direito', 60), etapa(2, 1, 'Direito', 90, 2)],
      registros: [
        registro(1, 'Direito', 20, 1, 1),
        registro(2, 'Direito', 30, 1, 2),
        registro(3, 'Direito', 40, 2, 2),
      ],
    });

    expect(resultado.etapas).toHaveLength(1);
    expect(resultado.etapas[0].minutosFeitos).toBe(30);
    expect(resultado.minutosRegistrados).toBe(30);
  });

  it('não considera um ciclo sem etapas como volta fechada', () => {
    const resultado = calcularProgressoVolta({
      cicloId: 1,
      volta: 1,
      agora: AGORA,
      etapas: [],
      registros: [],
    });

    expect(resultado.voltaFechada).toBe(false);
    expect(resultado.proximaEtapa).toBeNull();
  });

  it('é determinística e não altera os dados recebidos', () => {
    const etapas = [etapa(2, 1, 'Português', 30), etapa(1, 0, 'Direito', 60)];
    const registros = [registro(1, 'Direito', 15)];
    const entrada = { cicloId: 1, volta: 1, agora: AGORA, etapas, registros };

    expect(calcularProgressoVolta(entrada)).toEqual(calcularProgressoVolta(entrada));
    expect(calcularProgressoVolta(entrada).calculadoEm).toBe(AGORA);
    expect(etapas.map((item) => item.id)).toEqual([2, 1]);
    expect(registros).toHaveLength(1);
  });
});