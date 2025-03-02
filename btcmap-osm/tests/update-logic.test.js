import {locationStatus, activationStatus } from "btcmap-common";
import { getReportType } from "../src/update-logic.js";

// protection in case of replay
test("create should be set to update if the location already exists", async () => {
  expect(getReportType(locationStatus.CREATE, activationStatus.ACTIVE, {})).toBe(locationStatus.UPDATE);
  expect(getReportType(locationStatus.CREATE, activationStatus.INACTIVE, {})).toBe(locationStatus.UPDATE);
  expect(getReportType(locationStatus.CREATE, activationStatus.UNKNOWN, {})).toBe(locationStatus.CREATE);
});

// protection in case of replay
test("delete should be set to update if the location is already deleted", async () => {
  expect(getReportType(locationStatus.DELETE, activationStatus.UNKNOWN, {})).toBe(locationStatus.DELETE);
  expect(getReportType(locationStatus.DELETE, activationStatus.INACTIVE, {})).toBe(locationStatus.UPDATE);
  expect(getReportType(locationStatus.DELETE, activationStatus.ACTIVE, {})).toBe(locationStatus.DELETE);
});

// implement life cycle: create - delete - create
test("update should be set to create if the location was deleted and the new value is active", async () => {
  expect(getReportType(locationStatus.UPDATE, activationStatus.UNKNOWN, {})).toBe(locationStatus.UPDATE);
  expect(getReportType(locationStatus.UPDATE, activationStatus.INACTIVE, { deleted_at: null })).toBe(locationStatus.CREATE);
  expect(getReportType(locationStatus.UPDATE, activationStatus.INACTIVE, { deleted_at: "2023-07-25T14:40:42.237Z" })).toBe(locationStatus.UPDATE);
  expect(getReportType(locationStatus.UPDATE, activationStatus.ACTIVE, { deleted_at: null })).toBe(locationStatus.UPDATE);
  // todo: report delete in this unexpected state where we missed the actual deletion?
  // reportType is set to UPDATE to ignore this situation
  // perhaps if deleted_at is detected then locationStatus.DELETE should ALWAYS be set
  // deleted_at is whiped when the location is revived
  expect(getReportType(locationStatus.UPDATE, activationStatus.ACTIVE, { deleted_at: "2023-07-25T14:40:42.237Z" })).toBe(locationStatus.UPDATE);
});
