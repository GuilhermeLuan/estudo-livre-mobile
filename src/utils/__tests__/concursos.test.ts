import type { Concurso } from '../../types/concursos';
import { diasRestantes, filtrarConcursos } from '../concursos';

const c = (p: Partial<Concurso>): Concurso => ({ orgao: 'o', titulo: 't', link: 'l', status: 'aberto', ufs: ['pe'], ...p });

describe('diasRestantes', () => {
  it('conta dias civis', () => {
    expect(diasRestantes('2026-11-23', '2026-11-14')).toBe(9);
    expect(diasRestantes('2026-11-14', '2026-11-14')).toBe(0);
    expect(diasRestantes('2026-03-01', '2026-02-28')).toBe(1);
  });
});

describe('filtrarConcursos', () => {
  const lista = [
    c({ titulo: 'prev antigo', status: 'previsto', publicado: '2026-01-01' }),
    c({ titulo: 'longe', inscricao_fim: '2026-12-01' }),
    c({ titulo: 'perto', inscricao_fim: '2026-11-15' }),
    c({ titulo: 'encerrado', inscricao_fim: '2026-11-01' }),
    c({ titulo: 'suspenso', status: 'suspenso' }),
    c({ titulo: 'prev novo', status: 'previsto', publicado: '2026-11-06' }),
    c({ titulo: 'nacional', nacional: true, ufs: ['br'], inscricao_fim: '2026-11-20' }),
    c({ titulo: 'sp', ufs: ['sp'], inscricao_fim: '2026-11-16' }),
  ];
  const titulos = (r: Concurso[]) => r.map((x) => x.titulo);

  it('todos: abertos por prazo, depois previstos do mais recente', () => {
    expect(titulos(filtrarConcursos(lista, 'todos', null, '2026-11-14'))).toEqual([
      'perto', 'sp', 'nacional', 'longe', 'prev novo', 'prev antigo',
    ]);
  });
  it('UF inclui nacionais e exclui outras UFs', () => {
    expect(titulos(filtrarConcursos(lista, 'aberto', 'pe', '2026-11-14'))).toEqual(['perto', 'nacional', 'longe']);
  });
});
