import Groq from "groq-sdk";
import { streamText } from 'ai';

export const maxDuration = 30;

const groq = new Groq({
  apiKey: process.env.GROQ_AI_KEY,
});

export async function POST(req: Request): Promise<Response> {
  try {
    // Parse the request body to extract messages
    const body = await req.json();
    const { messages } = body;

    if (!Array.isArray(messages)) {
      console.error('Invalid "messages" format:', messages);
      return new Response(
        JSON.stringify({ error: 'Invalid request: "messages" must be an array of objects.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Ensure messages are properly formatted
    for (const message of messages) {
      if (!message.role || !message.content) {
        console.error('Malformed message:', message);
        return new Response(
          JSON.stringify({ error: 'Each message must have "role" and "content" fields.' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Make a request to Groq's chat completion
    const completion = await groq.chat.completions.create({
      messages: [
        ...messages,
        { role: 'user', content: 'Now complete this sentence and give the final sentence.' },
      ],
      model: "llama-3.3-70b-versatile",
    });

    // Stream the response back
    // const result = streamText({
    //   model: "llama-3.3-70b-versatile",
    //   messages: completion.choices[0].message.content,
    // });

    // Return the result as a streaming response
    // return result.toDataStreamResponse();
    return Response.json({
      success:true,
      content:completion
    })
  } catch (error: unknown) {
    console.error('Error occurred while processing request:', error);

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
