
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, RefreshCw } from "lucide-react";

interface Topic {
  title: string;
  description: string;
  topics: string[];
  difficulty: number;
}

interface TopicSuggesterProps {
  onSelectTopic?: (topic: Topic) => void;
  showControls?: boolean;
}

const difficultyLevels = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

const TopicSuggester: React.FC<TopicSuggesterProps> = ({ 
  onSelectTopic,
  showControls = true
}) => {
  const [department, setDepartment] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("");
  const [count, setCount] = useState<number>(5);

  const fetchTopics = async () => {
    const { data, error } = await supabase.functions.invoke("suggest-topics", {
      body: { department, difficulty, count },
    });

    if (error) throw new Error(error.message);
    return data.topics;
  };

  const {
    data: topics,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["topics", department, difficulty, count],
    queryFn: fetchTopics,
    enabled: false,
  });

  const handleGenerateTopics = () => {
    refetch();
  };

  return (
    <div className="space-y-6">
      {showControls && (
        <Card>
          <CardHeader>
            <CardTitle>Topic Suggester</CardTitle>
            <CardDescription>
              Generate AI-powered problem topics for assignments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  placeholder="e.g. Computer Science"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select
                  value={difficulty}
                  onValueChange={setDifficulty}
                >
                  <SelectTrigger id="difficulty">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any difficulty</SelectItem>
                    {difficultyLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="count">Number of Topics</Label>
                <Input
                  id="count"
                  type="number"
                  min={1}
                  max={10}
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleGenerateTopics} 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Generate Topics
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      {isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          Error: {error.message}
        </div>
      )}

      {topics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {topics.map((topic: Topic, index: number) => (
            <Card key={index} className="h-full">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{topic.title}</CardTitle>
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    topic.difficulty >= 4 ? "bg-red-100 text-red-800" :
                    topic.difficulty >= 3 ? "bg-yellow-100 text-yellow-800" :
                    "bg-green-100 text-green-800"
                  }`}>
                    {topic.difficulty === 5 ? "Very Hard" :
                     topic.difficulty === 4 ? "Hard" :
                     topic.difficulty === 3 ? "Medium" :
                     topic.difficulty === 2 ? "Easy" :
                     "Very Easy"}
                  </div>
                </div>
                <CardDescription className="mt-2">
                  {topic.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex flex-wrap gap-1">
                  {topic.topics.map((tag, tagIndex) => (
                    <span 
                      key={tagIndex}
                      className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
              {onSelectTopic && (
                <CardFooter>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-auto"
                    onClick={() => onSelectTopic(topic)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add to Assignment
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopicSuggester;
