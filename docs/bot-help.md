🤖 *Bot Help Guide*

This bot tracks the create and delete events of locations (merchants) on [BTCMap.org](https://www.btcmap.org). Using the filter configuration you can subscribe to a certain area on the map.

Here’s how you can interact with this bot:

📌 *General Commands:*
- `/start` - Begin interacting with the bot or restart the session.
- `/help` - Show this help message.

📌 *Filter Management Commands:*
- `/showfilter` - Display the current filter settings.
- `/setfilter <criteria>` - Set a new filter. Replace `<criteria>` with your desired filter settings (e.g., `/setfilter country_code = 'nl'`).
- `/testfilter <coordinate>` - Test the configured filter against a sample input. Replace `<coordinate>` with the lat-lon coordinate you want to test (e.g., `/testfilter 52.564236,4.738703`).

💡 *Filter examples:*
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

The following geographic entities can be used in the filter:
- `lat`
- `lon`
- `country_code`
- `country`
- `state`
- `county`
- `municipality`
- `city`
- `town`
- `village`

You can find these values for a location by using the `/testfilter` command. You can read more about the filters [here](https://github.com/beinardus/BTCMapBot/blob/main/filters.md). If you have any questions or encounter issues, feel free to reach out!

📌 *Language settings:*  
Currently, two languages are supported `nl` and `en`. Feel free to request/add other languages. The language setting only affects the update messages of the locations; commands (including `help`) are kept in English. Language related commands are:
- `/showlanguage` - Display the current language settings. The default language is set to `en`.
- `/setlanguage <language>` - Set another language. Replace `<language>` with your desired one (e.g., `/setlanguage nl`).

📌 *GitHub:*  
[github.com/beinardus/BTCMapBot](https://github.com/beinardus/BTCMapBot)

Happy observing! 😊
