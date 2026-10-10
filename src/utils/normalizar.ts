/** Chave da matéria: sem acentos, sem diferenciar maiúsculas e sem espaços nas pontas ou repetidos. */
export function normalizarMateria(nome: string): string {
  return nome
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}
