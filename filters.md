# Filters
A filters is the condition to determine if a node (merchant) is announced in Telegram. Anything resulting in a `true` will be announced. Anything resulting `false` will not. That are also the most basic filters. Setting the filter to `false` will never give you any announcement.

## Geographic properties
In the current version of the BTCMapBot, the public [Nominatim](https://nominatim.org/) server (nominatim.openstreetmap.org) is used to lookup geographic information based on the coordinates (lat/lon) of the node. A subset of that information can be used in a filter. These properties are:

|property|description|
|---|---|
|lat|latitude of the location|
|lon|longitude of the location|
|country_code|two characters country code in lower case ([ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2))|
|country|name of the country|
|state|state or other concepts on that level (like dutch provinces)|
|county|name of the county|
|municipality|municipality or or other concepts on that level (like regions)|
|city|big towns|
|town|medium towns|
|village|small towns|

Note that some properties do not apply on every location and that `city`, `town` and `village` are a "fall-through" where in most cases only one of them is returned.

Since the introduction of Nominatim, all names are returned in the local language of the node. So, when checking against Thai locations, use the unicode CJK character set (or copy it from the `/testfilter` result). Note that Nominatim returns consistent names; It is no longer nescessary to enumerate all local languages and dialects.

Note that `city` is often provided by the node itself. This has priority when displaying it, but for the filters only the geographic data is used.

The filter engine is case and accent sensitive; any deviation will result in a mismatch.

## Custom functions
At this moment, there is one custom function defined: `$distance`. This can be used to return the distance between two earth surface coordinates. Parameters (lat/lon) are restricted to constant numeric values, as the main use is to calculate the distance of a location to a fixed centre point. See examples.

## Testing the filters
It's important to check if your filter works correctly. To do this use the `/testfilter` command. This command requires the `latitude` and `longitude` of a point on the earth's surface. One way to get these coordinate properties is to use Google Maps:

- Click on a region where you want to test
- A pin is shown and details of that pin are shown in a pop-over
- In the pop-over there are the coordinates
- Copy the coordinates and paste them after the `/testfilter` command in the bot
- This shows the properties of that location that can be used in the filter
- This shows also if the location matches the current set filter

If the filter returns unexpected results, recheck the filter using the `/showfilter` command

## Recap of common filters

- To get notifications of world wide locations:  
  `/setfilter true`
- To get notifications of locations in a specific country:  
  `/setfilter country_code = 'nl'`
- For multiple countries:
  `/setfilter country_code in ['nl', 'be']`
- For a specific state inside a country:
  `/setfilter country_code = 'nl' and state = 'Fryslân'`
- For a maximum distance (in meter) from a central point:
  `/setfilter $distance(51.98507204900486, 5.900446984603575) < 20000`

Note that here `Fryslân` is used as a local name. This is how it's called in Frisia. That's why it is important to test your filter.
