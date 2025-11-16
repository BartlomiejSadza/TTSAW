declare module 'sql.js' {
  export interface QueryExecResult {
    columns: string[];
    values: (string | number | null | Uint8Array)[][];
  }

  export interface Database {
    run(sql: string, params?: (string | number | null | Uint8Array)[]): Database;
    exec(sql: string, params?: (string | number | null | Uint8Array)[]): QueryExecResult[];
    export(): Uint8Array;
    close(): void;
  }

  export interface SqlJsStatic {
    Database: new (data?: ArrayLike<number>) => Database;
  }

  export default function initSqlJs(): Promise<SqlJsStatic>;
}
