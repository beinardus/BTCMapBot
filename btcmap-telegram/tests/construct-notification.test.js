jest.mock("../src/notification-templates.js", () => {
  return {
    createWelcomeNotificationText: jest.fn(({name,type,id}) => {
      return `WELCOME: ${name} | ${type} | ${id}`
    }),
    createFarewellNotificationText: jest.fn(({name,type,id}) => {
      return `FAREWELL: ${name} | ${type} | ${id}`
    })
  };
});

// do not test the actual translation
jest.mock("translation", () => ({
  ...jest.requireActual("translation"),
  t: jest.fn((lan, key) => `t(${lan},${key})`)
}));

import { constructNotificationText } from "../src/construct-notification-text.js";

describe("constructMessage tests", () => {

  const baseData = {
    id:12552999973,
    geo:{country_code:"us",state:"Maryland",city:"National Harbor"},
    lat:38.7829489,
    lon:-77.0154603,
    type:"node",
    user:{language:"en"}
  };

  const testCases = [
    {
      description: "A new location without a name should be presented as 'unknown'",
      input: {...baseData, status:"create"},
      expected: "WELCOME: (t(en,unknown)) | node | 12552999973",
    },
    {
      description: "A deleted location without a name should be presented as 'unknown'",
      input: {...baseData, status:"delete"},
      expected: "FAREWELL: (t(en,unknown)) | node | 12552999973",
    }];
  
  test.each(testCases)("$description", ({input, expected}) => {
    const actual = constructNotificationText(input);
    expect(actual).toBe(expected);
  });

});