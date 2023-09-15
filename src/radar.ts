/* 
 * Copyright 2023 Andre Cipriani Bandarra
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 */

export type BrowserShareParams = {
  os?: 'ANDROID' | 'IOS' | 'WINDOWS' | 'MACOSX' | 'CHROMEOS' | 'LINUX' | 'SMART_TV',
  country?: string,
  deviceType?: 'DESKTOP' | 'MOBILE' | 'OTHER',
  botClass?: 'LIKELY_AUTOMATED' | 'LIKELY_HUMAN',
};
type GetBrowserShareResult = { timestamps: string[], browsers: string[], data: Map<string, Map<string, number>> };

/*
 * See https://developers.cloudflare.com/api/operations/radar-get-http-timeseries-group-by-browsers
 *
 * Example Request:
 *  ```
 *   curl -X GET "https://api.cloudflare.com/client/v4/radar/http/timeseries_groups/browser?dateRange=52w&&aggInterval=1w&limitPerGroup=10" \
 *    -H "Authorization: Bearer <token>"
 *  ```
 */
export async function getBrowserShare(authToken: string, dateStart: Date, dateEnd: Date, params: BrowserShareParams): Promise<GetBrowserShareResult> {
  let url = new URL("https://api.cloudflare.com/client/v4/radar/http/timeseries_groups/browser");
  url.searchParams.append("dateStart", dateStart.toISOString());
  url.searchParams.append("dateEnd", dateEnd.toISOString());
  url.searchParams.append("aggInterval", "1w");
  url.searchParams.append("limitPerGroup", "10");

  if (params.country) {
    url.searchParams.append("location", params.country);
  }

  if (params.deviceType) {
    url.searchParams.append("deviceType", params.deviceType);
  }

  if (params.os) {
    url.searchParams.append("os", params.os);
  }

  if (params.botClass) {
    url.searchParams.append("botClass", params.botClass);    
  }

  console.error("Requesting -> ", url.toString())
  
  let response = await fetch(url.toString(), {
    headers: {
      "Authorization": `Bearer ${authToken}`
    }
  });
  let json = await response.json();

  if (response.status !== 200) {
    throw new Error(`Request failed with response ${response.status} - ${json.errors}}`);
  }

  let series =  json.result.serie_0;

  // Hack to get a date format in yyyy-MM-dd.
  let dateFormat = new Intl.DateTimeFormat('fr-CA', {year: "numeric", month: "2-digit", day: "2-digit"});
  let timestamps: string[] = series.timestamps.map(ts => dateFormat.format(Date.parse(ts)));

  let browsers: Array<string> = [];
  for (let column in series) {
    if (column === "timestamps") {
      continue;
    }
    browsers.push(column);
  }

  let data: Map<string, Map<string, number>> = new Map();
  for (let i = 0; i < timestamps.length; i++) {
    let timestampMap = new Map();
    for (let browser of browsers) {
      let value = series[browser][i] / 100;
      timestampMap.set(browser, value);
    }
    data.set(timestamps[i], timestampMap);
  }
  return {timestamps, browsers, data};
}

/*
 * See https://developers.cloudflare.com/api/operations/radar-get-entities-locations
 */
export async function getLocations(authToken: string): Promise<Array<string>> {
    let response = await fetch("https://api.cloudflare.com/client/v4/radar/entities/locations?limit=300", {
        headers: {
          "Authorization": `Bearer ${authToken}`
        }
      });

    let json = await response.json();  
    if (response.status !== 200) {
        throw new Error(`Request failed with response ${response.status} - ${json.errors}}`);
    }
    
    let result = json.result.locations.map(r => r.alpha2)
    return result;
}
