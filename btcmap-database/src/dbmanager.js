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
        "geo_source" INTEGER DEFAULT 0,
        "geo_language" TEXT,
        "geo_country_code" TEXT,
        "geo_country" TEXT,
        "geo_state" TEXT,
        "geo_county" TEXT,
        "geo_municipality" TEXT,
        "geo_city" TEXT,
        "geo_town" TEXT,
        "geo_village" TEXT,
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
CREATE TABLE IF NOT EXISTS "nominatim_geodata" (
        "id" INTEGER,
        "lat" REAL,
        "lon" REAL,
        "language" TEXT NULL,
        "country_code" TEXT,
        "country" TEXT,
        "state" TEXT,
        "county" TEXT,
        "municipality" TEXT,
        "city" TEXT,
        "town" TEXT,
        "village" TEXT,
        "stamp" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY("id" AUTOINCREMENT)
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
      insert or replace into locations (id, lat, lon, addr_city, name, is_active, stamp, type, geo_source, geo_country_code, geo_country, geo_state, geo_county, geo_municipality, geo_city, geo_town, geo_village)
      values ($id, $lat, $lon, $addr_city, $name, $is_active, $stamp, $type, $geo_source, $geo_country_code, $geo_country, $geo_state, $geo_county, $geo_municipality, $geo_city, $geo_town, $geo_village);
  `, {
      $id: l.id, 
      $lat: l.lat, 
      $lon: l.lon, 
      $addr_city: l.city, 
      $name: l.name, 
      $is_active: l.is_active, 
      $stamp: l.stamp, 
      $type: l.type, 
      $geo_source: l.geo_source, 
      $geo_country_code: l.geo_country_code, 
      $geo_country: l.geo_country, 
      $geo_state: l.geo_state, 
      $geo_county: l.geo_county, 
      $geo_municipality: l.geo_municipality, 
      $geo_city: l.geo_city, 
      $geo_town: l.geo_town, 
      $geo_village: l.geo_village});
  });
}

const addGeodata = async(geodata) => {
  const result = await dbConnection.execute(async db => {
    const res = await db.run(`
      insert into nominatim_geodata (lat, lon, language, country_code, country, state, county, municipality, city, town, village)
      values ($lat, $lon, $language, $country_code, $country, $state, $county, $municipality, $city, $town, $village);  
      `, {$lat: geodata.lat, $lon: geodata.lon, $language: geodata.language, $country_code: geodata.country_code, $country: geodata.country, $state: geodata.state, $county: geodata.county, $municipality: geodata.municipality, $city: geodata.city, $town: geodata.town, $village: geodata.village});
    return res.lastID;
  });
  return result;
}

const enrichDataWithPreviousData = async (data) => {
  return await dbConnection.execute(async () => {
    // enrich transition data based on the data stored
    for (const d of data) {
      const location = await getLocation(d.id);
      if (!location) {
        d.transition.prevStatus = activationStatus.UNKNOWN;
        d.transition.prevGeoSource = 0;
      } 
      else {
        d.transition.prevStatus = location.is_active ? activationStatus.ACTIVE : activationStatus.INACTIVE;
        d.transition.prevGeoSource = location.geo_source;
        d.transition.prevLat = location.lat;
        d.transition.prevLon = location.lon;
      }
    }
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

export { dbConnection, setup, addUser, getActiveUsers, getUserById, setFilter, setLanguage, deactivateUser, getStats, batchUpdateLocations, enrichDataWithPreviousData, addOrUpdateLocation, addGeodata };