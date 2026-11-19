/** Respuesta de los listados paginados: { total, items }. */
export interface Paginado<T> {
  total: number;
  items: T[];
}
