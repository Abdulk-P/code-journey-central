
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2, Check, Loader2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Platform {
  id: string;
  name: string;
  logoUrl: string;
  description: string;
}

interface PlatformStats {
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  ranking: number;
  topTags?: {
    name: string;
    count: number;
  }[];
  loading: boolean;
  error: string | null;
}

interface GFGStats {
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  basicSolved: number;
  codingScore: number;
  institute: string;
  streak: number;
  maxStreak: number;
  solvedQuestions: {
    medium: {
      questions: {
        question: string;
        questionUrl: string;
      }[];
    };
    easy: {
      questions: {
        question: string;
        questionUrl: string;
      }[];
    };
    basic: {
      questions: {
        question: string;
        questionUrl: string;
      }[];
    };
  };
  loading: boolean;
  error: string | null;
}

const defaultLeetCodeStats: PlatformStats = {
  totalSolved: 0,
  easySolved: 0,
  mediumSolved: 0,
  hardSolved: 0,
  ranking: 0,
  topTags: [],
  loading: false,
  error: null
};

const defaultGFGStats: GFGStats = {
  totalSolved: 0,
  easySolved: 0,
  mediumSolved: 0,
  basicSolved: 0,
  codingScore: 0,
  institute: "",
  streak: 0,
  maxStreak: 0,
  solvedQuestions: {
    medium: { questions: [] },
    easy: { questions: [] },
    basic: { questions: [] }
  },
  loading: false,
  error: null
};

const availablePlatforms: Platform[] = [
  {
    id: "leetcode",
    name: "LeetCode",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/1/19/LeetCode_logo_black.png",
    description: "Solve coding challenges and prepare for technical interviews."
  },
  {
    id: "gfg",
    name: "GeeksforGeeks",
    logoUrl: "https://media.geeksforgeeks.org/wp-content/uploads/20210915115837/gfg3.png",
    description: "Practice DSA problems and learn computer science concepts."
  },
  {
    id: "codechef",
    name: "CodeChef",
    logoUrl: "https://static.startuptalky.com/2021/04/codechef-logo-startuptalky.jpg",
    description: "Participate in competitive programming contests."
  },
  {
    id: "codeforces",
    name: "Codeforces",
    logoUrl: "https://play-lh.googleusercontent.com/EkSlLWf2-04k5Y5F_MDLqoXPdo0TyZX3zKdCBGKaHtCyRA1_vocEV-X8s7kcZYXffg",
    description: "Improve your algorithmic skills through competitions."
  },
  {
    id: "hackerrank",
    name: "HackerRank",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/4/40/HackerRank_Icon-1000px.png",
    description: "Practice coding challenges and prepare for interviews."
  },
  {
    id: "atcoder",
    name: "AtCoder",
    logoUrl: "https://img.atcoder.jp/assets/atcoder.png",
    description: "Participate in Japanese programming contests."
  },
];

const Platforms: React.FC = () => {
  const { user, fetchUserData } = useAuth();
  const [platformUsername, setPlatformUsername] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [leetcodeStats, setLeetcodeStats] = useState<PlatformStats>(defaultLeetCodeStats);
  const [gfgStats, setGfgStats] = useState<GFGStats>(defaultGFGStats);

  // Fetch platform stats when component mounts or user changes
  useEffect(() => {
    if (user?.platforms && user.platforms.length > 0) {
      user.platforms.forEach(platform => {
        if (platform.name.toLowerCase() === "leetcode") {
          fetchLeetCodeStats(platform.username);
        } else if (platform.name.toLowerCase() === "geeksforgeeks") {
          fetchGFGStats(platform.username);
        }
      });
    }
  }, [user?.platforms]);

  const fetchLeetCodeStats = async (username: string) => {
    try {
      setLeetcodeStats(prev => ({
        ...prev,
        loading: true,
        error: null
      }));

      const { data, error } = await supabase.functions.invoke('leetcode-data', {
        body: { username }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        setLeetcodeStats(prev => ({
          ...prev,
          loading: false,
          error: data.error
        }));
        return;
      }

      const leetcodeData = data.data;
      
      // Extract stats from the response
      setLeetcodeStats({
        totalSolved: leetcodeData.totalSolved || 0,
        easySolved: leetcodeData.easySolved || 0,
        mediumSolved: leetcodeData.mediumSolved || 0,
        hardSolved: leetcodeData.hardSolved || 0,
        ranking: leetcodeData.ranking || 0,
        topTags: [],  // The new API doesn't provide tag information
        loading: false,
        error: null
      });
    } catch (error: any) {
      console.error("Error fetching LeetCode stats:", error);
      setLeetcodeStats(prev => ({
        ...prev,
        loading: false, 
        error: error.message || "Failed to fetch LeetCode stats"
      }));
      toast.error(`Error fetching LeetCode stats: ${error.message || "Unknown error"}`);
    }
  };

  const fetchGFGStats = async (username: string) => {
    try {
      setGfgStats(prev => ({
        ...prev,
        loading: true,
        error: null
      }));

      const { data, error } = await supabase.functions.invoke('gfg-data', {
        body: { username }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        setGfgStats(prev => ({
          ...prev,
          loading: false,
          error: data.error
        }));
        return;
      }

      const gfgData = data.data;
      
      // Extract stats from the response
      setGfgStats({
        totalSolved: gfgData.info?.totalProblemsSolved || 0,
        easySolved: gfgData.solvedStats?.easy?.count || 0,
        mediumSolved: gfgData.solvedStats?.medium?.count || 0,
        basicSolved: gfgData.solvedStats?.basic?.count || 0,
        codingScore: gfgData.info?.codingScore || 0,
        institute: gfgData.info?.institute || "",
        streak: gfgData.info?.currentStreak || 0,
        maxStreak: gfgData.info?.maxStreak || 0,
        solvedQuestions: {
          medium: gfgData.solvedStats?.medium || { questions: [] },
          easy: gfgData.solvedStats?.easy || { questions: [] },
          basic: gfgData.solvedStats?.basic || { questions: [] }
        },
        loading: false,
        error: null
      });
    } catch (error: any) {
      console.error("Error fetching GFG stats:", error);
      setGfgStats(prev => ({
        ...prev,
        loading: false, 
        error: error.message || "Failed to fetch GFG stats"
      }));
      toast.error(`Error fetching GFG stats: ${error.message || "Unknown error"}`);
    }
  };

  const handleAddPlatform = async (platformId: string) => {
    if (!platformUsername[platformId] || platformUsername[platformId].trim() === "") {
      toast.error("Please enter a valid username");
      return;
    }

    const platform = availablePlatforms.find(p => p.id === platformId);
    if (!platform || !user) return;

    // Set loading state for this platform
    setIsLoading(prev => ({ ...prev, [platformId]: true }));

    try {
      // Check if platform already exists
      const existingPlatforms = user.platforms || [];
      if (existingPlatforms.some(p => p.name.toLowerCase() === platform.name.toLowerCase())) {
        toast.error(`${platform.name} is already connected`);
        setIsLoading(prev => ({ ...prev, [platformId]: false }));
        return;
      }

      let verified = false;
      
      // For LeetCode and GFG, verify the user exists before adding
      if (platformId === "leetcode") {
        try {
          const { data, error } = await supabase.functions.invoke('leetcode-data', {
            body: { username: platformUsername[platformId] }
          });
          
          if (error || data.error) {
            throw new Error(data?.error || "User not found on LeetCode");
          }
          verified = true;
        } catch (error: any) {
          toast.error(`Verification failed: ${error.message || "User not found on LeetCode"}`);
          setIsLoading(prev => ({ ...prev, [platformId]: false }));
          return;
        }
      } else if (platformId === "gfg") {
        try {
          const { data, error } = await supabase.functions.invoke('gfg-data', {
            body: { username: platformUsername[platformId] }
          });
          
          if (error || data.error) {
            throw new Error(data?.error || "User not found on GeeksforGeeks");
          }
          verified = true;
        } catch (error: any) {
          toast.error(`Verification failed: ${error.message || "User not found on GeeksforGeeks"}`);
          setIsLoading(prev => ({ ...prev, [platformId]: false }));
          return;
        }
      } else {
        // Mock verification for other platforms
        verified = true;
      }

      // Add platform to database
      const { error } = await supabase
        .from('platforms')
        .insert({
          user_id: user.id,
          name: platform.name,
          username: platformUsername[platformId],
          verified: verified,
        });

      if (error) {
        throw error;
      }

      // Refresh user data
      await fetchUserData();
      toast.success(`${platform.name} connected successfully!`);
      setPlatformUsername(prev => ({ ...prev, [platformId]: "" }));
      
      // Fetch stats right away
      if (platformId === "leetcode") {
        fetchLeetCodeStats(platformUsername[platformId]);
      } else if (platformId === "gfg") {
        fetchGFGStats(platformUsername[platformId]);
      }
    } catch (error: any) {
      console.error("Error adding platform:", error);
      toast.error(`Failed to connect ${platform.name}: ${error.message || "Unknown error"}`);
    } finally {
      setIsLoading(prev => ({ ...prev, [platformId]: false }));
    }
  };

  const handleRemovePlatform = async (platformId: string) => {
    if (!user?.platforms) return;
    
    const platformToRemove = user.platforms.find(p => p.id === platformId);
    if (!platformToRemove) return;

    setIsLoading(prev => ({ ...prev, [platformId]: true }));
    
    try {
      const { error } = await supabase
        .from('platforms')
        .delete()
        .eq('id', platformId);
      
      if (error) {
        throw error;
      }
      
      // Remove stats for this platform
      if (platformToRemove.name.toLowerCase() === "leetcode") {
        setLeetcodeStats(defaultLeetCodeStats);
      } else if (platformToRemove.name.toLowerCase() === "geeksforgeeks") {
        setGfgStats(defaultGFGStats);
      }
      
      // Refresh user data
      await fetchUserData();
      toast.success(`${platformToRemove.name} removed successfully`);
    } catch (error: any) {
      console.error("Error removing platform:", error);
      toast.error(`Failed to remove platform: ${error.message || "Unknown error"}`);
    } finally {
      setIsLoading(prev => ({ ...prev, [platformId]: false }));
    }
  };

  const renderLeetCodeStats = (platform: any) => {
    if (platform.name.toLowerCase() !== "leetcode") return null;
    
    const stats = leetcodeStats;
    
    if (stats.loading) {
      return (
        <div className="mt-4 text-center">
          <Loader2 className="h-5 w-5 animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground mt-2">
            Loading stats...
          </p>
        </div>
      );
    }
    
    if (stats.error) {
      return (
        <div className="mt-4">
          <Alert variant="destructive">
            <AlertDescription>{stats.error}</AlertDescription>
          </Alert>
          <div className="mt-2 text-center">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => fetchLeetCodeStats(platform.username)}
            >
              Retry
            </Button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2">User Stats</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          <div className="p-2 bg-secondary/20 rounded">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="font-semibold">{stats.totalSolved}</p>
          </div>
          <div className="p-2 bg-green-500/20 rounded">
            <p className="text-xs text-muted-foreground">Easy</p>
            <p className="font-semibold text-green-600">{stats.easySolved}</p>
          </div>
          <div className="p-2 bg-yellow-500/20 rounded">
            <p className="text-xs text-muted-foreground">Medium</p>
            <p className="font-semibold text-yellow-600">{stats.mediumSolved}</p>
          </div>
          <div className="p-2 bg-red-500/20 rounded">
            <p className="text-xs text-muted-foreground">Hard</p>
            <p className="font-semibold text-red-600">{stats.hardSolved}</p>
          </div>
        </div>
        
        {stats.ranking > 0 && (
          <div className="mb-4">
            <p className="text-sm">
              <span className="text-muted-foreground">Ranking:</span>{" "}
              <span className="font-medium">{stats.ranking.toLocaleString()}</span>
            </p>
          </div>
        )}
        
        <div className="mt-4 text-center">
          <a 
            href={`https://leetcode.com/${platform.username}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs flex items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            View Profile <ExternalLink size={12} />
          </a>
        </div>
      </div>
    );
  };

  const renderGFGStats = (platform: any) => {
    if (platform.name.toLowerCase() !== "geeksforgeeks") return null;
    
    const stats = gfgStats;
    
    if (stats.loading) {
      return (
        <div className="mt-4 text-center">
          <Loader2 className="h-5 w-5 animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground mt-2">
            Loading stats...
          </p>
        </div>
      );
    }
    
    if (stats.error) {
      return (
        <div className="mt-4">
          <Alert variant="destructive">
            <AlertDescription>{stats.error}</AlertDescription>
          </Alert>
          <div className="mt-2 text-center">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => fetchGFGStats(platform.username)}
            >
              Retry
            </Button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2">User Stats</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          <div className="p-2 bg-secondary/20 rounded">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="font-semibold">{stats.totalSolved}</p>
          </div>
          <div className="p-2 bg-green-500/20 rounded">
            <p className="text-xs text-muted-foreground">Easy</p>
            <p className="font-semibold text-green-600">{stats.easySolved}</p>
          </div>
          <div className="p-2 bg-yellow-500/20 rounded">
            <p className="text-xs text-muted-foreground">Medium</p>
            <p className="font-semibold text-yellow-600">{stats.mediumSolved}</p>
          </div>
          <div className="p-2 bg-purple-500/20 rounded">
            <p className="text-xs text-muted-foreground">Basic</p>
            <p className="font-semibold text-purple-600">{stats.basicSolved}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
          <div className="p-2 bg-secondary/20 rounded">
            <p className="text-xs text-muted-foreground">Coding Score</p>
            <p className="font-semibold">{stats.codingScore}</p>
          </div>
          <div className="p-2 bg-secondary/20 rounded">
            <p className="text-xs text-muted-foreground">Current Streak</p>
            <p className="font-semibold">{stats.streak} days</p>
          </div>
        </div>
        
        {stats.institute && (
          <div className="mb-4">
            <p className="text-sm">
              <span className="text-muted-foreground">Institute:</span>{" "}
              <span className="font-medium">{stats.institute}</span>
            </p>
          </div>
        )}
        
        <div className="mt-4 text-center">
          <a 
            href={`https://auth.geeksforgeeks.org/user/${platform.username}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs flex items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            View Profile <ExternalLink size={12} />
          </a>
        </div>
      </div>
    );
  };

  const renderPlatformStats = (platform: any) => {
    if (platform.name.toLowerCase() === "leetcode") {
      return renderLeetCodeStats(platform);
    } else if (platform.name.toLowerCase() === "geeksforgeeks") {
      return renderGFGStats(platform);
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Platforms</h1>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Connected Platforms</CardTitle>
          <CardDescription>
            Your verified coding platform accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {user?.platforms && user.platforms.length > 0 ? (
            <ul className="space-y-6">
              {user.platforms.map((platform) => (
                <li
                  key={platform.id}
                  className="p-4 rounded-md bg-secondary/30"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="font-medium">{platform.name}</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-muted-foreground">
                        {platform.username}
                      </span>
                      {platform.verified && (
                        <span className="flex items-center justify-center w-5 h-5 bg-green-500/20 text-green-500 rounded-full">
                          <Check size={12} />
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemovePlatform(platform.id)}
                        disabled={isLoading[platform.id]}
                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      >
                        {isLoading[platform.id] ? (
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  {renderPlatformStats(platform)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No platforms connected yet. Add your first platform below.
            </p>
          )}
        </CardContent>
      </Card>

      <h2 className="text-xl font-semibold mt-8 mb-4">Add New Platform</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availablePlatforms.map((platform) => (
          <Card key={platform.id} className="glass-card overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2">
                <span className="w-8 h-8 bg-white rounded-md flex items-center justify-center overflow-hidden">
                  <img
                    src={platform.logoUrl}
                    alt={platform.name}
                    className="w-6 h-6 object-contain"
                  />
                </span>
                <span>{platform.name}</span>
              </CardTitle>
              <CardDescription>{platform.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <Input
                    placeholder={`Enter ${platform.name} username`}
                    value={platformUsername[platform.id] || ""}
                    onChange={(e) =>
                      setPlatformUsername({
                        ...platformUsername,
                        [platform.id]: e.target.value,
                      })
                    }
                    className="bg-background/50"
                  />
                  <Button
                    onClick={() => handleAddPlatform(platform.id)}
                    disabled={isLoading[platform.id]}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isLoading[platform.id] ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                    ) : (
                      "Add"
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Platforms;
