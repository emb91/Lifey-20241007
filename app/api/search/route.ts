import { NextResponse } from 'next/server';
import { getJson } from 'serpapi';

// Get API key from environment
const SERPAPI_API_KEY = process.env.SERPAPI_API_KEY;

if (!SERPAPI_API_KEY) {
  console.error('SERPAPI_API_KEY is not defined in environment variables');
  throw new Error('Search API configuration error');
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const engine = searchParams.get('engine');
    
    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const searchOptions = {
      engine: engine || 'google',
      q: query,
      api_key: SERPAPI_API_KEY,
      google_domain: "google.co.nz",
      gl: "nz",
      hl: "en"
    };

    const data = await getJson(searchOptions);
    return NextResponse.json(data);

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: error.message || 'Search failed' },
      { status: 500 }
    );
  }
}
function formatSearchResponse(engine: string, data: any) {
  switch (engine) {
    case 'google_maps':
    case 'google_local':
      return {
        places: data.local_results?.places || [],
        searchMetadata: data.search_metadata
      };
    case 'google_images':
      return {
        images: data.images_results || [],
        searchMetadata: data.search_metadata
      };
    case 'google_events':
      return {
        events: data.events_results || [],
        searchMetadata: data.search_metadata
      };
    case 'google_hotels':
      return {
        hotels: data.hotels_results || [],
        searchMetadata: data.search_metadata
      };
    case 'google_food':
      return {
        restaurants: data.restaurants_results || [],
        searchMetadata: data.search_metadata
      };
    default:
      return {
        organic: data.organic_results || [],
        searchMetadata: data.search_metadata
      };
  }
}


// import { NextResponse } from 'next/server';

// export async function GET(request: Request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const query = searchParams.get('query');
//     const resultsPerPage = searchParams.get('results_per_page') || '5';

//     if (!query) {
//       return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
//     }

//     // Log environment variables (remove in production)
//     console.log('API Key exists:', !!process.env.GOOGLE_API_KEY);
//     console.log('Search Engine ID exists:', !!process.env.GOOGLE_SEARCH_ENGINE_ID);

//     const googleUrl = `https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_API_KEY}&cx=${process.env.GOOGLE_SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}&num=${resultsPerPage}`;
    
//     console.log('Making request to Google API...');
//     const response = await fetch(googleUrl);
    
//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error('Google API error:', errorText);
//       return NextResponse.json(
//         { error: 'Google search failed', details: errorText },
//         { status: response.status }
//       );
//     }

//     const data = await response.json();
//     console.log('Google API Response:', data);
    
//     const formattedResponse = {
//       items: data.items?.map(item => ({
//         title: item.title,
//         link: item.link,
//         snippet: item.snippet
//       })) || [],
//       searchInformation: {
//         searchTime: data.searchInformation?.searchTime,
//         totalResults: data.searchInformation?.totalResults
//       }
//     };
    
//     console.log('Formatted Response:', formattedResponse);
//     return NextResponse.json(formattedResponse);

//   } catch (error) {
//     console.error('Search error:', error);
//     return NextResponse.json(
//       { error: 'Internal server error', details: error.message },
//       { status: 500 }
//     );
//   }
// }
