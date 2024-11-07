import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import { GET as searchHandler } from '@/app/api/search/route';

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
              const searchUrl = new URL('http://localhost:3000/api/search');
              searchUrl.searchParams.set('query', searchParams.query);
              if (searchParams.results_per_page) {
                searchUrl.searchParams.set('results_per_page', searchParams.results_per_page);
              }
              console.log('Making search request to:', searchUrl.toString());
              
              const searchResponse = await searchHandler(new Request(
                `http://localhost:3000/api/search?query=${encodeURIComponent(searchParams.query)}&results_per_page=${searchParams.results_per_page}`
              ));
              
              if (!searchResponse.ok) {
                const errorText = await searchResponse.text();
                console.error('Search API error:', errorText);
                throw new Error(`Search failed with status: ${searchResponse.status}`);
              }
              
              const contentType = searchResponse.headers.get('content-type');
              if (!contentType || !contentType.includes('application/json')) {
                const text = await searchResponse.text();
                console.error('Invalid content type:', contentType, 'Response:', text);
                throw new Error('Search API returned non-JSON response');
              }
              
              const searchData = await searchResponse.json();
              if (!searchData || searchData.error) {
                throw new Error(searchData?.error || 'Invalid search response');
              }
              
              console.log('Search data received:', searchData);
              
              output = JSON.stringify({
                items: searchData.items.map(item => ({
                  title: item.title,
                  link: item.link,
                  snippet: item.snippet
                })),
                searchInformation: {
                  searchTime: searchData.searchInformation?.searchTime,
                  totalResults: searchData.searchInformation?.totalResults
                }
              });
            } catch (error) {
              console.error('Search error:', error);
              output = { 
                error: error.message,
                status: 'error',
                timestamp: new Date().toISOString()
              };
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

      // Submit all tool outputs
      const updatedRun = await openai.beta.threads.runs.submitToolOutputs(
        threadId,
        runId,
        { tool_outputs: toolOutputs }
      );

      // Wait for completion
      const completedRun = await waitForRunCompletion(threadId, updatedRun.id);
      return NextResponse.json(completedRun);
    }

    return NextResponse.json(run);
  } catch (error) {
    console.error('❌ Error in action handler:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// //old code no search function

// import { NextResponse } from 'next/server';
// import OpenAI from 'openai';

// const openai = new OpenAI();

// export async function POST(
//   request: Request,
//   { params }: { params: { threadId: string } }
// ) {
//   try {
//     const { runId, toolCallOutputs } = await request.json();
//     const threadId = params.threadId;

//     console.log(`Received request for Thread ID: ${threadId}, Run ID: ${runId}`);

//     // Check the run status before submitting tool outputs
//     let run = await openai.beta.threads.runs.retrieve(threadId, runId);
//     console.log(`Initial run status: ${run.status}`);

//     if (run.status === 'completed' || run.status === 'failed' || run.status === 'cancelled') {
//       console.log(`🔄 Run already in final state: ${run.status}. Not submitting tool outputs.`);
//       return new NextResponse(JSON.stringify(run), {
//         status: 200,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     // If the run is still active, submit the tool outputs
//     console.log('Submitting tool outputs...');
//     run = await openai.beta.threads.runs.submitToolOutputs(
//       threadId,
//       runId,
//       { tool_outputs: toolCallOutputs }
//     );
//     console.log('✅ Tool outputs submitted successfully');

//     // Wait for the run to complete
//     console.log('Waiting for run to complete...');
//     let completedRun = await waitForRunCompletion(threadId, run.id);
//     console.log(`🎉 Run completed with final status: ${completedRun.status}`);

//     // Return the completed run
//     console.log("🚀 Action processed successfully, sending response to client");
//     return new NextResponse(JSON.stringify(completedRun), {
//       status: 200,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   } catch (error) {
//     console.error('❌ Error in action submission:', error);
//     const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
//     return new NextResponse(JSON.stringify({ error: errorMessage }), {
//       status: 500,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   }
// }

// async function waitForRunCompletion(threadId: string, runId: string) {
//   let run;
//   let attempts = 0;
//   do {
//     attempts++;
//     run = await openai.beta.threads.runs.retrieve(threadId, runId);
//     console.log(`Attempt ${attempts}: Run status: ${run.status}`);
//     if (run.status === 'completed' || run.status === 'failed' || run.status === 'cancelled') {
//       return run;
//     }
//     await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before checking again
//   } while (attempts < 30); // Limit to 30 attempts (30 seconds)

//   console.log('⏱️ Run did not complete within the expected time');
//   return run;
// }


