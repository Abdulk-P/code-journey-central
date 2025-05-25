
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
      // Return a personalized fallback response instead of random
      const fallbackSuggestion = generatePersonalizedFallback(prompt);
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
        temperature: 0.8, // Increased for more variety
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error response:', errorData);
      // Return a personalized fallback response instead of random
      const fallbackSuggestion = generatePersonalizedFallback(prompt);
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
      // Return a personalized fallback response instead of random
      const fallbackSuggestion = generatePersonalizedFallback(prompt);
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
    // Return a personalized fallback response instead of random
    const fallbackSuggestion = generatePersonalizedFallback();
    
    return new Response(JSON.stringify({ 
      suggestion: fallbackSuggestion 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200, // Return 200 instead of 500
    });
  }
});

// Create a more specific cache key that includes user progress level
function createCacheKey(prompt: string): string {
  // Extract progress information and create a more specific key
  const leetcodeMatch = prompt.match(/(\d+) LeetCode problems/);
  const gfgMatch = prompt.match(/(\d+) GeeksForGeeks problems/);
  
  const leetcodeCount = leetcodeMatch ? parseInt(leetcodeMatch[1]) : 0;
  const gfgCount = gfgMatch ? parseInt(gfgMatch[1]) : 0;
  const totalProblems = leetcodeCount + gfgCount;
  
  // Create level-based cache key
  let level = 'beginner';
  if (totalProblems > 100) level = 'advanced';
  else if (totalProblems > 50) level = 'intermediate';
  
  return `${level}_${leetcodeCount > 0 ? 'lc' : ''}_${gfgCount > 0 ? 'gfg' : ''}`;
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

// Function to generate personalized fallback suggestions based on user progress
function generatePersonalizedFallback(prompt?: string) {
  // Extract user progress from prompt
  let leetcodeCount = 0;
  let gfgCount = 0;
  let hasEasy = false;
  let hasMedium = false;
  let hasHard = false;
  
  if (prompt) {
    const leetcodeMatch = prompt.match(/(\d+) LeetCode problems/);
    const gfgMatch = prompt.match(/(\d+) GeeksForGeeks problems/);
    leetcodeCount = leetcodeMatch ? parseInt(leetcodeMatch[1]) : 0;
    gfgCount = gfgMatch ? parseInt(gfgMatch[1]) : 0;
    
    hasEasy = prompt.includes('easy');
    hasMedium = prompt.includes('medium');
    hasHard = prompt.includes('hard');
  }
  
  const totalProblems = leetcodeCount + gfgCount;
  
  // Beginner suggestions (0-20 problems)
  const beginnerSuggestions = [
    "1. **Arrays and Hashing**: Master the fundamentals of array manipulation and hash table operations. Arrays are the foundation of many algorithms. Try 'Two Sum' on LeetCode.\n\n" +
    "2. **Linked Lists**: Essential for understanding pointer manipulation and memory management. Start with 'Reverse Linked List' on LeetCode.\n\n" +
    "3. **Basic Recursion**: Learn to think recursively and solve problems by breaking them down. Try 'Factorial' or 'Fibonacci' problems on GeeksforGeeks.",
    
    "1. **String Manipulation**: Learn string processing techniques like substring operations and pattern matching. Try 'Valid Anagram' on LeetCode.\n\n" +
    "2. **Two Pointers Technique**: Efficient approach for array and string problems. Start with 'Valid Palindrome' on LeetCode.\n\n" +
    "3. **Basic Math Problems**: Strengthen problem-solving with mathematical operations. Try 'Palindrome Number' on LeetCode.",
    
    "1. **Stack Operations**: Understand LIFO operations and their applications in parsing and evaluation. Try 'Valid Parentheses' on LeetCode.\n\n" +
    "2. **Queue Basics**: Learn FIFO operations essential for BFS and scheduling problems. Try implementing a queue using arrays on GeeksforGeeks.\n\n" +
    "3. **Basic Sorting**: Master bubble sort, selection sort to understand comparison-based algorithms. Try 'Sort an Array' on LeetCode."
  ];
  
  // Intermediate suggestions (21-70 problems)
  const intermediateSuggestions = [
    "1. **Binary Search**: Master the divide-and-conquer approach for sorted arrays. Critical for optimization problems. Try 'Binary Search' on LeetCode.\n\n" +
    "2. **Dynamic Programming (Basics)**: Start with simple DP problems to optimize recursive solutions. Try 'Climbing Stairs' on LeetCode.\n\n" +
    "3. **Tree Traversals**: Learn DFS and BFS for tree problems. Essential for hierarchical data. Try 'Binary Tree Inorder Traversal' on LeetCode.",
    
    "1. **Sliding Window**: Optimize substring and subarray problems with this powerful technique. Try 'Longest Substring Without Repeating Characters' on LeetCode.\n\n" +
    "2. **Heap/Priority Queue**: Master heap operations for finding extremes efficiently. Try 'Kth Largest Element in an Array' on LeetCode.\n\n" +
    "3. **Graph Basics (BFS/DFS)**: Essential for network and connectivity problems. Try 'Number of Islands' on LeetCode.",
    
    "1. **Backtracking**: Learn to explore all possible solutions systematically. Try 'Generate Parentheses' on LeetCode.\n\n" +
    "2. **Binary Tree Properties**: Understand tree validation and property checking. Try 'Validate Binary Search Tree' on LeetCode.\n\n" +
    "3. **Greedy Algorithms**: Learn to make locally optimal choices. Try 'Best Time to Buy and Sell Stock' on LeetCode."
  ];
  
  // Advanced suggestions (70+ problems)
  const advancedSuggestions = [
    "1. **Advanced Dynamic Programming**: Master complex DP patterns like interval DP and digit DP. Try 'Longest Increasing Subsequence' on LeetCode.\n\n" +
    "2. **Graph Algorithms (Advanced)**: Learn shortest path algorithms like Dijkstra and Floyd-Warshall. Try 'Network Delay Time' on LeetCode.\n\n" +
    "3. **Trie Data Structure**: Essential for efficient string operations and prefix matching. Try 'Implement Trie (Prefix Tree)' on LeetCode.",
    
    "1. **Union Find (Disjoint Set)**: Master this data structure for connectivity and grouping problems. Try 'Number of Connected Components' on LeetCode.\n\n" +
    "2. **Segment Trees**: Learn advanced range query optimization techniques. Try 'Range Sum Query - Mutable' on LeetCode.\n\n" +
    "3. **Advanced Graph Patterns**: Study topological sorting and strongly connected components. Try 'Course Schedule II' on LeetCode.",
    
    "1. **Bit Manipulation**: Master bitwise operations for optimization and mathematical problems. Try 'Single Number' on LeetCode.\n\n" +
    "2. **Advanced Tree Algorithms**: Learn about tree decomposition and LCA problems. Try 'Lowest Common Ancestor of a Binary Tree' on LeetCode.\n\n" +
    "3. **String Algorithms**: Master KMP, Rabin-Karp for pattern matching. Try 'Find the Index of the First Occurrence' on LeetCode."
  ];
  
  // Select appropriate suggestion set based on progress
  let suggestionSet;
  if (totalProblems > 70) {
    suggestionSet = advancedSuggestions;
  } else if (totalProblems > 20) {
    suggestionSet = intermediateSuggestions;
  } else {
    suggestionSet = beginnerSuggestions;
  }
  
  // Add some randomness while ensuring variety
  const timestamp = Date.now();
  const index = Math.floor((timestamp / (1000 * 60 * 5)) % suggestionSet.length); // Changes every 5 minutes
  
  return suggestionSet[index];
}
