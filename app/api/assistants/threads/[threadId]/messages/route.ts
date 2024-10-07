import { assistantId } from "@/app/assistant-config";
import { openai } from "@/app/openai";

export const runtime = "nodejs";

/**
* Handles POST requests to send a new message to a specific thread and initiate a streaming response.
 * 
 * This function performs the following steps:
 * 1. Extracts the message content from the request body.
 * 2. Adds the user's message to the specified thread using the OpenAI API.
 * 3. Initiates a new run for the thread with the configured assistant.
 * 4. Returns a streaming response of the assistant's reply.
 *
 * @param {Request} request - The incoming HTTP request object.
 * @param {Object} params - The route parameters.
 * @param {string} params.threadId - The ID of the thread to which the message is being added.
 * @returns {Response} A streaming response containing the assistant's reply.
 */

// Send a new message to a thread
export async function POST(request, { params: { threadId } }) {
  const { content } = await request.json();

  await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content: content,
  });

  const stream = openai.beta.threads.runs.stream(threadId, {
    assistant_id: assistantId,
  });

  return new Response(stream.toReadableStream());
}
