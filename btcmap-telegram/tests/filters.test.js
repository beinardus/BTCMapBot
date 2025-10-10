import { createJsonata } from "../src/jsonata.js";
import { JsonataError } from "../src/error-dispatcher.js";
import { distanceFactory } from "../src/distance.js";

describe("Location filter expression tests", () => {

  const geo = {
    "country_code":"nl","state":"Gelderland","district":"Matenhoeve","city":"Apeldoorn"
  };

  async function evaluate(geo, filter) {
    const filterFn = createJsonata(filter, [
      {name: "testfn", fn: (a,b) => a * b, signature: "<nn:n>"}
    ]);        
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

  test("An binding should be known and usable within the expression, matching", async () => {
    const actual = await evaluate(geo, "$testfn(3,7) = 21");
    expect(actual).toBeTruthy();
  })

  test("An binding should be known and usable within the expression, not matching", async () => {
    const actual = await evaluate(geo, "$testfn(3,7) = 22");
    expect(actual).toBeFalsy();
  })

  test("An binding should be known when the signature of the function is incorrect at compile time", async () => {
    await expect(evaluate(geo, "$testfn(3) = 21")).rejects.toThrow(JsonataError);
  })

  test("Comparing a variable to an array is confusing and therefore forbidden", async () => {
    await expect(evaluate(geo, "country_code = ['de', 'be']")).rejects.toThrow(JsonataError);
  })

  test("Using unicode quotes like string constants is not valid", async () => {
    await expect(evaluate(geo, "country_code in ['ca', ‘hk’]")).rejects.toThrow(JsonataError);
  })

  test("Using unicode quotes inside a string is valid", async () => {
    const actual = await evaluate(geo, "country_code in ['ca', '‘hk’']");
    expect(actual).toBeFalsy();
  })

  const validSearchCriteria = ["country_code", "country", "state", "county", "municipality", "city", "town", "village"];
  const geo2 = validSearchCriteria.reduce((a,c) => {
    a[c] = c;
    return a;
  }, {});

  test.each(validSearchCriteria)("%s is tested against the set value", async (filter) => {
    const actual = await evaluate(geo2, `${filter} = "${filter}"`);
    expect(actual).toBeTruthy();
  });  

  test.each(validSearchCriteria)("%s is tested against a different value", async (filter) => {
    const actual = await evaluate(geo2, `${filter} = "${filter}!"`);
    expect(actual).toBeFalsy();
  });  

  test("Unknown search criteria are not allowed to be used", async () => {
    await expect(evaluate(geo, "country_singer in ['Johnny Cash', 'Willie Nelson']")).rejects.toThrow(JsonataError);
  })

  test("Proeflokaal Hoppenaar is about 719 meter away from the train station", async () => {

    const filterFn = createJsonata("$distance(51.98507204900486, 5.900446984603575) < 720", [
      {name: "distance", fn: distanceFactory({latitude: 51.98182413297442, longitude: 5.909504158099749}), signature: "<nn:n>"}
    ]);        

    const geo = {lat: 51.98182413297442, lon: 5.909504158099749};
    const actual = await filterFn.evaluate(geo);

    expect(actual).toBeTruthy();
  })

  const locations = [
    {
      name: "Germany",
      geo: {"country_code":"de","country":"Deutschland","state":"Schleswig-Holstein","county":"Kreis Dithmarschen","municipality":"Büsum-Wesselburen","town":"Büsum"},
      expected: false
    },
    {
      name: "Denmark",
      geo: {"country_code":"dk","country":"Danmark","state":"Region Sjælland","municipality":"Lolland Kommune","village":"Bandholm"},
      expected: true
    },
    {
      name: "Brasil",
      geo: {"country_code":"br","country":"Brasil","state":"São Paulo","county":"Região Metropolitana de São Paulo","municipality":"Região Imediata de São Paulo","city":"São Paulo"},
      expected: true
    }
  ]

  test.each(locations)("Complex filter test $name", async ({name, geo, expected}) => {
    const filter = "(country_code = 'br' and state in ['Sao Paulo', 'São Paulo', 'SP'] and city in ['Sao Paulo', 'São Paulo', 'SP']) or (country_code = 'dk')";

    const actual = await evaluate(geo, filter);
    expect(actual).toBe(expected);    
  })
});