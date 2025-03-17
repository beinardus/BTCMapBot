import { enrichDataWithTransition, enrichDataWithReportType } from "../src/data-interpreter.js";
import {locationStatus, activationStatus } from "btcmap-common";

describe("enrichDataWithTransition tests", () => {
  const latestUpdate = new Date("2025-02-02T22:00:00.000Z");
  const testCases = [
    {
      description: "enrichDataWithTransition: create and update in the interval should return CREATE with the latest stamp",
      input: 
        {
          created_at: "2025-02-02T22:01:50.174Z",
          updated_at: "2025-02-02T22:01:50.215Z",
          deleted_at: ""},
      expected: { 
        type: locationStatus.CREATE,
        stamp: new Date("2025-02-02T22:01:50.215Z") },
    },
    {
      description: "enrichDataWithTransition: create before interval should return latest action = UPDATE",
      input: 
        {
          created_at: "2024-02-02T22:01:50.174Z",
          updated_at: "2024-02-02T22:01:50.215Z",
          deleted_at: ""},
      expected: { 
        type: locationStatus.UPDATE,
        stamp: new Date("2024-02-02T22:01:50.215Z") },
    },
    {
      // In practice this would always be DELETE, because CREATE is a once in a lifetime event
      description: "enrichDataWithTransition: create and delete in the interval should return CREATE or DELETE dependent of what comes last",
      input: 
        {
          created_at: "2025-02-02T22:01:50.174Z",
          updated_at: "2025-02-02T22:01:50.215Z",
          deleted_at: "2025-02-03T22:01:50.215Z"},
      expected: { 
        type: locationStatus.DELETE,
        stamp: new Date("2025-02-03T22:01:50.215Z") },
    },
  ];

  test.each(testCases)("$description", ({input, expected}) => {
    // avoid manipulation of the test data
    const data = {...input};
    enrichDataWithTransition([data], latestUpdate);
    expect(data.transition).toEqual(expected);
  });
});

describe("enrichDataWithReportType tests", () => {
  // just testing transition manipulation with some edge cases
  // all state changes are tested in update-logic.test.js
  const testCases = [
    {
      description: "enrichDataWithReportType: CREATE when already activated results in UPDATE",
      input: {
        deleted_at: "",
        transition: { 
          type: locationStatus.CREATE,
          prevStatus: activationStatus.ACTIVE
        },
      },
      reportType: locationStatus.UPDATE      
    },
    {
      description: "enrichDataWithReportType: UPDATE without activation remains UPDATE",
      input: {
        deleted_at: "2023-07-25T14:40:42.237Z",
        transition: { 
          type: locationStatus.UPDATE,
          prevStatus: activationStatus.INACTIVE,
        },
      },
      reportType: locationStatus.UPDATE
    },
    {
      description: "enrichDataWithReportType: UPDATE with activation upgrades to CREATE (revived)",
      input: {
        deleted_at: "",
        transition: { 
          type: locationStatus.UPDATE,
          prevStatus: activationStatus.INACTIVE,
        },
      },
      reportType: locationStatus.CREATE
    },
    {
      description: "enrichDataWithReportType: DELETE when already inactivated results in UPDATE",
      input: {
        transition: { 
          type: locationStatus.DELETE,
          prevStatus: activationStatus.INACTIVE,
        },
      },
      reportType: locationStatus.UPDATE
    },
  ];

  test.each(testCases)("$description", ({input, reportType}) => {
    // avoid manipulation of the test data
    const data = {
      ...input,
      transition: {...input.transition}
    };

    enrichDataWithReportType([data]);

    expect(data.transition).toEqual({...input.transition, reportType});
  });
});