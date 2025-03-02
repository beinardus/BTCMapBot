//import { constructImageUrl } from "../src/construct-image-url.js";
//import { constructMessage } from "../src/construct-message.js";
//import { sendNotification } from "../src/notify.js";
import { filterRecipients } from "../src/recipients-filter.js";

/*
const data = {
    id: "12505157187",
    status: "create",
    name: "Test location",
    city: "Test city",
    geo: {country_code: "za"}
}
*/

/*
const data = {
    id: 12505489611,
    status: 'create',
    name: 'Dra Ana Paula Mondragon - Ginecologia / Obstetrícia',
    city: 'Santo André',
    geo: {country_code: 'br'}
};
*/

//const message = constructMessage(data);
//const image = constructImageUrl(data);

const data = {"country_code":"nl","state":"Gelderland","district":"Matenhoeve","city":"Apeldoorn"};


let recipients = await filterRecipients(data);
console.log("len", recipients.length);
console.log("rec", recipients);

//recipients = filterRecipients(data.geo);
//console.log(recipients.length);

/*
for (const r of recipients) {
    //console.log(r);
    await sendNotification(image, message, r.id);
}
*/