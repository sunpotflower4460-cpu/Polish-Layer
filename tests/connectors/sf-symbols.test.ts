import { readFileSync } from 'node:fs';

import { sfSymbolsConnector } from '../../src/connectors/sf-symbols.js';
import { resolveFromRoot } from '../../src/utils/paths.js';

describe('sf-symbols connector', () => {
  test('sf-symbols metadata database has 300+ entries', () => {
    const dbPath = resolveFromRoot('src/connectors/data/sf-symbols.json');
    const entries = JSON.parse(readFileSync(dbPath, 'utf-8')) as unknown[];
    expect(entries.length).toBeGreaterThanOrEqual(300);
  });

  test('search({ semantic: "設定" }) returns gearshape', async () => {
    const results = await sfSymbolsConnector.search({ semantic: '設定' });
    expect(results.some((item) => item.name === 'gearshape')).toBe(true);
  });

  test('search({ semantic: "settings" }) returns gearshape', async () => {
    const results = await sfSymbolsConnector.search({ semantic: 'settings' });
    expect(results.some((item) => item.name === 'gearshape')).toBe(true);
  });

  test('search for unknown semantic returns empty array', async () => {
    const results = await sfSymbolsConnector.search({ semantic: '存在しない意味語zzz999' });
    expect(results).toEqual([]);
  });

  test('All candidates include apple-system license type', async () => {
    const results = await sfSymbolsConnector.search({ semantic: 'settings' });
    expect(results.length).toBeGreaterThan(0);
    for (const item of results) {
      expect(item.license_info.type).toBe('apple-system');
    }
  });
});
