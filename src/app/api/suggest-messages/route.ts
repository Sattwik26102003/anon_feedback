import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_AI_KEY,
});

export async function GET(): Promise<Response> {
  try {
    // Create a stream from the Groq API
    const stream = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What's a hobby you've recently started?||If you could have dinner with any historical figure, who would it be?||What's a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.",
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      max_completion_tokens: 1024,
      top_p: 1,
      stop: ", 6",
      stream: true, // Enable streaming
    });

    // Stream response to the client
    const responseStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";

            // Enqueue each streamed token to the client
            controller.enqueue(new TextEncoder().encode(content));
          }
          controller.close(); // Close the stream when complete
        } catch (error) {
          console.error("Error while streaming:", error);
          controller.error(error); // Signal an error in the stream
        }
      },
    });

    return new Response(responseStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked", // Ensure the client knows it's receiving a streamed response
      },
    });
  } catch (error) {
    console.error("Error occurred while processing request:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({
        error: "An error occurred while processing your request.",
        details: errorMessage,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
