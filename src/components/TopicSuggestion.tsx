
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Lightbulb, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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

  const generateSuggestion = async () => {
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

      console.log("Sending prompt to suggest-topics function:", prompt);
      
      const { data, error } = await supabase.functions.invoke("suggest-topics", {
        body: { prompt }
      });

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
    } catch (error) {
      console.error("Error generating topic suggestion:", error);
      setError("Failed to generate suggestions. Please try again.");
      toast.error("Failed to generate topic suggestions. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
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
          onClick={generateSuggestion} 
          disabled={isLoading} 
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating suggestions...
            </>
          ) : suggestion ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Generate New Suggestions
            </>
          ) : (
            "Generate Suggestions"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TopicSuggestion;
