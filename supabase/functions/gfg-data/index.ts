
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
    
    console.log(`Fetching GeeksforGeeks data for user: ${username}`);
    
    // GeeksforGeeks API endpoint
    const gfgApiUrl = `https://geeks-for-geeks-api.vercel.app/${username}`;
    
    // Make the request to GeeksforGeeks API with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
    
    try {
      const response = await fetch(gfgApiUrl, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.error("GFG API Error:", response.status, response.statusText);
        throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // If user not found or API returns an error
      if (data.error) {
        return new Response(
          JSON.stringify({ error: data.error || "User not found on GeeksforGeeks" }),
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
        console.error("GFG API request timed out for user:", username);
        return new Response(
          JSON.stringify({ error: "Request timed out. The GeeksforGeeks API is taking too long to respond." }),
          { status: 408, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("Error fetching GeeksforGeeks data:", error);
    
    return new Response(
      JSON.stringify({ error: "Failed to fetch data from GeeksforGeeks" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
