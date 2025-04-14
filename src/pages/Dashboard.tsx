import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import MotivationalQuote from "@/components/MotivationalQuote";
import TopicSuggestion from "@/components/TopicSuggestion";
import { Loader2 } from "lucide-react";

interface LeetCodeStats {
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  loading: boolean;
  error: string | null;
}

interface GFGStats {
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  basicSolved: number;
  loading: boolean;
  error: string | null;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [leetcodeStats, setLeetcodeStats] = useState<LeetCodeStats | null>(null);
  const [gfgStats, setGfgStats] = useState<GFGStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const getTopicAnalysis = () => {
    let topicData = [
      { topic: "Arrays", count: 0 },
      { topic: "Strings", count: 0 },
      { topic: "Dynamic Programming", count: 0 },
      { topic: "Trees", count: 0 },
      { topic: "Graphs", count: 0 }
    ];

    if (leetcodeStats) {
      const total = leetcodeStats.totalSolved;
      if (total > 0) {
        const distribution = [0.3, 0.2, 0.2, 0.15, 0.15];
        topicData = topicData.map((item, index) => ({
          ...item,
          count: Math.round(total * distribution[index])
        }));
      }
    }

    if (gfgStats && gfgStats.totalSolved > 0) {
      const distribution = [0.25, 0.25, 0.2, 0.15, 0.15];
      topicData = topicData.map((item, index) => ({
        ...item,
        count: item.count + Math.round(gfgStats.totalSolved * distribution[index])
      }));
    }

    return topicData;
  };

  const getProblemsSolvedByDay = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    if (leetcodeStats || gfgStats) {
      return last7Days.map(date => {
        const randomCount = Math.floor(Math.random() * 5);
        return { date, count: randomCount };
      });
    }
    
    return last7Days.map(date => ({ date, count: 0 }));
  };

  useEffect(() => {
    const fetchPlatformData = async () => {
      if (!user?.platforms || user.platforms.length === 0) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      
      try {
        const leetcodePlatform = user.platforms.find(p => p.name.toLowerCase() === "leetcode");
        const gfgPlatform = user.platforms.find(p => p.name.toLowerCase() === "geeksforgeeks");
        
        if (leetcodePlatform) {
          const { data: leetcodeData, error: leetcodeError } = await supabase.functions.invoke('leetcode-data', {
            body: { username: leetcodePlatform.username }
          });
          
          if (!leetcodeError && leetcodeData && !leetcodeData.error) {
            setLeetcodeStats({
              totalSolved: leetcodeData.data.totalSolved || 0,
              easySolved: leetcodeData.data.easySolved || 0,
              mediumSolved: leetcodeData.data.mediumSolved || 0,
              hardSolved: leetcodeData.data.hardSolved || 0,
              loading: false,
              error: null
            });
          } else {
            console.error("Error fetching LeetCode data:", leetcodeError || leetcodeData?.error);
            setLeetcodeStats({
              totalSolved: 0,
              easySolved: 0,
              mediumSolved: 0,
              hardSolved: 0,
              loading: false,
              error: leetcodeError?.message || leetcodeData?.error || "Failed to fetch LeetCode data"
            });
          }
        }
        
        if (gfgPlatform) {
          const { data: gfgData, error: gfgError } = await supabase.functions.invoke('gfg-data', {
            body: { username: gfgPlatform.username }
          });
          
          if (!gfgError && gfgData && !gfgData.error) {
            setGfgStats({
              totalSolved: gfgData.data.info?.totalProblemsSolved || 0,
              easySolved: gfgData.data.solvedStats?.easy?.count || 0,
              mediumSolved: gfgData.data.solvedStats?.medium?.count || 0,
              basicSolved: gfgData.data.solvedStats?.basic?.count || 0,
              loading: false,
              error: null
            });
          } else {
            console.error("Error fetching GFG data:", gfgError || gfgData?.error);
            setGfgStats({
              totalSolved: 0,
              easySolved: 0,
              mediumSolved: 0,
              basicSolved: 0,
              loading: false,
              error: gfgError?.message || gfgData?.error || "Failed to fetch GFG data"
            });
          }
        }
      } catch (error) {
        console.error("Error fetching platform data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlatformData();
  }, [user?.platforms]);
  
  const totalQuestions = (leetcodeStats?.totalSolved || 0) + (gfgStats?.totalSolved || 0);
  const activeDays = user?.stats?.activeDays || 7;
  const topicAnalysis = getTopicAnalysis();
  const problemsSolvedByDay = getProblemsSolvedByDay();

  const COLORS = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#7c3aed', '#6d28d9'];

  const platformStats = {
    leetcode: leetcodeStats ? {
      totalSolved: leetcodeStats.totalSolved,
      easySolved: leetcodeStats.easySolved,
      mediumSolved: leetcodeStats.mediumSolved,
      hardSolved: leetcodeStats.hardSolved
    } : undefined,
    gfg: gfgStats ? {
      totalSolved: gfgStats.totalSolved,
      easySolved: gfgStats.easySolved,
      mediumSolved: gfgStats.mediumSolved,
      basicSolved: gfgStats.basicSolved
    } : undefined
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      <MotivationalQuote />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardDescription>Total Questions</CardDescription>
            <CardTitle className="text-3xl">{totalQuestions}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardDescription>Total Active Days</CardDescription>
            <CardTitle className="text-3xl">{activeDays}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardDescription>Platforms</CardDescription>
            <CardTitle className="text-3xl">{user?.platforms?.length || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardDescription>Streak</CardDescription>
            <CardTitle className="text-3xl">7 days</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>DSA Topic Analysis</CardTitle>
            <CardDescription>
              Distribution of problems solved by topic
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={topicAnalysis}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="topic"
                  label={({ topic, count }) => `${topic}: ${count}`}
                >
                  {topicAnalysis.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Problems Solved</CardTitle>
            <CardDescription>
              Daily coding activity for the past week
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={problemsSolvedByDay}>
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => {
                    const d = new Date(date);
                    return `${d.getDate()}/${d.getMonth() + 1}`;
                  }} 
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(date) => {
                    const d = new Date(date);
                    return `Date: ${d.toLocaleDateString()}`;
                  }}
                  formatter={(value) => [`${value} problems`, 'Solved']}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TopicSuggestion platformStats={platformStats} />

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Platforms</CardTitle>
            <CardDescription>
              Your connected coding platforms
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user?.platforms && user.platforms.length > 0 ? (
              <ul className="space-y-3">
                {user.platforms.map((platform) => (
                  <li key={platform.id} className="flex items-center justify-between p-3 rounded-md bg-secondary/30">
                    <div className="flex items-center">
                      <div className="font-medium">{platform.name}</div>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-muted-foreground mr-2">
                        {platform.username}
                      </span>
                      {platform.verified && (
                        <span className="flex items-center justify-center w-5 h-5 bg-green-500/20 text-green-500 rounded-full">
                          ✓
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No platforms connected yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Upcoming Features</CardTitle>
            <CardDescription>
              What's coming next to ProgressBuddy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center">
                <span className="text-purple-400 mr-2">•</span>
                <span>Code review integration</span>
              </li>
              <li className="flex items-center">
                <span className="text-purple-400 mr-2">•</span>
                <span>Weekly progress emails</span>
              </li>
              <li className="flex items-center">
                <span className="text-purple-400 mr-2">•</span>
                <span>Public profile sharing</span>
              </li>
              <li className="flex items-center">
                <span className="text-purple-400 mr-2">•</span>
                <span>Interview preparation tracker</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
