import type { SQLiteDatabase } from 'expo-sqlite';

import type { TipoEstudo } from '@/types/banco';
import { formatarDataISO } from '@/utils/data';
import { normalizarMateria } from '@/utils/normalizar';
import { criarCiclo } from './ciclos';
import { criarEtapa } from './etapas';
import { criarRegistro } from './registros';

const TIPOS: TipoEstudo[] = ['teoria', 'exercicios', 'revisao', 'videoaula', 'leitura_lei'];

const CICLOS: { nome: string; ativo: boolean; progresso: number; etapas: [string, number][] }[] = [
  {
    nome: 'Analista de TI do TRF1',
    ativo: true,
    progresso: 0.55,
    etapas: [['Direito Constitucional', 180], ['Banco de Dados', 240], ['Engenharia de Software', 180], ['Redes de Computadores', 180], ['Português', 120]],
  },
  {
    nome: 'Auditor Fiscal da SEFAZ-SP',
    ativo: false,
    progresso: 0.3,
    etapas: [['Contabilidade Geral', 240], ['Direito Tributário', 180], ['Auditoria', 180], ['Matemática Financeira', 120]],
  },
  {
    nome: 'Perito da Polícia Federal',
    ativo: false,
    progresso: 0.15,
    etapas: [['Sistemas Operacionais', 180], ['Segurança da Informação', 240], ['Redes de Computadores', 180]],
  },
];

/** Apaga todos os ciclos (etapas, registros e cronômetro saem em cascata) e carrega o exemplo. O chamador confirma antes. */
export async function carregarDadosDeExemplo(db: SQLiteDatabase): Promise<void> {
  await db.runAsync('DELETE FROM ciclos');

  // Sem transação própria: criarCiclo já abre uma e o SQLite não aninha.
  {
    for (const [c, ciclo] of CICLOS.entries()) {
      const cicloId = await criarCiclo(db, ciclo.nome, ciclo.ativo);
      for (const [materia, minutos] of ciclo.etapas) await criarEtapa(db, cicloId, materia, minutos);

      // Uso real: só parte da volta 1 estudada, em ordem, espalhada por ~5 semanas (a cada 3 ou 4 dias).
      const restante = ciclo.etapas.map(([, minutos]) => minutos);
      let orcamento = Math.round((restante.reduce((a, b) => a + b, 0) * ciclo.progresso) / 5) * 5;
      const dias = Array.from({ length: 36 }, (_, k) => 35 - k).filter((d) => (d + c) % (c === 0 ? 3 : 4) === 0);
      const porSessao = Math.max(20, Math.round(orcamento / dias.length / 5) * 5);
      let i = 0;
      for (const [n, dia] of dias.entries()) {
        let minutos = Math.min(porSessao, orcamento);
        while (i < restante.length && restante[i] === 0) i++;
        if (minutos <= 0 || i >= restante.length) break;
        minutos = Math.min(minutos, restante[i]);
        restante[i] -= minutos;
        orcamento -= minutos;
        const data = new Date();
        data.setDate(data.getDate() - dia);
        const exercicios = (n + c) % 3 === 0;
        const questoes = exercicios ? 10 + (n % 4) * 5 : null;
        await criarRegistro(db, {
          cicloId,
          volta: 1,
          chaveMateria: normalizarMateria(ciclo.etapas[i][0]),
          conteudo: null,
          data: formatarDataISO(data),
          minutos,
          tipo: exercicios ? 'exercicios' : TIPOS[(n + c) % TIPOS.length],
          questoes,
          acertos: questoes === null ? null : Math.round(questoes * (0.6 + ((n % 4) * 0.08))),
          anotacao: null,
        });
      }
    }
  }
}
