import { report, setup } from "../src/zmq-reporter.js";
import { locationStatus } from "btcmap-common";

const data = {"id":12518254040,"status":"create","name":"Salão de Beleza OLGA","city":"Rolante","lat":-29.6476312,"lon":-50.5774391,"type":"node"};

await setup();
await report(locationStatus.CREATE, data);