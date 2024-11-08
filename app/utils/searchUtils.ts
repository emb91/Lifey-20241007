import { searchPatterns, engineParams, commonParams } from './searchConfig';

export function determineSearchEngine(query: string): {
  engine: string;
  params: Record<string, any>;
} {
  const query_lower = query.toLowerCase();
  
  // Default params all engines will need
  const baseParams = {
    api_key: process.env.SERPAPI_API_KEY as string,
    location: "Auckland, New Zealand",
  };

  // Check each pattern and return appropriate engine params
  for (const [key, pattern] of Object.entries(searchPatterns)) {
    if (pattern.test(query_lower)) {
      const engineConfig = engineParams[key];
      return {
        engine: engineConfig.engine,
        params: {
          ...baseParams,
          ...commonParams,
          type: engineConfig.type
        }
      };
    }
  }

  // Default to regular search if no pattern matches
  return {
    engine: "google",
    params: baseParams
  };
}