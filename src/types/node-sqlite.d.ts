declare module 'node:sqlite' {
  export class DatabaseSync {
    constructor(caminho: string);
    exec(sql: string): void;
    prepare(sql: string): {
      run(...args: never[]): { lastInsertRowid: number | bigint; changes: number | bigint };
      all(...args: never[]): unknown[];
      get(...args: never[]): unknown;
    };
  }
}
