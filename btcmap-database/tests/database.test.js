import { deactivateUser, setup, addUser, getActiveUsers, setFilter, setLanguage, batchUpdateLocations, dbConnection } from "../src/dbmanager";

test("The (correct) user should be deactivated in the database", async () => {
  await dbConnection.execute(async () => {
    await setup();

    await addUser({id: 1, name: "user 1", type: "type"});
    await addUser({id: 2, name: "user 2", type: "type"});
    await deactivateUser(2);

    const activeUsers = await getActiveUsers();
    expect(activeUsers).toEqual([{"filter": "true", "id": 1, "name": "user 1", "type": "type", "language": "en"}]);
  });
});

test("An inactive user can be revived", async () => {
  await dbConnection.execute(async () => {
    await setup();

    await addUser({id: 1, name: "user 1", type: "type"});
    await addUser({id: 2, name: "user 2", type: "type"});
    await deactivateUser(2);

    await addUser({id: 2, name: "user 2", type: "type"});

    const activeUsers = await getActiveUsers();
    expect(activeUsers).toEqual([
      {"filter": "true", "id": 1, "name": "user 1", "type": "type", "language": "en"},
      {"filter": "true", "id": 2, "name": "user 2", "type": "type", "language": "en"},      
    ]);
  });
});

test("setLanguage should update the correct user", async () => {
  await dbConnection.execute(async () => {
    await setup();

    await addUser({id: 1, name: "user 1", type: "type"});
    await addUser({id: 2, name: "user 2", type: "type"});
    await setLanguage(2, "nl");

    const activeUsers = await getActiveUsers();
    expect(activeUsers).toEqual([
      {"filter": "true", "id": 1, "name": "user 1", "type": "type", "language": "en"},
      {"filter": "true", "id": 2, "name": "user 2", "type": "type", "language": "nl"},      
    ]);
  });
});

test("setFilter should update the correct user", async () => {
  await dbConnection.execute(async () => {
    await setup();

    await addUser({id: 1, name: "user 1", type: "type"});
    await addUser({id: 2, name: "user 2", type: "type"});
    await setFilter(2, "country_code = 'nl'");

    const activeUsers = await getActiveUsers();
    expect(activeUsers).toEqual([
      {"filter": "true", "id": 1, "name": "user 1", "type": "type", "language": "en"},
      {"filter": "country_code = 'nl'", "id": 2, "name": "user 2", "type": "type", "language": "en"},      
    ]);
  });
});

// ---------------------------------------------------------------------------
// batchUpdateLocations – location_actions storage
// Uses the same :memory: DB pattern as the other tests above.
// Base data: node 13925508740, v1 created with currency:XBT=yes, v2 OSM-deleted.
// ---------------------------------------------------------------------------

const deletedPoi = {
  id: 13925508740,
  type: "node",
  lat: 44.0603342,
  lon: 12.5657193,
  name: null,
  city: null,
  deleted_at: "2026-06-10T07:35:10Z",
  transition: {
    stamp: new Date("2026-06-10T07:35:10Z"),
    reportType: "delete",
  },
  history: {
    update: { id: "183908946", user: "user2" },
    create: { id: "183908500", user: "user1" },
    delete: { id: "183908946", user: "user2" },
  },
};

test("batchUpdateLocations stores a DELETE action with the correct fields in location_actions", async () => {
  await dbConnection.execute(async (db) => {
    await setup();
    await batchUpdateLocations([deletedPoi]);

    const row = await db.get(
      `SELECT action, location_id, changeset_id, user, stamp
       FROM location_actions
       WHERE location_id = $id
       ORDER BY id DESC LIMIT 1`,
      { $id: deletedPoi.id }
    );

    expect(row.action).toBe("delete");
    expect(row.location_id).toBe(deletedPoi.id);
    expect(row.changeset_id).toBe(183908946);
    expect(row.user).toBe("user2");
    expect(row.stamp).toBe(deletedPoi.transition.stamp.toISOString());
  });
});

test("batchUpdateLocations stores the serialised POI json in location_actions", async () => {
  await dbConnection.execute(async (db) => {
    await setup();
    await batchUpdateLocations([deletedPoi]);

    const row = await db.get(
      "SELECT json FROM location_actions WHERE location_id = $id ORDER BY id DESC LIMIT 1",
      { $id: deletedPoi.id }
    );

    const stored = JSON.parse(row.json);
    expect(stored.id).toBe(deletedPoi.id);
    expect(stored.deleted_at).toBe(deletedPoi.deleted_at);
  });
});

test("batchUpdateLocations marks the location as inactive when deleted_at is set", async () => {
  await dbConnection.execute(async (db) => {
    await setup();
    await batchUpdateLocations([deletedPoi]);

    const row = await db.get(
      "SELECT is_active FROM locations WHERE id = $id",
      { $id: deletedPoi.id }
    );

    expect(row.is_active).toBeFalsy();
  });
});
