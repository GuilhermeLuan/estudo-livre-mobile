import { useFocusEffect } from 'expo-router';
import { useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';
import { useCallback, useState } from 'react';

import { listarCiclos, listarEtapas, listarRegistrosDoCiclo } from '@/services/database';
import { useToast } from '@/store/toast';
import type { Ciclo } from '@/types/banco';
import { calcularProgressoVolta, type ProgressoVolta } from '@/utils/progresso';

export type CicloComProgresso = { ciclo: Ciclo; progresso: ProgressoVolta };

export type DadosHoje = {
  cicloAtivo: CicloComProgresso | null;
  outrosCiclos: CicloComProgresso[];
  hoje: Date;
};

async function carregarDados(db: SQLiteDatabase): Promise<DadosHoje> {
  const hoje = new Date();
  const ciclos = await listarCiclos(db);
  const comProgresso = await Promise.all(
    ciclos.map(async (ciclo): Promise<CicloComProgresso> => {
      const [etapas, registros] = await Promise.all([
        listarEtapas(db, ciclo.id),
        listarRegistrosDoCiclo(db, ciclo.id, ciclo.voltaAtual),
      ]);
      const progresso = calcularProgressoVolta({
        cicloId: ciclo.id,
        volta: ciclo.voltaAtual,
        etapas,
        registros,
        agora: hoje.getTime(),
      });
      return { ciclo, progresso };
    }),
  );
  return {
    cicloAtivo: comProgresso.find((c) => c.ciclo.ativo) ?? null,
    outrosCiclos: comProgresso.filter((c) => !c.ciclo.ativo),
    hoje,
  };
}

/** Dados da aba Hoje, recarregados toda vez que a aba volta ao foco (após um registro ou uma edição de etapa). */
export function useDadosHoje(): DadosHoje | null {
  const db = useSQLiteContext();
  const mostrarToast = useToast((s) => s.mostrar);
  const [dados, setDados] = useState<DadosHoje | null>(null);

  useFocusEffect(
    useCallback(() => {
      let montado = true;
      carregarDados(db)
        .then((novos) => {
          if (montado) setDados(novos);
        })
        .catch(() => {
          if (montado) mostrarToast('Não foi possível carregar o ciclo');
        });
      return () => {
        montado = false;
      };
    }, [db, mostrarToast]),
  );

  return dados;
}
