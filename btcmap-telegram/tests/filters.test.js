import { createJsonata } from "../src/jsonata.js";
import { JsonataError } from "../src/error-dispatcher.js";

describe('enrichDataWithTransition tests', () => {

  const geo = {
    "country_code":"nl","state":"Gelderland","district":"Matenhoeve","city":"Apeldoorn"
  };

  async function evaluate(geo, filter) {
    const filterFn = createJsonata(filter);        
    return (await filterFn.evaluate(geo));
  }

  const testCases = [
    {
      filter: "true",
      expected: true
    },
    {
      filter: "country_code = 'de'",
      expected: false
    },
    {
      filter: "country_code = 'nl'",
      expected: true
    },
    {
      filter: "country_code in ['de', 'be']",
      expected: false
    },
    {
      filter: "country_code in ['nl', 'be']",
      expected: true
    },
    {
      filter: "country_code = 'nl' and state = 'Frisia'",
      expected: false
    },
    {
      filter: "country_code = 'nl' and state = 'Gelderland'",
      expected: true
    }
  ];

  test.each(testCases)("$filter", async ({filter, expected}) => {
    const actual = await evaluate(geo, filter);
    expect(actual).toBe(expected);
  });

  test("An invalid expression should throw an JsonataError", async () => {
    await expect(evaluate(geo, "country_code == 'nl'")).rejects.toThrow(JsonataError);
  });
});