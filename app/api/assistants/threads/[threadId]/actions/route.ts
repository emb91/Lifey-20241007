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

    console.log(`Received request for Thread ID: ${threadId}, Run ID: ${runId}`);

    // Check the run status before submitting tool outputs
    let run = await openai.beta.threads.runs.retrieve(threadId, runId);
    console.log(`Initial run status: ${run.status}`);

    if (run.status === 'completed' || run.status === 'failed' || run.status === 'cancelled') {
      console.log(`🔄 Run already in final state: ${run.status}. Not submitting tool outputs.`);
      return new NextResponse(JSON.stringify(run), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // If the run is still active, submit the tool outputs
    console.log('Submitting tool outputs...');
    run = await openai.beta.threads.runs.submitToolOutputs(
      threadId,
      runId,
      { tool_outputs: toolCallOutputs }
    );
    console.log('✅ Tool outputs submitted successfully');

    // Wait for the run to complete
    console.log('Waiting for run to complete...');
    let completedRun = await waitForRunCompletion(threadId, run.id);
    console.log(`🎉 Run completed with final status: ${completedRun.status}`);

    // Return the completed run
    console.log("🚀 Action processed successfully, sending response to client");
    return new NextResponse(JSON.stringify(completedRun), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ Error in action submission:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new NextResponse(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function waitForRunCompletion(threadId: string, runId: string) {
  let run;
  let attempts = 0;
  do {
    attempts++;
    run = await openai.beta.threads.runs.retrieve(threadId, runId);
    console.log(`Attempt ${attempts}: Run status: ${run.status}`);
    if (run.status === 'completed' || run.status === 'failed' || run.status === 'cancelled') {
      return run;
    }
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before checking again
  } while (attempts < 30); // Limit to 30 attempts (30 seconds)

  console.log('⏱️ Run did not complete within the expected time');
  return run;
}

