# cloudflare-radar-extractor

A simple Node.js tool to extract user-agent information from the [CloudFlare Radar API][1]

## Running

### Get a CloudFlare API Token
You will need a [CloudFlare API Token][2] with the `User > User Details` permission. Check [this article][3] for more details.

### Configuration
 - Run `npm install` to install dependencies.
 - Copy `config.example.json` to create your own `config.json`. Add your CloudFlare API token to the `authToken` field.

### Running

Use `npm start` to run the code.

[1]: https://developers.cloudflare.com/api/operations/radar-get-http-timeseries-group-by-browsers
[2]: https://developers.cloudflare.com/fundamentals/api/get-started/create-token/
[3]: https://developers.cloudflare.com/radar/get-started/first-request/
