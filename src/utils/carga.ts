/** Converte "1,5" ou "1.5" (horas) em minutos inteiros; null se inválido ou não maior que zero. */
export function horasParaMinutos(texto: string): number | null {
  const limpo = texto.trim().replace(',', '.');
  if (!/^(\d+(\.\d+)?|\.\d+)$/.test(limpo)) return null;
  const minutos = Math.round(Number(limpo) * 60);
  return minutos > 0 ? minutos : null;
}

/** Converte minutos em horas para o campo de edição: 90 vira "1,5". */
export function minutosParaHoras(minutos: number): string {
  return String(Math.round((minutos / 60) * 100) / 100).replace('.', ',');
}
