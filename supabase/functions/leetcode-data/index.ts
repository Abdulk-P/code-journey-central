
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body to get the username
    const { username } = await req.json();
    
    if (!username) {
      return new Response(
        JSON.stringify({ error: "Username is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log(`Fetching LeetCode data for user: ${username}`);
    
    // LeetCode API endpoint (using the alternative API)
    const leetcodeApiUrl = `https://leetcode-api-faisalshohag.vercel.app/${username}`;
    
    // Make the request to LeetCode API with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
    
    try {
      const response = await fetch(leetcodeApiUrl, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.error("LeetCode API Error:", response.status, response.statusText);
        throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // If user not found or API returns an error
      if (data.error || data.status === 'failed') {
        return new Response(
          JSON.stringify({ error: data.error || "User not found on LeetCode" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Return the user data
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: data 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error("LeetCode API request timed out for user:", username);
        return new Response(
          JSON.stringify({ error: "Request timed out. The LeetCode API is taking too long to respond." }),
          { status: 408, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("Error fetching LeetCode data:", error);
    
    return new Response(
      JSON.stringify({ error: "Failed to fetch data from LeetCode" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
