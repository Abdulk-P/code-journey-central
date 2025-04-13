
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
    
    // LeetCode GraphQL API endpoint
    const leetcodeAPI = "https://leetcode.com/graphql";
    
    // GraphQL query to fetch user profile data
    const query = {
      query: `
        query userPublicProfile($username: String!) {
          matchedUser(username: $username) {
            username
            submitStats: submitStatsGlobal {
              acSubmissionNum {
                difficulty
                count
                submissions
              }
            }
            profile {
              ranking
              reputation
              starRating
              userAvatar
            }
            languageProblemCount {
              languageName
              problemsSolved
            }
            tagProblemCounts {
              tagName
              problemsSolved
            }
          }
        }
      `,
      variables: {
        username
      }
    };
    
    // Make the request to LeetCode GraphQL API
    const response = await fetch(leetcodeAPI, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(query)
    });
    
    const data = await response.json();
    
    // If user not found, return appropriate error
    if (!data.data?.matchedUser) {
      return new Response(
        JSON.stringify({ error: "User not found on LeetCode" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Return the user data
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: data.data.matchedUser 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error fetching LeetCode data:", error);
    
    return new Response(
      JSON.stringify({ error: "Failed to fetch data from LeetCode" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
