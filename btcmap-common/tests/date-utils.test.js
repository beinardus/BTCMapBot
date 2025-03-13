import { maxDate, sortOnStamp } from "../src/date-utils.js"

const dates = [
  null,
  new Date("2025-01-09T07:11:46.423Z"),
  new Date("2025-01-09T09:51:40.838Z"),
  null,
  new Date("2025-01-09T04:01:18.982Z"),
]

test("sortOnStamp should bring the most recent date to front and nulls to the back", () => {
  const objectsWithDate = dates.map((d,i) => ({ o: i, d:d }));
  sortOnStamp(objectsWithDate, "d");

  const expected = [
    { o: 2, d: new Date("2025-01-09T09:51:40.838Z")},
    { o: 1, d: new Date("2025-01-09T07:11:46.423Z")},
    { o: 4, d: new Date("2025-01-09T04:01:18.982Z")},
    { o: 3, d: null },
    { o: 0, d: null },
  ]

  // note: the order among null values is not determined. They should be at the end.
  expect(objectsWithDate.slice(0,3)).toEqual(expected.slice(0,3));
  expect(objectsWithDate.sort((a,b) => a.o - b.o)).toEqual(expected.sort((a,b) => a.o - b.o));    
});

test("maxDate should pick the most recent date", () => {
  const expected = new Date("2025-01-09T09:51:40.838Z");
  const max = maxDate(dates);
  expect(max).toEqual(expected);
});

test("maxDate on an empty array should return null", () => {
  const max = maxDate([]);
  expect(max).toBeNull();
});