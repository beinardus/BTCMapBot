import { deactivateUser, setup, addUser, getActiveUsers, setFilter, setLanguage, dbConnection } from "../src/dbmanager";

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
