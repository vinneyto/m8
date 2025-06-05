declare module 'bun:sqlite' {
  class Statement<T = any> {
    run(...params: any[]): void;
    get(...params: any[]): T;
    all(...params: any[]): T[];
  }
  export default class Database {
    constructor(filename: string);
    run(sql: string, params?: any[]): void;
    query<T = any>(sql: string): Statement<T>;
  }
}
