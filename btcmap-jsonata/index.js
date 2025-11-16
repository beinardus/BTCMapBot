import { inPolygonFactory } from "./src/polygon.js";
import { distanceFactory } from "./src/distance.js";
import { createJsonata } from "./src/jsonata.js";
import { JsonataError } from "./src/error-dispatcher.js";

const fn = (filter, geo = {lat:0.0, lon:0.0}) => createJsonata(filter, [
  {name: "distance", fn: distanceFactory({latitude:geo.lat, longitude:geo.lon}), signature: "<nn:n>"},
  {name: "inpolygon", fn: inPolygonFactory({latitude:geo.lat, longitude:geo.lon}), signature: "<a:b>"} // todo: a<nn>
] )

export { fn as createJsonata, JsonataError };
