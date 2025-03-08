import { serve } from "https://deno.land/std@0.140.0/http/server.ts";
import Groq from "https://esm.sh/groq-sdk@0.15.0";

const groq = new Groq({ apiKey: Deno.env.get("GROQ_API_KEY") });

serve(async (req) => {
  const { message } = await req.json();
  const response = await groq.chat.completions.create({
    model: "llama-3.1-70b-versatile",
    messages: [{ role: "user", content: message }],
  });

  return new Response(
    JSON.stringify({ response: response.choices[0].message.content }),
    { headers: { "Content-Type": "application/json" } }
  );
}, { port: 8001 });
