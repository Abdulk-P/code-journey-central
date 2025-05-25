
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
    
    // Try multiple API endpoints for better reliability
    const gfgApiUrls = [
      `https://geeks-for-geeks-api.vercel.app/${username}`,
      `https://gfgapi.vercel.app/${username}`,
      `https://geeksforgeeks-api.cyclic.app/${username}`
    ];
    
    let lastError = null;
    
    for (const apiUrl of gfgApiUrls) {
      try {
        console.log(`Trying API: ${apiUrl}`);
        
        // Make the request with a shorter timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000); // 6 second timeout
        
        const response = await fetch(apiUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'ProgressBuddy/1.0',
            'Accept': 'application/json'
          }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          console.error(`GFG API Error (${apiUrl}):`, response.status, response.statusText);
          lastError = new Error(`API returned ${response.status}: ${response.statusText}`);
          continue; // Try next API
        }
        
        const data = await response.json();
        
        // Check if the response indicates user not found
        if (data.error || data.message === "User not found" || !data.info) {
          console.log(`User not found in API: ${apiUrl}`);
          lastError = new Error("User not found on GeeksforGeeks");
          continue; // Try next API
        }
        
        // Success - return the data
        console.log(`Successfully fetched data from: ${apiUrl}`);
        return new Response(
          JSON.stringify({ 
            success: true, 
            data: data,
            source: apiUrl
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
        
      } catch (error) {
        console.error(`Error with API ${apiUrl}:`, error);
        if (error.name === 'AbortError') {
          lastError = new Error("Request timed out");
        } else {
          lastError = error;
        }
        continue; // Try next API
      }
    }
    
    // If we get here, all APIs failed
    console.error("All GFG APIs failed, last error:", lastError);
    return new Response(
      JSON.stringify({ 
        error: lastError?.message || "User not found on GeeksforGeeks. Please check the username and try again." 
      }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error in GFG data function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to fetch data from GeeksforGeeks. Please try again later." 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
