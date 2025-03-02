import { deactivateUser, setup, addUser, getActiveUsers, dbConnection } from "../src/dbmanager";

test("The (correct) user should be deactivated in the database", async () => {
  await dbConnection.execute(async () => {
    await setup();

    await addUser({id: 1, name: "user 1", type: "type"});
    await addUser({id: 2, name: "user 2", type: "type"});
    await deactivateUser(2);

    const activeUsers = await getActiveUsers();
    expect(activeUsers).toEqual([{"filter": "true", "id": 1, "name": "user 1", "type": "type"}]);
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
      {"filter": "true", "id": 1, "name": "user 1", "type": "type"},
      {"filter": "true", "id": 2, "name": "user 2", "type": "type"},      
    ]);
  });
});
