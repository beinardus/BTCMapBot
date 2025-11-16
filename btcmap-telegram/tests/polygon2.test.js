import { createJsonata } from "../src/jsonata.js";
import { inPolygonFactory } from "../src/polygon.js";

describe("Polygon", () => {

  test("Proeflokaal Hoppenaar is in the (approximate) area of Arnhem", async () => {
    const geoHoppenaar = {lat: 51.98182413297442, lon: 5.909504158099749};

    // define the filter with the approximate area of Arnhem
    const filterFn = createJsonata("$inpolygon([[5.860150194487119,51.98797219593021],[5.950735418837837,51.9585601645328],[5.9619948336170125,52.01175239229647],[5.906509336140459,52.02286298332484],[5.860150194487119,51.98797219593021]])", [
      {name: "inpolygon", fn: inPolygonFactory({latitude: geoHoppenaar.lat, longitude: geoHoppenaar.lon}), signature: "<a:b>"} // todo: a<nn>
    ]);        

    // seems redundant, but this is the context of the whole filter
    const actual = await filterFn.evaluate(geoHoppenaar);

    expect(actual).toBeTruthy();
  })
});