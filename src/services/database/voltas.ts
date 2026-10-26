import type { SQLiteDatabase } from 'expo-sqlite';

import { calcularProgressoVolta } from '@/utils/progresso';
import { buscarCiclo, definirVoltaAtual } from './ciclos';
import { listarEtapas } from './etapas';
import { criarRegistro, listarRegistrosDoCiclo, type NovoRegistro } from './registros';

/**
 * Salva o registro e, se ele enche a última etapa da volta em que foi feito, abre a próxima volta.
 * Horas além da carga ficam como extras da volta que acabou de fechar. Devolve se a volta fechou.
 */
export async function registrarEstudo(db: SQLiteDatabase, registro: NovoRegistro): Promise<boolean> {
  let fechou = false;
  await db.withTransactionAsync(async () => {
    await criarRegistro(db, registro);
    const ciclo = await buscarCiclo(db, registro.cicloId);
    // Registro de volta antiga (ciclo já avançou) não fecha a volta aberta.
    if (!ciclo || ciclo.voltaAtual !== registro.volta) return;
    const [etapas, registros] = await Promise.all([
      listarEtapas(db, ciclo.id),
      listarRegistrosDoCiclo(db, ciclo.id, ciclo.voltaAtual),
    ]);
    const progresso = calcularProgressoVolta({
      cicloId: ciclo.id,
      volta: ciclo.voltaAtual,
      etapas,
      registros,
      agora: Date.now(),
    });
    if (!progresso.voltaFechada) return;
    await definirVoltaAtual(db, ciclo.id, ciclo.voltaAtual + 1);
    fechou = true;
  });
  return fechou;
}

/** A volta atual do ciclo tem algum registro? Só então ela pode ser encerrada à mão. */
export async function voltaAtualTemRegistros(db: SQLiteDatabase, cicloId: number): Promise<boolean> {
  const linha = await db.getFirstAsync<{ n: number }>(
    `SELECT COUNT(*) AS n FROM registros
     WHERE ciclo_id = ? AND volta = (SELECT volta_atual FROM ciclos WHERE id = ?)`,
    cicloId,
    cicloId,
  );
  return (linha?.n ?? 0) > 0;
}

/**
 * Encerra a volta atual como está (os registros dela ficam intactos) e abre a próxima, zerada.
 * Não faz nada e devolve false se a volta atual não tem registro.
 */
export async function iniciarNovaVolta(db: SQLiteDatabase, cicloId: number): Promise<boolean> {
  let iniciou = false;
  await db.withTransactionAsync(async () => {
    const ciclo = await buscarCiclo(db, cicloId);
    if (!ciclo || !(await voltaAtualTemRegistros(db, cicloId))) return;
    await definirVoltaAtual(db, cicloId, ciclo.voltaAtual + 1);
    iniciou = true;
  });
  return iniciou;
}
