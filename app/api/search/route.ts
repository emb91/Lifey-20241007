import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const resultsPerPage = searchParams.get('results_per_page') || '5';

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    // Log environment variables (remove in production)
    console.log('API Key exists:', !!process.env.GOOGLE_API_KEY);
    console.log('Search Engine ID exists:', !!process.env.GOOGLE_SEARCH_ENGINE_ID);

    const googleUrl = `https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_API_KEY}&cx=${process.env.GOOGLE_SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}&num=${resultsPerPage}`;
    
    console.log('Making request to Google API...');
    const response = await fetch(googleUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google API error:', errorText);
      return NextResponse.json(
        { error: 'Google search failed', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Google API Response:', data);
    
    const formattedResponse = {
      items: data.items?.map(item => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet
      })) || [],
      searchInformation: {
        searchTime: data.searchInformation?.searchTime,
        totalResults: data.searchInformation?.totalResults
      }
    };
    
    console.log('Formatted Response:', formattedResponse);
    return NextResponse.json(formattedResponse);

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}