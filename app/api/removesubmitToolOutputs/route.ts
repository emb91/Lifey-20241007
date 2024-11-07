//no search function
// import { NextResponse } from 'next/server';
// import OpenAI from 'openai';

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// async function waitForRunCompletion(threadId: string, runId: string, maxAttempts = 30) {
//   for (let i = 0; i < maxAttempts; i++) {
//     const run = await openai.beta.threads.runs.retrieve(threadId, runId);
//     if (['completed', 'failed', 'requires_action'].includes(run.status)) {
//       return run;
//     }
//     await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before next check
//   }
//   throw new Error('Run did not complete in the expected time');
// }

// export async function POST(request: Request) {
//   try {
//     let { threadId, runId, toolOutputs } = await request.json();
//     console.log('Received request:', { threadId, runId, toolOutputs });

//     if (!process.env.OPENAI_API_KEY) {
//       throw new Error('OPENAI_API_KEY is not set');
//     }

//     let run;
//     try {
//       run = await openai.beta.threads.runs.submitToolOutputs(threadId, runId, {
//         tool_outputs: toolOutputs,
//       });
//     } catch (error) {
//       if (error.message.includes('expired')) {
//         console.log('Run expired, creating a new run');
//         run = await openai.beta.threads.runs.create(threadId, {
//           assistant_id: process.env.ASSISTANT_ID, // Make sure to set this in your .env file
//         });
//       } else {
//         throw error;
//       }
//     }

//     // Wait for run completion
//     run = await waitForRunCompletion(threadId, run.id);
    
//     console.log('Final run status:', run.status);
//     return NextResponse.json(run);
//   } catch (error) {
//     console.error('Detailed error in submitToolOutputs:', error);
//     return NextResponse.json({ message: 'Error submitting tool output', error: error.message }, { status: 500 });
//   }
// }