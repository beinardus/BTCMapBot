import fs from 'fs';
import csvParser from 'csv-parser';
import { dbmanager } from 'btcmap-database';

// Destination is read from the config `database` setting
// Change this to your CSV file name
const inputCsv = 'output_utf8.txt';

async function processCsv() {
  try {
    dbmanager.dbConnection.execute(async () => {
      await dbmanager.setup();

      const rows = [];
      fs.createReadStream(inputCsv)
        .pipe(csvParser({ separator: '\t' }))
        .on('data', (row) => rows.push(row))
        .on('end', async () => {
          for (const row of rows)
            try {
              await dbmanager.addOrUpdateLocation({
                id: row['@id'],
                lat: row['@lat'], 
                lon: row['@lon'],
                city: row['addr:city'], 
                name: row.name,
                type: row['@type'],
                is_active: true
              });
            } 
            catch (err) {
              console.error('Error inserting row:', err);
            }

          console.log('CSV data has been imported into the database.');
        });
    });
  }
  catch (err) {
    console.error('Error processing CSV:', err);
  }
}

// Start the process
await processCsv();
