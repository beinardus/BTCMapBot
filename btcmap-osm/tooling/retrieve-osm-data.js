import got from "got";
import {promises as fs} from "fs";

// API URL and Queries
const API_URL = "https://overpass-api.de/api/interpreter";

const QUERY = `
    [out:csv(::type, ::id, ::lat, ::lon, "name","addr:city")][timeout:300];
    nwr["currency:XBT"=yes];
    out;
`;

// Function to query Bitcoin merchants
async function queryBitcoinMerchants() {
  console.log("Querying OSM API, it could take a while...");

  try {
    // Sending the POST request
    const response = await got.post(API_URL, {
      body: QUERY,
      headers: {
        'Content-Type': 'text/plain',
      },
    });

    console.log(`Got OSM API response with HTTP status code: ${response.statusCode}`);
    await fs.writeFile('output_utf8.txt', response.body, { encoding: 'utf8' });
        
  }
  catch (err) {
    console.error("Failed to fetch elements:", err.response ? err.response.body : err.message);
    throw err;
  }
}

async function main() {
  try {
    const data = await queryBitcoinMerchants();
    console.log(data);
  } 
  catch(err) {
    console.error("Failed to fetch elements:", err);
  }
}

await main();
