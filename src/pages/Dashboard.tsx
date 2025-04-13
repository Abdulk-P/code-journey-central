
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user || !user.stats) {
    return <div>Loading dashboard data...</div>;
  }

  const { totalQuestions, activeDays, topicAnalysis, problemsSolvedByDay } = user.stats;

  // Colors for the pie chart
  const COLORS = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#7c3aed', '#6d28d9'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

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
            <CardTitle className="text-3xl">{user.platforms?.length || 0}</CardTitle>
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
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Platforms</CardTitle>
            <CardDescription>
              Your connected coding platforms
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user.platforms && user.platforms.length > 0 ? (
              <ul className="space-y-3">
                {user.platforms.map((platform) => (
                  <li key={platform.name} className="flex items-center justify-between p-3 rounded-md bg-secondary/30">
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
