
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2, Check } from "lucide-react";

interface Platform {
  id: string;
  name: string;
  logoUrl: string;
  description: string;
}

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
  const { user, updateUserInfo } = useAuth();
  const [platformUsername, setPlatformUsername] = useState<Record<string, string>>({});

  const handleAddPlatform = (platformId: string) => {
    if (!platformUsername[platformId] || platformUsername[platformId].trim() === "") {
      toast.error("Please enter a valid username");
      return;
    }

    const platform = availablePlatforms.find(p => p.id === platformId);
    if (!platform) return;

    // Check if platform already exists
    const existingPlatforms = user?.platforms || [];
    if (existingPlatforms.some(p => p.name === platform.name)) {
      toast.error(`${platform.name} is already connected`);
      return;
    }

    const updatedPlatforms = [
      ...existingPlatforms,
      {
        name: platform.name,
        username: platformUsername[platformId],
        verified: true, // Mock verification (would be async in real app)
      },
    ];

    updateUserInfo({ platforms: updatedPlatforms });
    toast.success(`${platform.name} connected successfully!`);
    setPlatformUsername(prev => ({ ...prev, [platformId]: "" }));
  };

  const handleRemovePlatform = (platformName: string) => {
    if (!user?.platforms) return;
    
    const updatedPlatforms = user.platforms.filter(
      platform => platform.name !== platformName
    );
    
    updateUserInfo({ platforms: updatedPlatforms });
    toast.success(`${platformName} removed successfully`);
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
            <ul className="space-y-4">
              {user.platforms.map((platform) => (
                <li
                  key={platform.name}
                  className="flex items-center justify-between p-4 rounded-md bg-secondary/30"
                >
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
                      onClick={() => handleRemovePlatform(platform.name)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
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
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Add
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
