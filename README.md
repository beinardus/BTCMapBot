# BTCMap Telegram Bot
The aim of this project is to notify the creation and deletion of Bitcoin accepting locations on [BTCMap.org](https://btcmap.org/) in specific geographic regions.

The service is split into 3 parts (3 Docker containers)
- `btcmap_osm`, tracking changes on Open Street Map (via BTCMap API)
- `btcmap_telegram`, broadcasting changes to Telegram subscribers
- `btcmap_image_generator`, add a more attractive look to the Telegram messages

## BTCMapBot on Telegram
It is not recommended to run your own bot. Instead, register to the running bot on Telegram:
[t.me/ST599HMhfbHm_bot](https://t.me/ST599HMhfbHm_bot)

Launching your own bot will increase the data load on [BTCMap.org](https://btcmap.org/) and [Geoapify](https://www.geoapify.com/).

However, you can decide to make use of the `btcmap-osm` `zmq` (ZeroMQ) interface and build your own bot on top of that.

## btcmap-osm
This service makes use of the logging API of BTCMap, but implements a full lifetime cycle of locations (create -> update -> delete -> create), where BTCMap only provides a one time `create` event and multiple `delete` and `update` events.
Updates are broadcasted to `zmq` listeners. Data is send using JSON. Use the `status` in the message to handle it. Before the data is send, it is enriched with geographical properties using the `reverse` API endpoint of [Nominatim](https://nominatim.org/) based on the `lat` and `lon` properties:

|property|description|
|---|---|
| id | OSM id of the location |
| status | `create` or `delete` |
| name | name of the location |
| city | city as described by OSM tags |
| geo | properties: `country`, `country_code`, `state`, `county`, `municipality`, `city`, `town`, `village` |
| lat | latitude |
| lon | longitude |
| type | OSM type of the location: `node`, `way` etc. |

A public `zmq` service is provided on:  
`tcp://dutchbtc.ddns.net:3030`

## btcmap-telegram
This service implements the Telegram bot. Telegram chats that register the bot can customize their report filter based on the properties of the location. See the `/help` command of the bot.
This service is a listener to the `zmq` interface provided by `btcmap-osm`. Each update is checked against the chat's filter and send to said channel if there is a match.

### Tamed JSONata
The `btcmap-telegram` bot uses `JSONata` as the engine for filtering locations. This engine is very powerful but lacks type checking and most validations will be performed at the moment input data is tested (`evaluate`), not during the compilation of the query. The actual filter is applied in the background process, so providing user feedback of errors happening at that stage is practically infeasable. Therefore the engine is crippled by a pre-compilation step (`validateAST`):
- Right hand side array comparison using the `=` operator is prohibited.
- Custom function calls are checked on the number of attributes passes to it.
- Custom functions (like `$distance`) only take literal values for its parameters.
- Custom function parameters are type checked.

If, despite of these precautions, the filter function fails during runtime, an error is silently logged, and the result is assumed to be a mismatch.

⚠️ **Important:**  
Grant the bot admin rights to allow it to post in a Telegram channel as only admins are allowed to post in a channel. There are no additional rights required for posting in other types of chats (group / private).

## btcmap-image-generator
This service is used to provide the images for the Telegram notification's `photo` property. It uses `puppeteer` to convert an HTML page to a `png` image.

## installation
Minimal version to copy
```
/btcmap
├── btcmap-common
│   ├── src
│   ├── package.json
│   ├── index.js
├── btcmap-database
│   ├── src
│   ├── package.json
│   ├── index.js
├── btcmap-image-generator
│   ├── src
│   ├── package.json
├── btcmap-osm
│   ├── src
│   ├── package.json
├── btcmap-telegram
│   ├── src
│   ├── package.json
├── custom-error
│   ├── package.json
│   ├── index.js
├── geoapify
│   ├── src
│   ├── package.json
│   ├── index.js
├── http-utils
│   ├── package.json
│   ├── index.js
├── translation
│   ├── src
│   ├── package.json
│   ├── index.js
├── .env
├── docker-compose.yaml
├── dockerfile-image-generator
├── dockerfile-osm
├── dockerfile-telegram
```

Content of the `.env` file (stored in key=value notation)
|key|value|
|---|---|
|TELEGRAM_BOT_TOKEN|The Telegram token provided by BotFather|
|IMAGE_GENERATOR_URL|Endpoint of the image generator|

Optionally, move persistent data and configuration to a designated location. Check the mappings in the `docker-compose.yaml` file.

```
/data/btcmap
├── data
│   ├── database.db
├── btcmap-osm
│   ├── default.yml
├── docs
│   ├── bot-help.md
├── btcmap-telegram
│   ├── default.yml
├── btcmap-image-generator
│   ├── templates
│   │   ├── blank.html
│   │   ├── btcmap-banner.svg
│   │   ├── create-template.html
│   │   ├── delete-template.html
│   │   ├── face-screaming-in-fear_1f631.png
│   │   ├── party-popper_1f389.png
```

Update the configuration `/data/btcmap-telegram/default.yml` to use your own Telegram bot

Build the `docker-compose.yml` from the root of the application:
```
docker compose build
docker compose up -d
```

Install and configure `nginx` to forward the webhook calls of Telegram to `btcmap-telegram`, or let the webhook directly communicate to the Docker container. Use `nginx` if you want to communicate over ssl (https). Polling is not (yet) implemented.

Add a port forward on the router to the server to let Telegram reach your webhook url.

## Initialize the database
The current logic allows starting with an empty database.
Updates are not as accurate as working with a fully synchronized database: Revival of a location is not reported. To start with a synchronized database, use the scripts from the `btcmap-osm/tooling` directory:
- `retrieve-osm-data`: read locations with the property `currency:XBT` from OSM
- `initial-fill-db`: create and fill a database from the result of `retrieve-osm-data`.

## Testing
Instructions on how to run the unit tests can be found [here](./tests.md).

