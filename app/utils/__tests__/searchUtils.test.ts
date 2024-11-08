import { determineSearchEngine } from '../searchUtils';

describe('determineSearchEngine', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    process.env.SERPAPI_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  // Hotels
  test('should return google_hotels engine for hotel-related queries', () => {
    const result = determineSearchEngine('find me a hotel in Auckland');
    expect(result).toEqual({
      engine: 'google_hotels',
      params: {
        api_key: process.env.SERPAPI_API_KEY,
        location: 'Auckland, New Zealand',
        type: 'hotels'
      }
    });
  });

  // Restaurants & Cafes
  test('should return google_local engine for restaurant queries', () => {
    const result = determineSearchEngine('Italian restaurants in CBD');
    expect(result).toEqual({
      engine: 'google_local',
      params: {
        api_key: process.env.SERPAPI_API_KEY,
        location: 'Auckland, New Zealand',
        type: 'local'
      }
    });
  });

  test('should return google_local engine for cafe queries', () => {
    const result = determineSearchEngine('coffee shops in Ponsonby');
    expect(result).toEqual({
      engine: 'google_local',
      params: {
        api_key: process.env.SERPAPI_API_KEY,
        location: 'Auckland, New Zealand',
        type: 'local'
      }
    });
  });

  // Bars & Nightlife
  test('should return google_local engine for bar queries', () => {
    const result = determineSearchEngine('wine bars in Viaduct');
    expect(result).toEqual({
      engine: 'google_local',
      params: {
        api_key: process.env.SERPAPI_API_KEY,
        location: 'Auckland, New Zealand',
        type: 'local'
      }
    });
  });

  // Shopping
  test('should return google_local engine for shopping queries', () => {
    const result = determineSearchEngine('shopping malls near me');
    expect(result).toEqual({
      engine: 'google_local',
      params: {
        api_key: process.env.SERPAPI_API_KEY,
        location: 'Auckland, New Zealand',
        type: 'local'
      }
    });
  });

  // Health & Beauty
  test('should return google_local engine for health queries', () => {
    const result = determineSearchEngine('doctors clinic nearby');
    expect(result).toEqual({
      engine: 'google_local',
      params: {
        api_key: process.env.SERPAPI_API_KEY,
        location: 'Auckland, New Zealand',
        type: 'local'
      }
    });
  });

  // Places & Events
  test('should return google_local engine for places queries', () => {
    const result = determineSearchEngine('museums in Auckland');
    expect(result).toEqual({
      engine: 'google_local',
      params: {
        api_key: process.env.SERPAPI_API_KEY,
        location: 'Auckland, New Zealand',
        type: 'places'
      }
    });
  });

  // Transport
  test('should return google_local engine for transport queries', () => {
    const result = determineSearchEngine('nearest train station');
    expect(result).toEqual({
      engine: 'google_local',
      params: {
        api_key: process.env.SERPAPI_API_KEY,
        location: 'Auckland, New Zealand',
        type: 'transport'
      }
    });
  });

  // Default
  test('should return default google engine for general queries', () => {
    const result = determineSearchEngine('how to make pasta');
    expect(result).toEqual({
      engine: 'google',
      params: {
        api_key: process.env.SERPAPI_API_KEY,
        location: 'Auckland, New Zealand'
      }
    });
  });
}); 