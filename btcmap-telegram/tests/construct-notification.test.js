jest.mock("../src/notification-templates.js", () => {
  return {
    createWelcomeNotificationText: jest.fn(({name,type,id}) => {
      return `WELCOME: ${name} | ${type} | ${id}`
    }),
    createFarewellNotificationText: jest.fn(({name,type,id}) => {
      return `FAREWELL: ${name} | ${type} | ${id}`
    }),
    createWelcomeNotificationFloodText: jest.fn(({name,type,id}) => {
      return `WELCOME: ${name} | ${type} | ${id}`
    }),
    createFarewellNotificationFloodText: jest.fn(({name,type,id}) => {
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

import { constructFloodingText } from "../src/construct-flooding-text.js";

describe("constructFloodingText tests", () => {

  const floodingArray = [{
    id: 1,
    name: "n1",
    type: "node",
    status: "create"
  },{
    id: 2,
    name: "n2",
    type: "node",
    status: "delete"
  },{
    id: 3,
    name: "n3",
    type: "node",
    status: "create"
  }];

  test("constructed text should be expected html", () => {
    const expected = "<strong>t(en,also created)</strong>\nWELCOME: n1 | node | 1\nWELCOME: n3 | node | 3\n\n<strong>t(en,also deleted)</strong>\nFAREWELL: n2 | node | 2"
    const actual = constructFloodingText(floodingArray, {language:"en"});
    expect(actual).toBe(expected);
  });
});