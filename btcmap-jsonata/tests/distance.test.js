import { distanceFactory } from "../src/distance.js";

test("distance factory should return a distance function", () => {

  const center = {latitude: 51.98507204900486, longitude: 5.900446984603575};
  const object = {latitude: 51.98182413297442, longitude: 5.909504158099749};

  const fn = distanceFactory(center);

  expect(fn(object.latitude, object.longitude)).toBeCloseTo(719);
});