import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cache implementation for frequently requested suggestions
const suggestionCache = new Map();
const CACHE_TTL = 1000 * 60 * 10; // 10 minutes

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();
    
    // Check cache for similar prompts
    const cacheKey = createCacheKey(prompt);
    const cachedResponse = checkCache(cacheKey);
    
    if (cachedResponse) {
      console.log('Returning cached suggestion');
      return new Response(JSON.stringify({ suggestion: cachedResponse }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!openAIApiKey) {
      console.error('Missing OpenAI API key');
      // Return a fallback response instead of throwing an error
      const fallbackSuggestion = generateFallbackSuggestion(prompt);
      // Cache the fallback response
      updateCache(cacheKey, fallbackSuggestion);
      
      return new Response(JSON.stringify({ 
        suggestion: fallbackSuggestion 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Making request to OpenAI API with prompt:', prompt);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert DSA (Data Structures and Algorithms) tutor. Provide concise, helpful suggestions for what topics a programmer should study next based on their current progress.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error response:', errorData);
      // Return a fallback response instead of throwing an error
      const fallbackSuggestion = generateFallbackSuggestion(prompt);
      // Cache the fallback response
      updateCache(cacheKey, fallbackSuggestion);
      
      return new Response(JSON.stringify({ 
        suggestion: fallbackSuggestion 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    
    if (data.error) {
      console.error('OpenAI API returned an error:', data.error);
      // Return a fallback response instead of throwing an error
      const fallbackSuggestion = generateFallbackSuggestion(prompt);
      // Cache the fallback response
      updateCache(cacheKey, fallbackSuggestion);
      
      return new Response(JSON.stringify({ 
        suggestion: fallbackSuggestion 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const suggestion = data.choices[0].message.content;
    console.log('Successfully generated suggestion');
    
    // Cache the successful response
    updateCache(cacheKey, suggestion);

    return new Response(JSON.stringify({ suggestion }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in suggest-topics function:', error);
    // Return a fallback response instead of throwing an error
    const fallbackSuggestion = generateFallbackSuggestion();
    
    return new Response(JSON.stringify({ 
      suggestion: fallbackSuggestion 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200, // Return 200 instead of 500
    });
  }
});

// Create a simplified hash for caching
function createCacheKey(prompt: string): string {
  // Create a simplified version of the prompt for caching
  // Remove exact numbers but keep the general structure
  const simplifiedPrompt = prompt
    .replace(/\d+/g, 'N')
    .toLowerCase()
    .trim();
  
  return simplifiedPrompt;
}

// Check if a valid cache entry exists
function checkCache(key: string): string | null {
  if (suggestionCache.has(key)) {
    const { value, expiry } = suggestionCache.get(key);
    if (expiry > Date.now()) {
      return value;
    } else {
      // Clear expired cache
      suggestionCache.delete(key);
    }
  }
  return null;
}

// Update the cache with a new entry
function updateCache(key: string, value: string): void {
  suggestionCache.set(key, {
    value,
    expiry: Date.now() + CACHE_TTL
  });
  
  // Clean up old cache entries if cache gets too large
  if (suggestionCache.size > 50) {
    const oldestKey = [...suggestionCache.keys()][0];
    suggestionCache.delete(oldestKey);
  }
}

// Function to generate fallback suggestions
function generateFallbackSuggestion(prompt?: string) {
  // A set of predefined suggestions that will be randomly selected
  const suggestions = [
    "1. **Binary Search Trees**: Essential for efficient searching and sorting. Try 'Validate Binary Search Tree' on LeetCode.\n\n" +
    "2. **Dynamic Programming**: Important for optimization problems. Start with 'Climbing Stairs' on LeetCode.\n\n" +
    "3. **Graph Algorithms**: Crucial for network and relationship problems. Try 'Number of Islands' on LeetCode.",

    "1. **Heap Data Structure**: Important for priority-based operations. Try 'Kth Largest Element in an Array' on LeetCode.\n\n" +
    "2. **Linked Lists**: Fundamental for understanding pointers and memory. Start with 'Reverse Linked List' on LeetCode.\n\n" +
    "3. **Recursion and Backtracking**: Essential for solving complex problems. Try 'Letter Combinations of a Phone Number' on LeetCode.",
    
    "1. **Hash Tables**: Critical for efficient lookups. Try 'Two Sum' on LeetCode.\n\n" +
    "2. **Breadth-First Search**: Important for level-order traversals. Start with 'Binary Tree Level Order Traversal' on LeetCode.\n\n" +
    "3. **Sliding Window Technique**: Useful for substring problems. Try 'Longest Substring Without Repeating Characters' on LeetCode."
  ];
  
  // Randomly select one of the suggestions
  const randomIndex = Math.floor(Math.random() * suggestions.length);
  return suggestions[randomIndex];
}
