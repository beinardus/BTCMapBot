jest.mock('../src/message-templates.js', () => {
  return {
    createWelcomeMessage: jest.fn(({name,type,id}) => {
      return `WELCOME: ${name} | ${type} | ${id}`
    }),
    createFarewellMessage: jest.fn(({name,type,id}) => {
      return `FAREWELL: ${name} | ${type} | ${id}`
    })
  };
});

import { constructMessage } from "../src/construct-message.js";

describe('constructMessage tests', () => {

  const testCases = [
    {
      description: "A new location without a name should be presented as 'onbekend'",
      input: {"id":12552999973,"status":"create","geo":{"country_code":"us","state":"Maryland","city":"National Harbor"},"lat":38.7829489,"lon":-77.0154603,"type":"node"},
      expected: "WELCOME: onbekend | node | 12552999973",
    },
    {
      description: "A deleted location without a name should be presented as 'onbekend'",
      input: {"id":12552999973,"status":"delete","geo":{"country_code":"us","state":"Maryland","city":"National Harbor"},"lat":38.7829489,"lon":-77.0154603,"type":"node"},
      expected: "FAREWELL: onbekend | node | 12552999973",
    }];
  
  test.each(testCases)('$description', ({input, expected}) => {
    const actual = constructMessage(input);
    expect(actual).toBe(expected);
  });

});