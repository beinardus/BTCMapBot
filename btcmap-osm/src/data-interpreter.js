import { dateUtils, locationStatus } from "btcmap-common";
import { getReportType } from "./update-logic.js";

const convertDate = (dateStr) => {
  return dateStr ? new Date(dateStr) : null;
}

const getTypeAndStamp = (c, start) => {
  const props = [
    {
      type: locationStatus.CREATE,
      stamp: convertDate(c.created_at),
      final: true
    },
    {
      type: locationStatus.UPDATE,
      stamp: convertDate(c.updated_at),
      final: false
    },
    {
      type: locationStatus.DELETE,
      stamp: convertDate(c.deleted_at),
      final: true
    }
  ];

  // sort the props on stamp (most recent first)
  dateUtils.sortOnStamp(props, "stamp");

  // assume that at least one date property matches the interval
  const typeAndStamp = {
    type: props[0].type,
    stamp: props[0].stamp,
  }

  // prioritize creation and deletion
  // when both creation and deletion are in the same interval, take the most recent
  const final = props.find((p) => p.stamp && p.stamp >= start && p.final);
  if (final) 
    typeAndStamp.type = final.type;
  

  return typeAndStamp;
}

const enrichDataWithTransition = (data, start) => {
  // enrich the data with type and stamp
  for (const e of data)
    e.transition = getTypeAndStamp(e, start);
}

const enrichDataWithReportType = (data) => {
  for (const d of data)
    d.transition.reportType = getReportType(d.transition.type, d.transition.prevStatus, d);
}

export { enrichDataWithTransition, enrichDataWithReportType }