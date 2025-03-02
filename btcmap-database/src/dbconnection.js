class DbConnection {
  _db = null;
  _openCount = 0;

  constructor(db) {
    this._db = db;
  }    

  async execute (fn) {
    if (this._openCount == 0) 
      await this._db.open();
        
    this._openCount++;
    try {
      return await this._db.execute(fn);
    }
    finally {
      this._openCount--;
      if (this._openCount == 0) 
        this._db.close();
          
    }
  }
}

export {DbConnection};

