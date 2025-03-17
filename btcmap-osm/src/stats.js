import { locationStatus } from "btcmap-common";

const createStats = (data) => {
  return data.reduce((a,c) => {
    a[c.transition.type][0]++;
    a[c.transition.reportType][1]++;
    return a;
  }, 
  { 
    [locationStatus.CREATE]: [0,0],
    [locationStatus.DELETE]: [0,0],
    [locationStatus.UPDATE]: [0,0]
  });
}

export { createStats };