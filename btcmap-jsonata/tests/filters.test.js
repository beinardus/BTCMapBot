import { createJsonata } from "../src/jsonata.js";
import { JsonataError } from "../../btcmap-telegram/src/error-dispatcher.js";
import { distanceFactory } from "../src/distance.js";
import { inPolygonFactory } from "../src/polygon.js";

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

  const validSearchCriteria = ["lat", "lon", "country_code", "country", "state", "county", "municipality", "city", "town", "village"];
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

  test("Incorrect number of arguments to custom function should throw JsonataError", () => {
    const create = () =>
      createJsonata("$distance()", [
        {
          name: "distance",
          fn: distanceFactory({ latitude: 0, longitude: 0 }),
          signature: "<nn:n>",
        },
      ]);

    expect(create).toThrow(JsonataError);
    expect(create).toThrow("Function \"$distance\" expects 2 arguments.");
  });

  test("Proeflokaal Hoppenaar is about 719 meter away from the train station", async () => {
    const geoHoppenaar = {lat: 51.98182413297442, lon: 5.909504158099749};

    // define the filter with the coordinates of the train station
    const filterFn = createJsonata("$distance(51.98507204900486, 5.900446984603575) < 720", [
      {name: "distance", fn: distanceFactory({latitude: geoHoppenaar.lat, longitude: geoHoppenaar.lon}), signature: "<nn:n>"}
    ]);        

    // seems redundant, but this is the context of the whole filter
    const actual = await filterFn.evaluate(geoHoppenaar);

    expect(actual).toBeTruthy();
  })

  const polygonTestCases = [
    {
      poi: {lat: 51.98182413297442, lon: 5.909504158099749},
      expected: true // Hoppenaar
    },
    {
      poi: {lat: 51.849061436492214, lon: 5.867185814169468},
      expected: false // Chazzz Food Nijmegen
    }
  ];

  test.each(polygonTestCases)("Point $poi lat $poi.lon is in polygon test", async ({poi, expected}) => {
    // define the filter with the approximate area of Arnhem
    const filterFn = createJsonata(`
      $inpolygon([
        [5.86015,51.98797],
        [5.95073,51.95856],
        [5.96199,52.01175],
        [5.90650,52.02286],
        [5.86015,51.98797]])`, [
      {name: "inpolygon", fn: inPolygonFactory({latitude: poi.lat, longitude: poi.lon}), signature: "<a:b>"} // todo: a<nn>
    ]);        

    // seems redundant, but this is the context of the whole filter
    const actual = await filterFn.evaluate(poi);

    expect(actual).toBe(expected);
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

  test.each(locations)("Complex filter test $name", async ({geo, expected}) => {
    const filter = "(country_code = 'br' and state in ['Sao Paulo', 'São Paulo', 'SP'] and city in ['Sao Paulo', 'São Paulo', 'SP']) or (country_code = 'dk')";

    const actual = await evaluate(geo, filter);
    expect(actual).toBe(expected);    
  })
});