import { openai } from "@/app/openai";

export const runtime = "nodejs";

// The assistant ID is stored securely and remains constant
const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID;

// This route could be used to fetch assistant details if needed
export async function GET() {
  try {
    const assistant = await openai.beta.assistants.retrieve(ASSISTANT_ID);
    console.log('Assistant Model:', assistant.model);
    return Response.json({ 
      id: assistant.id,
      name: assistant.name,
      model: assistant.model
    });
  } catch (error) {
    console.error("Error retrieving assistant:", error);
    return Response.json({ error: "Failed to retrieve assistant details" }, { status: 500 });
  }
}

// The code for creating a new assistant is kept here for reference purposes only
// It is not used in the regular operation of the application
/*
export async function POST() {
  const assistant = await openai.beta.assistants.create({
    instructions: "You are a helpful assistant.",
    name: "LifeyGPT",
    model: "gpt-4o",
    tools: [
      {
        type: "function",
        function: {
          name: "get_weather",
          description: "Determine weather in my location",
          parameters: {
            type: "object",
            properties: {
              location: {
                type: "string",
                description: "The city and state e.g. San Francisco, CA",
              },
              unit: {
                type: "string",
                enum: ["c", "f"],
              },
            },
            required: ["location"],
          },
        },
      },
      { type: "file_search" },
    ],
  });
  return Response.json({ assistantId: assistant.id });
}
*/
