import { readFileSync } from 'node:fs';

import { sfSymbolsConnector, SfSymbolEntrySchema } from '../../src/connectors/sf-symbols.js';
import { resolveFromRoot } from '../../src/utils/paths.js';

describe('sf-symbols connector', () => {
  test('sf-symbols metadata database has 300+ entries', () => {
    const dbPath = resolveFromRoot('assets/sf-symbols/sf-symbols.json');
    const entries = JSON.parse(readFileSync(dbPath, 'utf-8')) as unknown[];
    expect(entries.length).toBeGreaterThanOrEqual(300);
  });

  test('all entries satisfy SfSymbolEntrySchema', () => {
    const dbPath = resolveFromRoot('assets/sf-symbols/sf-symbols.json');
    const raw = JSON.parse(readFileSync(dbPath, 'utf-8')) as unknown[];
    for (const entry of raw) {
      expect(() => SfSymbolEntrySchema.parse(entry)).not.toThrow();
    }
  });

  test('no duplicate name in the database', () => {
    const dbPath = resolveFromRoot('assets/sf-symbols/sf-symbols.json');
    const entries = JSON.parse(readFileSync(dbPath, 'utf-8')) as Array<{ name: string }>;
    const names = entries.map((e) => e.name);
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(names.length);
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

  test('search with whitespace-only semantic returns empty array', async () => {
    const results = await sfSymbolsConnector.search({ semantic: '   ' });
    expect(results).toEqual([]);
  });

  test('search with empty string semantic returns empty array', async () => {
    const results = await sfSymbolsConnector.search({ semantic: '' });
    expect(results).toEqual([]);
  });

  test('All candidates include apple-system license type', async () => {
    const results = await sfSymbolsConnector.search({ semantic: 'settings' });
    expect(results.length).toBeGreaterThan(0);
    for (const item of results) {
      expect(item.license_info.type).toBe('apple-system');
    }
  });

  test('candidates include category and ios_min_version in metadata', async () => {
    const results = await sfSymbolsConnector.search({ semantic: 'settings' });
    expect(results.length).toBeGreaterThan(0);
    for (const item of results) {
      expect(item.metadata).toBeDefined();
      expect(typeof item.metadata?.category).toBe('string');
      expect(typeof item.metadata?.ios_min_version).toBe('string');
    }
  });
});
