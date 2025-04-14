
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { OpenAI } from 'https://esm.sh/openai@4.20.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle CORS preflight requests
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { department, difficulty, count = 5 } = await req.json();

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY') || '',
    });

    if (!openai.apiKey) {
      throw new Error('OpenAI API key not found');
    }

    // Construct the prompt for topic suggestions
    const prompt = `Suggest ${count} programming problem topics for computer science students${department ? ` in the ${department} department` : ''}${difficulty ? ` with ${difficulty} difficulty level` : ''}.
    
    Format the response as a JSON array of objects with these properties:
    - title: A concise problem title
    - description: A brief description of the problem (2-3 sentences)
    - topics: An array of relevant topics covered (e.g., "arrays", "dynamic programming")
    - difficulty: A rating from 1-5 where 1 is easiest and 5 is hardest
    
    Make the problems interesting, practical, and appropriate for college students.`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are an expert computer science educator who designs programming problems for college students." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const responseText = completion.choices[0].message.content;
    const topics = JSON.parse(responseText);

    // Return the suggested topics
    return new Response(JSON.stringify({ topics: topics.topics || topics }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
