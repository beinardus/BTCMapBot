import { inPolygonFactory } from "../src/polygon.js";

test("inPoligon factory should return a match function", () => {

  // Proeflokaal de Hoppenaar
  const object = {latitude: 51.98182413297442, longitude: 5.909504158099749};

  const polygon = [
    [
      5.860150194487119,
      51.98797219593021
    ],
    [
      5.950735418837837,
      51.9585601645328
    ],
    [
      5.9619948336170125,
      52.01175239229647
    ],
    [
      5.906509336140459,
      52.02286298332484
    ],
    [
      5.860150194487119,
      51.98797219593021
    ]
  ];

  const fn = inPolygonFactory(object);

  expect(fn(polygon)).toBeTruthy();
});