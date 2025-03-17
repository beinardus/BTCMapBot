import { constructNotificationImageUrl } from "../src/construct-notification-image-url.js"

describe("image url tests", () => {
  const data = {
    id: 12505489611,
    status: "create",
    name: "Dra Ana Paula Mondragon - Ginecologia / Obstetrícia",
    city: "Santo André",
    geo: {country_code: "br"},
    user: {language: "en"}
  };

  const oldUrl = process.env.IMAGE_GENERATOR_URL;

  beforeAll(() => {
    process.env.IMAGE_GENERATOR_URL = "https://mock.mock/mock";
  });

  afterAll(() => {
    process.env.IMAGE_GENERATOR_URL = oldUrl;
  })

  test("If the city is set as a property of the location, use that property", () => {
    let url = constructNotificationImageUrl(data);
    expect(url).toBe("https://mock.mock/mock?state=create&lan=en&name=Dra%20Ana%20Paula%20Mondragon%20-%20Ginecologia%20%2F%20Obstetr%C3%ADcia&city=Santo%20Andr%C3%A9&country=br")
  });

  test("If the city is set as a property and provided in geo information, use the property", () => {
    let url = constructNotificationImageUrl({...data, geo: {...data.geo, city: "geo city"}});
    expect(url).toBe("https://mock.mock/mock?state=create&lan=en&name=Dra%20Ana%20Paula%20Mondragon%20-%20Ginecologia%20%2F%20Obstetr%C3%ADcia&city=Santo%20Andr%C3%A9&country=br")
  });

  test("If there is no property city, and there is no geo information, then there is no city", () => {
    let url = constructNotificationImageUrl({...data, city: undefined});
    expect(url).toBe("https://mock.mock/mock?state=create&lan=en&name=Dra%20Ana%20Paula%20Mondragon%20-%20Ginecologia%20%2F%20Obstetr%C3%ADcia&city=&country=br");
  });

  test("If there is no property city, but city is provided by the geo data, use the geo data", () => {
    let url = constructNotificationImageUrl({...data, city: undefined, geo: {...data.geo, city: "geo city"}});
    expect(url).toBe("https://mock.mock/mock?state=create&lan=en&name=Dra%20Ana%20Paula%20Mondragon%20-%20Ginecologia%20%2F%20Obstetr%C3%ADcia&city=geo%20city&country=br");
  })

  test("If the property city is empty, but city is provided by the geo data, use the geo data", () => {
    let url = constructNotificationImageUrl({...data, city: "", geo: {...data.geo, city: "geo city"}});
    expect(url).toBe("https://mock.mock/mock?state=create&lan=en&name=Dra%20Ana%20Paula%20Mondragon%20-%20Ginecologia%20%2F%20Obstetr%C3%ADcia&city=geo%20city&country=br");
  });
});
