const doisDigitos = (n: number) => String(n).padStart(2, '0');

/** Data local no formato AAAA-MM-DD. */
export function formatarDataISO(d: Date): string {
  return `${d.getFullYear()}-${doisDigitos(d.getMonth() + 1)}-${doisDigitos(d.getDate())}`;
}

/** Data local no formato DD/MM/AAAA. */
export function formatarDataBR(d: Date): string {
  return `${doisDigitos(d.getDate())}/${doisDigitos(d.getMonth() + 1)}/${d.getFullYear()}`;
}
