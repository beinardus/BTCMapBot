import { AsyncDatabase } from "promised-sqlite3";

class Database {
  _db = null;
  _dbPath = null;

  constructor(dbPath) {
    this._dbPath = dbPath;
  }

  async open() {
    this._db = await AsyncDatabase.open(this._dbPath);
  }

  async close() {
    await this._db.close();
  }

  async execute(fn) {
    return await fn(this._db);
  }
}

export {Database}
