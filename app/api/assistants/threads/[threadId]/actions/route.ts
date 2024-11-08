import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import { GET as searchHandler } from '@/app/api/search/route';
import { determineSearchEngine } from '@/app/utils/searchUtils';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function waitForRunCompletion(threadId: string, runId: string, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    const run = await openai.beta.threads.runs.retrieve(threadId, runId);
    console.log(`Run status check ${i + 1}/${maxAttempts}:`, run.status);
    if (['completed', 'failed', 'requires_action'].includes(run.status)) {
      return run;
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw new Error('Run did not complete in the expected time');
}

export async function POST(
  request: Request,
  { params }: { params: { threadId: string } }
) {
  try {
    const { runId, toolOutputs } = await request.json();
    const threadId = params.threadId;

    const run = await openai.beta.threads.runs.retrieve(threadId, runId);
    
    if (run.status === 'completed') {
      return NextResponse.json(run);
    }
    
    if (run.status === 'requires_action' && run.required_action?.type === 'submit_tool_outputs') {
      const toolCalls = run.required_action.submit_tool_outputs.tool_calls;
      
      if (!toolCalls || toolCalls.length === 0) {
        console.error('No tool calls found in the run');
        return NextResponse.json({ error: 'No tool calls found in the run' }, { status: 400 });
      }
      
      const toolOutputs = [];

      for (const toolCall of toolCalls) {
        let output;
        
        switch (toolCall.function.name) {
          case 'search_google_api':
            try {
              const searchParams = JSON.parse(toolCall.function.arguments);
              const { engine, params } = determineSearchEngine(searchParams.query);
              
              const searchUrl = new URL('http://localhost:3000/api/search');
              searchUrl.searchParams.set('query', searchParams.query);
              searchUrl.searchParams.set('engine', engine);
              
              // Add engine-specific parameters
              Object.entries(params).forEach(([key, value]) => {
                searchUrl.searchParams.set(key, String(value));
              });
              
              console.log('Making search request to:', searchUrl.toString());
              
              const searchResponse = await searchHandler(new Request(searchUrl));
              
              if (!searchResponse.ok) {
                const errorText = await searchResponse.text();
                console.error('Search API error:', errorText);
                throw new Error(`Search failed: ${errorText}`);
              }
              
              const searchData = await searchResponse.json();
              console.log('Search data received:', searchData);
              
              if (!searchData || searchData.error) {
                throw new Error(searchData?.error || 'Invalid search response');
              }
              
              // Format the response based on the engine type
              let formattedItems;
              switch (engine) {
                case 'google_local':
                  formattedItems = searchData.places?.map(place => ({
                    title: place.title,
                    link: place.place_id_search || place.link,
                    address: place.address,
                    rating: place.rating,
                    reviews: place.reviews,
                    phone: place.phone,
                    type: place.type,
                    hours: place.hours,
                    website: place.website
                  }));
                  break;

                case 'google_hotels':
                  formattedItems = searchData.hotels?.map(hotel => ({
                    title: hotel.name,
                    link: hotel.link,
                    price: hotel.price,
                    rating: hotel.rating,
                    reviews: hotel.reviews,
                    location: hotel.location,
                    thumbnail: hotel.thumbnail,
                    description: hotel.description
                  }));
                  break;

                case 'google_images':
                  formattedItems = searchData.images?.map(image => ({
                    title: image.title,
                    link: image.link,
                    thumbnail: image.thumbnail,
                    original: image.original,
                    source: image.source,
                    source_name: image.source_name
                  }));
                  break;

                case 'google_events':
                  formattedItems = searchData.events?.map(event => ({
                    title: event.title,
                    link: event.link,
                    date: event.date,
                    venue: event.venue,
                    address: event.address,
                    description: event.description,
                    ticket_info: event.ticket_info
                  }));
                  break;

                case 'google_food':
                  formattedItems = searchData.restaurants?.map(restaurant => ({
                    title: restaurant.title,
                    link: restaurant.link,
                    rating: restaurant.rating,
                    reviews: restaurant.reviews,
                    price_range: restaurant.price_range,
                    cuisine: restaurant.cuisine,
                    address: restaurant.address,
                    hours: restaurant.hours
                  }));
                  break;

                default:
                  formattedItems = searchData.organic?.map(result => ({
                    title: result.title,
                    link: result.link,
                    snippet: result.snippet,
                    position: result.position
                  }));
              }
              
              output = JSON.stringify({
                engine,
                items: formattedItems || [],
                searchMetadata: searchData.searchMetadata || {}
              });
            } catch (error) {
              console.error('Search error:', error);
              output = JSON.stringify({ 
                error: error.message || 'An unknown error occurred',
                status: 'error',
                timestamp: new Date().toISOString(),
                details: {
                  url: searchUrl?.toString(),
                  engine: engine,
                  query: searchParams?.query
                }
              });
            }
            break;

          case 'create-task':
            const taskData = JSON.parse(toolCall.function.arguments);
            console.log('Incoming task data:', taskData);
            output = JSON.stringify(taskData);
            break;

          default:
            throw new Error(`Unknown tool: ${toolCall.function.name}`);
        }

        console.log('Tool output being pushed:', {
          tool_call_id: toolCall.id,
          output: output
        });

        toolOutputs.push({
          tool_call_id: toolCall.id,
          output: typeof output === 'string' ? output : JSON.stringify(output)
        });
      }

      const updatedRun = await openai.beta.threads.runs.submitToolOutputs(
        threadId,
        runId,
        { tool_outputs: toolOutputs }
      );

      const completedRun = await waitForRunCompletion(threadId, updatedRun.id);
      return NextResponse.json(completedRun);
    }

    return NextResponse.json(run);
  } catch (error) {
    console.error('❌ Error in action handler:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


