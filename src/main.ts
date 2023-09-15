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

import { open, readFile } from 'node:fs/promises';
import { BrowserShareParams, getBrowserShare } from './radar';
const AUTH_TOKEN = '';

const dates = [
  {start: new Date('2022-01-01'), end: new Date('2022-12-31')},
  {start: new Date('2023-01-01'), end: new Date()},
];

type Config = { authToken: string }

async function loadConfig(): Promise<Config> {
  const config = await readFile('config.json', { encoding: 'utf8' });
  return JSON.parse(config) as Config;
}

(async () => {
  const config = await loadConfig();
  let browsers: Set<string> = new Set();
  let timestamps: Set<string> = new Set();
  let data: Map<string, Map<string, number>> = new Map();
  let browserShareParams: BrowserShareParams = {
    country: 'US',
    botClass: 'LIKELY_HUMAN',
  };

  for (let {start, end} of dates) {
    const resp = await getBrowserShare(config.authToken, start, end, browserShareParams);
    browsers = new Set([...browsers, ...resp.browsers]);
    timestamps = new Set([...timestamps, ...resp.timestamps]);
    data = new Map([...data, ...resp.data]);
  }

  let sortedTimestamps = Array.from(timestamps).sort();
  let sortedBrowsers = Array.from(browsers);

  const fileName = `${browserShareParams.os || 'ALL'}-${browserShareParams.country || 'GLOBAL'}\
-${browserShareParams.deviceType || 'ANY'}-${browserShareParams.botClass || 'ANY'}.csv`

  const fd = await open(fileName, 'w');
  const write = await fd.createWriteStream();
  await write.write(['Date', ...browsers].join(';'))
  for (let timestamp of sortedTimestamps) {
    let row = [timestamp];
    for (let browser of sortedBrowsers) {
      let value = (data.get(timestamp))?.get(browser) || 0.0;
      row.push(value.toString());
    }
    await write.write(row.join(';'));
  }
})();
