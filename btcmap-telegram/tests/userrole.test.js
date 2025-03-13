import {getUserRole, isAdminRole, isMasterRole} from "../src/telegram-utils";
import * as userRoles from "../src/telegram-user-roles";

const MOCK_ROLE = "mock";

jest.mock("got", () => ({
  post: jest.fn(() => Promise.resolve({
    body: {
      result: {status: MOCK_ROLE }
    }
  }))
}));

test("The user of a private channel should be creator", async () => {
  expect(await getUserRole(21,21)).toBe(userRoles.CREATOR);
});

test("The master is registered in the .env file", async () => {
  const envUserId = process.env.BOT_MASTER_ID;
  expect(await getUserRole(envUserId, envUserId)).toBe(userRoles.MASTER);
  
  const notEnvUserId = envUserId + 1;
  expect(await getUserRole(envUserId, notEnvUserId)).toBe(MOCK_ROLE);
});

describe("check user roles", () => {
  const testCases = [
    {
      role: userRoles.ADMINISTRATOR, isMaster: false, isAdmin: true
    },
    {
      role: userRoles.CREATOR, isMaster: false, isAdmin: true
    },
    {
      role: userRoles.KICKED, isMaster: false, isAdmin: false
    },
    {
      role: userRoles.LEFT, isMaster: false, isAdmin: false
    },
    {
      role: userRoles.MASTER, isMaster: true, isAdmin: true
    },
    {
      role: userRoles.MEMBER, isMaster: false, isAdmin: false
    },
    {
      role: userRoles.RESTRICTED, isMaster: false, isAdmin: false
    }
  ];
  
  test.each(testCases)("check $role role", ({
    role,
    isMaster:shouldBeMaster,
    isAdmin:shouldBeAdmin}) => {

    expect(isAdminRole(role)).toBe(shouldBeAdmin);
    expect(isMasterRole(role)).toBe(shouldBeMaster);
  });
});