import type { ProgressoEtapa } from '../progresso';
import {
  calcularArcosDisco,
  caminhoArco,
  estadoDaMateria,
  formatarDataExtensa,
  formatarHoras,
  iniciaisDoCiclo,
  pluralizar,
  porcentagemDaVolta,
} from '../hoje';

const etapa = (id: number, minutos: number, minutosFeitos: number): ProgressoEtapa => ({
  id,
  cicloId: 1,
  posicao: id,
  materia: `M${id}`,
  chaveMateria: `m${id}`,
  minutos,
  minutosFeitos,
  minutosFaltantes: minutos - minutosFeitos,
  minutosExtras: 0,
  concluida: minutosFeitos === minutos,
});

describe('formatarDataExtensa', () => {
  it('escreve dia da semana, dia e mês por extenso', () => {
    expect(formatarDataExtensa(new Date(2026, 9, 1))).toBe('Quinta-feira, 1 de outubro');
  });
});

describe('formatarHoras', () => {
  it('formata zero, minutos, horas cheias e mistas', () => {
    expect(formatarHoras(0)).toBe('0h');
    expect(formatarHoras(25)).toBe('25min');
    expect(formatarHoras(120)).toBe('2h');
    expect(formatarHoras(70)).toBe('1h10');
  });
});

describe('iniciaisDoCiclo', () => {
  it('usa as duas primeiras letras', () => {
    expect(iniciaisDoCiclo('Perito da Polícia Federal')).toBe('PE');
    expect(iniciaisDoCiclo(' a')).toBe('A');
  });
});

describe('porcentagemDaVolta', () => {
  it('arredonda a parte cumprida e trata ciclo sem etapas', () => {
    expect(porcentagemDaVolta({ minutosPlanejados: 200, minutosFaltantes: 182 })).toBe(9);
    expect(porcentagemDaVolta({ minutosPlanejados: 0, minutosFaltantes: 0 })).toBe(0);
  });
});

describe('calcularArcosDisco', () => {
  it('divide o círculo pela carga, com folga entre arcos', () => {
    const arcos = calcularArcosDisco([etapa(1, 60, 60), etapa(2, 180, 90)], 2);
    expect(arcos).toHaveLength(2);
    expect(arcos[0].inicio).toBe(0);
    expect(arcos[1].fim).toBeCloseTo(360 - 2.3, 5);
    const util = 360 - 2 * 2.3;
    expect(arcos[0].fim - arcos[0].inicio).toBeCloseTo(util / 4, 5);
    expect(arcos[1].fim - arcos[1].inicio).toBeCloseTo((util * 3) / 4, 5);
  });

  it('preenche conforme o progresso e marca só a próxima etapa', () => {
    const [a, b] = calcularArcosDisco([etapa(1, 60, 60), etapa(2, 180, 90)], 2);
    expect(a.fimProgresso).toBe(a.fim);
    expect(b.fimProgresso).toBeCloseTo((b.inicio + b.fim) / 2, 5);
    expect([a.proxima, b.proxima]).toEqual([false, true]);
  });

  it('sem carga não há arcos', () => {
    expect(calcularArcosDisco([], null)).toEqual([]);
  });
});

describe('estadoDaMateria', () => {
  const materia = (chaveMateria: string, minutosFeitos: number) => ({ chaveMateria, minutosFeitos, minutosPlanejados: 60 });

  it('concluída quando as horas cobrem a carga, mesmo sendo a próxima', () => {
    expect(estadoDaMateria(materia('direito', 60), { chaveMateria: 'direito' })).toBe('concluida');
  });

  it('próxima compara a chave normalizada, ignorando acento e caixa', () => {
    expect(estadoDaMateria(materia('portugues', 10), { chaveMateria: 'Português ' })).toBe('proxima');
  });

  it('padrão nas demais', () => {
    expect(estadoDaMateria(materia('direito', 10), { chaveMateria: 'portugues' })).toBe('padrao');
    expect(estadoDaMateria(materia('direito', 10), null)).toBe('padrao');
  });
});

describe('pluralizar', () => {
  it('usa o singular só para 1', () => {
    expect(pluralizar(1, 'etapa', 'etapas')).toBe('1 etapa');
    expect(pluralizar(0, 'etapa', 'etapas')).toBe('0 etapas');
  });
});

describe('caminhoArco', () => {
  it('começa no topo e marca arco grande acima de 180 graus', () => {
    expect(caminhoArco(100, 50, 0, 90)).toBe('M100 50A50 50 0 0 1 150 100');
    expect(caminhoArco(100, 50, 0, 270)).toContain('0 1 1');
  });
});

it('etapa sem minutos não gera NaN no disco', () => {
  const [arco] = calcularArcosDisco([etapa(1, 0, 0), etapa(2, 60, 0)], null);
  expect(Number.isNaN(arco.fimProgresso)).toBe(false);
});
