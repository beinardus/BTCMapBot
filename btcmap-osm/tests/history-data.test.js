import { enrichDataWithHistory } from "../src/history-data.js";
import { locationStatus } from "btcmap-common";

// Mock got so it can be controlled per test - no real HTTP calls are made
jest.mock("got", () => ({
  __esModule: true,
  default: jest.fn(),
}));

import got from "got";

// ---------------------------------------------------------------------------
// Shared XML fixtures (based on OSM history API format)
// ---------------------------------------------------------------------------

// Two versions: v1 visible + currency:XBT=yes, v2 invisible (OSM-deleted)
const XML_CREATED_THEN_DELETED = `<?xml version="1.0" encoding="UTF-8"?>
<osm version="0.6" generator="openstreetmap-cgimap 2.1.0 (1337 spike-08.openstreetmap.org)" copyright="OpenStreetMap and contributors" attribution="http://www.openstreetmap.org/copyright" license="http://opendatacommons.org/licenses/odbl/1-0/">
 <node id="13925508740" visible="true" version="1" changeset="183908500" timestamp="2026-06-10T07:23:49Z" user="user1" uid="1" lat="44.0603342" lon="12.5657193">
  <tag k="currency:XBT" v="yes"/>
 </node>
 <node id="13925508740" visible="false" version="2" changeset="183908946" timestamp="2026-06-10T07:35:10Z" user="user2" uid="2"/>
</osm>`;

// Single version: visible + currency:XBT=yes (node still active)
const XML_ACTIVE_ONLY = `<?xml version="1.0" encoding="UTF-8"?>
<osm version="0.6">
 <node id="13925508740" visible="true" version="1" changeset="183908500" timestamp="2026-06-10T07:23:49Z" user="user1" uid="1" lat="44.0603342" lon="12.5657193">
  <tag k="currency:XBT" v="yes"/>
 </node>
</osm>`;

// Two versions: v1 with currency:XBT=yes, v2 with currency:XBT removed (tag-deleted)
const XML_TAG_DELETED = `<?xml version="1.0" encoding="UTF-8"?>
<osm version="0.6">
 <node id="13925508740" visible="true" version="1" changeset="183908500" timestamp="2026-06-10T07:23:49Z" user="user1" uid="1" lat="44.0603342" lon="12.5657193">
  <tag k="currency:XBT" v="yes"/>
 </node>
 <node id="13925508740" visible="true" version="2" changeset="183908946" timestamp="2026-06-10T07:35:10Z" user="user2" uid="2" lat="44.0603342" lon="12.5657193">
  <tag k="name" v="Some Shop"/>
 </node>
</osm>`;

// Three versions: v1 created, v2 OSM-deleted, v3 re-opened (currency:XBT=yes again)
const XML_REVIVED = `<?xml version="1.0" encoding="UTF-8"?>
<osm version="0.6">
 <node id="13925508740" visible="true" version="1" changeset="100000001" timestamp="2026-01-01T10:00:00Z" user="user1" uid="1" lat="44.0603342" lon="12.5657193">
  <tag k="currency:XBT" v="yes"/>
 </node>
 <node id="13925508740" visible="false" version="2" changeset="100000002" timestamp="2026-03-01T10:00:00Z" user="user2" uid="2"/>
 <node id="13925508740" visible="true" version="3" changeset="100000003" timestamp="2026-06-01T10:00:00Z" user="user3" uid="3" lat="44.0603342" lon="12.5657193">
  <tag k="currency:XBT" v="yes"/>
 </node>
</osm>`;

// ---------------------------------------------------------------------------
// Helper: build a minimal POI data entry
// ---------------------------------------------------------------------------
const makePoi = (id = "13925508740", type = "node") => ({ id, type });

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("enrichDataWithHistory – OSM-deleted node", () => {
  beforeEach(() => {
    got.mockResolvedValue({ body: XML_CREATED_THEN_DELETED });
  });

  test("history.update references the latest version (v2)", async () => {
    const data = [makePoi()];
    await enrichDataWithHistory(data);
    expect(data[0].history[locationStatus.UPDATE]).toEqual({
      id: "183908946",
      user: "user2",
    });
  });

  test("history.create references the last version with currency:XBT=yes (v1)", async () => {
    const data = [makePoi()];
    await enrichDataWithHistory(data);
    expect(data[0].history[locationStatus.CREATE]).toEqual({
      id: "183908500",
      user: "user1",
    });
  });

  test("history.delete references the OSM-deleted version (v2)", async () => {
    const data = [makePoi()];
    await enrichDataWithHistory(data);
    expect(data[0].history[locationStatus.DELETE]).toEqual({
      id: "183908946",
      user: "user2",
    });
  });
});

describe("enrichDataWithHistory – still-active node (single version)", () => {
  beforeEach(() => {
    got.mockResolvedValue({ body: XML_ACTIVE_ONLY });
  });

  test("history.update and history.create both point to v1", async () => {
    const data = [makePoi()];
    await enrichDataWithHistory(data);
    const expected = { id: "183908500", user: "user1" };
    expect(data[0].history[locationStatus.UPDATE]).toEqual(expected);
    expect(data[0].history[locationStatus.CREATE]).toEqual(expected);
  });

  test("history.delete is undefined when node is still active", async () => {
    const data = [makePoi()];
    await enrichDataWithHistory(data);
    expect(data[0].history[locationStatus.DELETE]).toBeUndefined();
  });
});

describe("enrichDataWithHistory – tag-deleted node (currency:XBT removed)", () => {
  beforeEach(() => {
    got.mockResolvedValue({ body: XML_TAG_DELETED });
  });

  test("history.delete references the version where currency:XBT was removed (v2)", async () => {
    const data = [makePoi()];
    await enrichDataWithHistory(data);
    expect(data[0].history[locationStatus.DELETE]).toEqual({
      id: "183908946",
      user: "user2",
    });
  });

  test("history.create references the last version with currency:XBT=yes (v1)", async () => {
    const data = [makePoi()];
    await enrichDataWithHistory(data);
    expect(data[0].history[locationStatus.CREATE]).toEqual({
      id: "183908500",
      user: "user1",
    });
  });

  test("history.update references the latest version (v2)", async () => {
    const data = [makePoi()];
    await enrichDataWithHistory(data);
    expect(data[0].history[locationStatus.UPDATE]).toEqual({
      id: "183908946",
      user: "user2",
    });
  });
});

describe("enrichDataWithHistory – revived node (deleted then re-opened)", () => {
  beforeEach(() => {
    got.mockResolvedValue({ body: XML_REVIVED });
  });

  test("history.update references the latest version (v3)", async () => {
    const data = [makePoi()];
    await enrichDataWithHistory(data);
    expect(data[0].history[locationStatus.UPDATE]).toEqual({
      id: "100000003",
      user: "user3",
    });
  });

  test("history.create references the most recent version with currency:XBT=yes (v3)", async () => {
    const data = [makePoi()];
    await enrichDataWithHistory(data);
    expect(data[0].history[locationStatus.CREATE]).toEqual({
      id: "100000003",
      user: "user3",
    });
  });

  test("history.delete references the last version where the node was deleted (v2)", async () => {
    const data = [makePoi()];
    await enrichDataWithHistory(data);
    expect(data[0].history[locationStatus.DELETE]).toEqual({
      id: "100000002",
      user: "user2",
    });
  });
});

describe("enrichDataWithHistory – multiple POIs in one call", () => {
  test("each POI gets its own history enriched independently", async () => {
    got
      .mockResolvedValueOnce({ body: XML_ACTIVE_ONLY })
      .mockResolvedValueOnce({ body: XML_CREATED_THEN_DELETED });

    const data = [makePoi("111", "node"), makePoi("222", "node")];
    await enrichDataWithHistory(data);

    // First POI – still active
    expect(data[0].history[locationStatus.DELETE]).toBeUndefined();
    expect(data[0].history[locationStatus.CREATE]).toEqual({
      id: "183908500",
      user: "user1",
    });

    // Second POI – OSM-deleted
    expect(data[1].history[locationStatus.DELETE]).toEqual({
      id: "183908946",
      user: "user2",
    });
  });
});

