import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI();

export async function POST(
  request: Request,
  { params }: { params: { threadId: string } }
) {
  try {
    const { runId, toolCallOutputs } = await request.json();
    const threadId = params.threadId;

    const run = await openai.beta.threads.runs.submitToolOutputs(
      threadId,
      runId,
      { tool_outputs: toolCallOutputs }
    );

    // Instead of immediately returning, we need to wait for the run to complete
    let completedRun = await waitForRunCompletion(threadId, run.id);

    // Now we can return the completed run
    return new NextResponse(JSON.stringify(completedRun), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in action submission:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new NextResponse(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function waitForRunCompletion(threadId: string, runId: string) {
  let run;
  do {
    run = await openai.beta.threads.runs.retrieve(threadId, runId);
    if (run.status === 'completed' || run.status === 'failed') {
      return run;
    }
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before checking again
  } while (true);
}

