import { createOpenAI as createGroq } from '@ai-sdk/openai';
import { streamText } from 'ai';
// Allow streaming responses up to 30 seconds
export const maxDuration = 30;
const groq = createGroq({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_AI_KEY!,
});
export async function POST(req: Request): Promise<Response> {
  try {
    // Parse the request body to extract messages
    const body = await req.json();
    const { messages }= body;
    // Stream text response using the specified model
    const result = streamText({
      model: groq('llama-3.1-405b-reasoning'),
      messages,
    });
    // Return the result as a streaming response
    return result.toDataStreamResponse();
  } catch (error: unknown) {
    console.error('Error occurred while processing request:', error);
    // Return a JSON response with the error message and status code 500
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({
        error: 'An error occurred while processing your request.',
        details: errorMessage,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}