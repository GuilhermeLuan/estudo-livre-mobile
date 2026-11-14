import { buscarConcursos } from '../concursos';

const resposta = (ok: boolean, corpo: unknown, status = 200) =>
  jest.fn().mockResolvedValue({ ok, status, json: async () => corpo }) as unknown as typeof fetch;

describe('buscarConcursos', () => {
  it('devolve os dados', async () => {
    const dados = await buscarConcursos(resposta(true, { atualizado: 'x', ufs: { pe: 'Pernambuco' }, concursos: [] }));
    expect(dados.ufs.pe).toBe('Pernambuco');
  });
  it('falha com HTTP de erro', async () => {
    await expect(buscarConcursos(resposta(false, {}, 500))).rejects.toThrow('HTTP 500');
  });
  it('falha sem rede', async () => {
    await expect(buscarConcursos(jest.fn().mockRejectedValue(new Error('rede')) as unknown as typeof fetch)).rejects.toThrow('rede');
  });
  it('falha com formato inválido', async () => {
    await expect(buscarConcursos(resposta(true, { atualizado: 'x' }))).rejects.toThrow('Formato');
  });
});
