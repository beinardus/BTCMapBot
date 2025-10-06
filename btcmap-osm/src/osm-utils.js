const latLonFromBounds = (bounds) => {
  if (bounds)
    return {
      lat: (bounds.minlat + bounds.maxlat) / 2,
      lon: (bounds.minlon + bounds.maxlon) / 2
    };
        
  return {
    lat: null,
    lon: null
  };
};

const latLonFromOSM = (l) => {
  switch (l.type) {
    case "node":
      return {lat: l.lat, lon: l.lon};
    default:
      return latLonFromBounds(l.bounds);
  };
}

const typeAndIdFromOSM = (osmId) => {
  const [type, id] = osmId.split(":");
  return {type, id};
};

export {latLonFromOSM, typeAndIdFromOSM};