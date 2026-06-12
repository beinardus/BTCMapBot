import express from "express";
import Database from "better-sqlite3";
import { Feed } from "feed";
import crypto from "crypto";

const app = express();
const db = new Database("./database.db", { readonly: true });

const FEED_URL = "https://dutchbtc.ddns.net/btcmap/deletions-europe.xml";
const SITE_URL = "https://dutchbtc.ddns.net";

// Helper: stable GUID per delete event
function makeGuid(osmUrl, stamp) {
  return crypto
    .createHash("sha256")
    .update(`${osmUrl}|${stamp}`)
    .digest("hex");
}

app.get("/deletions-europe.xml", (req, res) => {
  const stmt = db.prepare(`
    SELECT
      la.action,
      la.stamp,
      l.id,
      l.type,
      l.geo_country_code,
      l.name,
      l.addr_city
    FROM location_actions la
    JOIN locations l ON la.location_id = l.id
    WHERE
      l.geo_country_code IN (
        'be','bg','dk','de','fi','fr','gr','hu','is','ie','it','hr','mt','nl',
        'no','at','pl','pt','ro','sm','rs','si','sk','es','cz','gb','se','ch'
      )
      AND la.action = 'delete'
      AND la.stamp >= datetime('now', '-3 months')
      AND NOT EXISTS (
        SELECT 1
        FROM location_actions la2
        WHERE la2.location_id = l.id
          AND la2.stamp > la.stamp
          AND la2.action = 'create'
      )
    ORDER BY la.stamp DESC
    LIMIT 500
  `);

  const rows = stmt.all();

  const feed = new Feed({
    title: "OpenStreetMap Location Deletions",
    description: "Deleted OpenStreetMap locations in Europe (last 3 months)",
    id: SITE_URL,
    link: SITE_URL,
    language: "en",
    updated: rows.length ? new Date(rows[0].stamp) : new Date(),
    generator: "Node.js + Express + feed",
    feedLinks: {
      rss2: FEED_URL
    }
  });

  let latestStamp = null;

  for (const row of rows) {
    const osmUrl = `https://www.openstreetmap.org/${row.type}/${row.id}`;
    const guid = makeGuid(osmUrl, row.stamp);

    const title = `Deleted: ${row.name} [${row.geo_country_code.toUpperCase()}]`;

    const description = `
      <p><strong>Location:</strong> ${row.name ?? "(unnamed)"}</p>
      <p><strong>City:</strong> ${row.addr_city ?? "n/a"}</p>
      <p><strong>Country:</strong> ${row.geo_country_code.toUpperCase()}</p>
      <p><strong>Deleted at:</strong> ${row.stamp} (UTC)</p>
      <p><a href="${osmUrl}">View on OpenStreetMap</a></p>
    `;

    feed.addItem({
      title,
      category: [
        { name: "action:delete" },
        { name: `country:${row.geo_country_code.toUpperCase()}` }],
      id: guid,
      link: osmUrl,
      description,
      date: new Date(row.stamp)
    });

    if (!latestStamp || row.stamp > latestStamp) 
      latestStamp = row.stamp;
    
  }

  // --- HTTP caching (critical for RSS polling) ---

  if (latestStamp) 
    res.setHeader("Last-Modified", new Date(latestStamp).toUTCString());
  

  const etagSource = latestStamp
    ? `${rows.length}:${latestStamp}`
    : "empty";

  const etag = crypto
    .createHash("sha1")
    .update(etagSource)
    .digest("hex");

  res.setHeader("ETag", `"${etag}"`);

  if (
    req.headers["if-none-match"] === `"${etag}"`
    || (req.headers["if-modified-since"]
     && latestStamp
     && new Date(req.headers["if-modified-since"]) >= new Date(latestStamp))
  ) {
    res.status(304).end();
    return;
  }

  res
    .type("application/rss+xml; charset=utf-8")
    .send(feed.rss2({ indent: true }));
});

app.listen(3000, () => {
  console.log("RSS feed running at http://localhost:3000/deletions-europe.xml");
});