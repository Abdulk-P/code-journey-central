
import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Lightbulb, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface TopicSuggestionProps {
  platformStats: {
    leetcode?: { totalSolved: number; easySolved: number; mediumSolved: number; hardSolved: number };
    gfg?: { totalSolved: number; easySolved: number; mediumSolved: number; basicSolved: number };
  };
}

const TopicSuggestion: React.FC<TopicSuggestionProps> = ({ platformStats }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  // Use useCallback to memoize the function
  const generateSuggestion = useCallback(async (forceFresh = false) => {
    // Cancel previous request if it exists
    if (abortController) {
      abortController.abort();
    }
    
    // Create a new abort controller for this request
    const newController = new AbortController();
    setAbortController(newController);
    
    setIsLoading(true);
    setSuggestion(null);
    setError(null);

    try {
      let prompt = "Based on a coder's profile, suggest 3 DSA topics they should focus on next. ";

      // Add platform-specific data to the prompt
      if (platformStats.leetcode) {
        prompt += `They have solved ${platformStats.leetcode.totalSolved} LeetCode problems: `;
        prompt += `${platformStats.leetcode.easySolved} easy, ${platformStats.leetcode.mediumSolved} medium, and ${platformStats.leetcode.hardSolved} hard. `;
      }

      if (platformStats.gfg) {
        prompt += `They have solved ${platformStats.gfg.totalSolved} GeeksForGeeks problems: `;
        prompt += `${platformStats.gfg.easySolved} easy, ${platformStats.gfg.mediumSolved} medium, and ${platformStats.gfg.basicSolved} basic. `;
      }

      // Default recommendation for new users with no stats
      if (!platformStats.leetcode && !platformStats.gfg) {
        prompt += "They are new and haven't solved any problems yet. Suggest beginner-friendly topics.";
      }

      prompt += "For each topic, provide a brief explanation of why it's important and one specific problem they could start with.";

      // Add timestamp to force fresh suggestions when requested
      if (forceFresh) {
        prompt += ` (Fresh suggestions requested at ${Date.now()})`;
      }

      console.log("Sending prompt to suggest-topics function:", prompt);
      
      // Set timeout for the request
      const timeoutId = setTimeout(() => {
        if (newController && !newController.signal.aborted) {
          newController.abort();
          throw new Error("Request timed out");
        }
      }, 10000); // 10 second timeout
      
      const { data, error } = await supabase.functions.invoke("suggest-topics", {
        body: { prompt }
      });
      
      clearTimeout(timeoutId);

      if (error) {
        console.error("Supabase function error:", error);
        throw new Error(error.message);
      }

      if (!data || !data.suggestion) {
        console.error("Invalid response from suggest-topics function:", data);
        throw new Error("Invalid response from suggestion service");
      }

      setSuggestion(data.suggestion);
      toast.success("Successfully generated suggestions!");
    } catch (error: any) {
      console.error("Error generating topic suggestion:", error);
      if (error.message !== "Request timed out" && error.name !== "AbortError") {
        setError("Failed to generate suggestions. Please try again.");
        toast.error("Failed to generate topic suggestions. Please try again.");
      }
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  }, [platformStats]);

  const clearSuggestion = () => {
    setSuggestion(null);
    setError(null);
    toast.success("Suggestions cleared");
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Lightbulb className="h-5 w-5 text-purple-400 mr-2" />
          Topic Suggestions
        </CardTitle>
        <CardDescription>
          Get AI-powered recommendations on what to learn next
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        ) : suggestion ? (
          <div className="prose prose-sm max-w-none">
            <div className="space-y-4 text-muted-foreground" dangerouslySetInnerHTML={{ __html: suggestion.replace(/\n\n/g, '<br/><br/>') }} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <p className="text-muted-foreground mb-4">
              Click the button below to get personalized topic suggestions based on your current progress.
            </p>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button 
          onClick={() => generateSuggestion(false)} 
          disabled={isLoading} 
          className="flex-1 bg-purple-600 hover:bg-purple-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating suggestions...
            </>
          ) : suggestion ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Get New Suggestions
            </>
          ) : (
            "Generate Suggestions"
          )}
        </Button>
        {suggestion && (
          <>
            <Button 
              onClick={() => generateSuggestion(true)} 
              disabled={isLoading} 
              variant="outline"
              className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Force Fresh
            </Button>
            <Button 
              onClick={clearSuggestion} 
              disabled={isLoading} 
              variant="outline"
              className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default React.memo(TopicSuggestion);
