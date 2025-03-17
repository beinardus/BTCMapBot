import config from "config";
import { Database } from "./database.js";
import { DbConnection } from "./dbconnection.js";
import { dateUtils, logger, activationStatus } from "btcmap-common";

const dbConfig = config.get("database");
const dbConnection = new DbConnection(new Database(dbConfig.path));

const setup = async() => {
  await dbConnection.execute(async db => {
    await db.run(`
CREATE TABLE IF NOT EXISTS "locations" (
        "id"    INTEGER,
        "lat"   REAL,
        "lon"   REAL,
        "name"  TEXT,
        "addr_city"     TEXT,
        "is_active"     BOOLEAN DEFAULT 1,
        "stamp" TIMESTAMP, [type] TEXT,
        PRIMARY KEY("id")
);`);

    await db.run(`
CREATE TABLE IF NOT EXISTS "users" (
        "id"    INTEGER,
        "name"  TEXT,
        "type"  TEXT,
        "is_active"     BOOLEAN DEFAULT 1,
        "filter"        TEXT,
        "language"      TEXT DEFAULT "en",
        PRIMARY KEY("id")
);`);

    await db.run(`
CREATE TABLE IF NOT EXISTS "stats" (
        "id"    INTEGER,
        "latest_stamp"  TIMESTAMP,
        PRIMARY KEY("id" AUTOINCREMENT)
);`);      
  });
}

const addUser = async(chat) => {
  await dbConnection.execute(async db => {
    await db.run(`
        insert into users (id, name, is_active, type, filter, language)
        values ($id, $name, $is_active, $type, $filter, $language)
        on conflict(id) do update set is_active = $is_active;        
    `, {$id: chat.id, $name: chat.name, $type: chat.type, $filter: "true", $is_active: true, $language: "en"});
  });
};

const deactivateUser = async (id) => {
  await dbConnection.execute(async db => {
    await db.run(`
        update users
        set is_active = false
        where id = $id;
    `, {$id: id});
  });
}

const getUserById = async (id) => {
  return await dbConnection.execute(async db => {
    return await db.get(`
      select id, name, type, filter, language
      from users
      where id = $id;
    `, {$id: id});
  });
}

const getActiveUsers = async () => {
  return await dbConnection.execute(async db => {
    return await db.all(`
      select id, name, type, filter, language
      from users
      where is_active = 1;
    `);
  });
}

const setFilter = async (id, filter) => {
  await dbConnection.execute(async db => {
    await db.run(`
      update users
      set filter = $filter
      where id = $id;
  `, {$id: id, $filter: filter});
  });
}

const setLanguage = async (id, language) => {
  await dbConnection.execute(async db => {
    await db.run(`
      update users
      set language = $language
      where id = $id;
  `, {$id: id, $language: language});
  });
}

const getStats = async () => {
  const row = await dbConnection.execute(async db => {
    return await db.get(`
        select s.latest_stamp
        from stats s
        order by s.id desc
        limit 1        
      `);
  });

  return row;
}

const updateStats = async(latest_stamp) => {
  await dbConnection.execute(async db => {
    await db.run(
      `
      insert into stats (latest_stamp)
      values ($latest_stamp)`,
      {
        $latest_stamp: latest_stamp.toISOString()
      }
    );
  });
}

const getLocation = async(id) => {
  const row = await dbConnection.execute(async db => {
    return await db.get(`
        select l.id, l.lat, l.lon, l.name, l.addr_city, l.is_active, l.stamp
        from locations l
        where l.id = $id
    `, {$id: id});
  });

  return row;
}

const addOrUpdateLocation = async(l) => {
  await dbConnection.execute(async db => {
    await db.run(`
      insert or replace into locations (id, lat, lon, addr_city, name, is_active, stamp, type)
      values ($id, $lat, $lon, $addr_city, $name, $is_active, $stamp, $type);
  `, {$id: l.id, $lat: l.lat, $lon: l.lon, $addr_city: l.city, $name: l.name, $is_active: l.is_active, $stamp: l.stamp, $type: l.type});
  });
}

const getLocationActivationStatus = async (id) => {
  const location = await getLocation(id);
  if (!location)
    return activationStatus.UNKNOWN;

  return location.is_active ? activationStatus.ACTIVE : activationStatus.INACTIVE;
}

const enrichDataWithActivationStatus = async (data) => {
  return await dbConnection.execute(async () => {
    // enrich transition data based on the data stored
    for (const d of data)
      d.transition.prevStatus = await getLocationActivationStatus(d.id);
  });
};

const batchUpdateLocations = async(data) => {
  await dbConnection.execute(async db => {
    try {
      await db.run("begin transaction");

      for (const d of data) {
        logger.silly(JSON.stringify(d));
        await addOrUpdateLocation({
          ...d,
          is_active: !d.deleted_at,
          stamp: d.transition.stamp.toISOString()
        });
      }

      // determine the starting time of the next synchronization
      const latest_stamp = dateUtils.maxDate(data.map(d => d.transition.stamp));
      if (latest_stamp)
        await updateStats(latest_stamp);

      await db.run("commit transaction");
    }
    catch(err) {
      await db.run("rollback transaction")
      throw(err);
    }
  });  
}

export { setup, addUser, getActiveUsers, getUserById, setFilter, setLanguage, deactivateUser, getStats, batchUpdateLocations, enrichDataWithActivationStatus, addOrUpdateLocation, dbConnection }