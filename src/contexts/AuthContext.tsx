
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Mock user type
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  country?: string;
  college?: string;
  degree?: string;
  branch?: string;
  graduationYear?: number;
  platforms?: {
    name: string;
    username: string;
    verified: boolean;
  }[];
  socials?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
    resume?: string;
  };
  stats?: {
    totalQuestions: number;
    activeDays: number;
    topicAnalysis: {
      topic: string;
      count: number;
    }[];
    problemsSolvedByDay: {
      date: string;
      count: number;
    }[];
  };
}

// Mock user data
const mockUser: User = {
  id: "1",
  firstName: "AbdulKhadar",
  lastName: "Patel",
  email: "abdul@example.com",
  avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=AbdulKhadar",
  bio: "Passionate coder solving DSA problems daily.",
  country: "India",
  college: "ABC Engineering College",
  degree: "B.Tech",
  branch: "Computer Science",
  graduationYear: 2023,
  platforms: [
    { name: "LeetCode", username: "abdulkhadar0", verified: true },
    { name: "GeeksforGeeks", username: "abdulkha86f0", verified: true }
  ],
  socials: {
    linkedin: "https://linkedin.com/in/abdulkhadar",
    twitter: "https://twitter.com/abdulkhadar",
    website: "https://abdulkhadar.dev",
    resume: "https://drive.google.com/file/resume"
  },
  stats: {
    totalQuestions: 38,
    activeDays: 31,
    topicAnalysis: [
      { topic: "Arrays", count: 12 },
      { topic: "Strings", count: 8 },
      { topic: "Dynamic Programming", count: 7 },
      { topic: "Trees", count: 6 },
      { topic: "Graphs", count: 5 }
    ],
    problemsSolvedByDay: [
      { date: "2023-04-01", count: 2 },
      { date: "2023-04-02", count: 1 },
      { date: "2023-04-03", count: 3 },
      { date: "2023-04-04", count: 0 },
      { date: "2023-04-05", count: 2 },
      { date: "2023-04-06", count: 1 },
      { date: "2023-04-07", count: 2 }
    ]
  }
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
  updateUserInfo: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Mock login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock validation
      if (email && password) {
        setUser(mockUser);
        setIsAuthenticated(true);
        localStorage.setItem("user", JSON.stringify(mockUser));
        navigate("/dashboard");
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Mock signup function
  const signup = async (email: string, password: string, firstName: string, lastName: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a new user
      const newUser = {
        ...mockUser,
        id: Date.now().toString(),
        firstName,
        lastName,
        email,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${lastName}`,
      };
      
      setUser(newUser);
      setIsAuthenticated(true);
      localStorage.setItem("user", JSON.stringify(newUser));
      navigate("/onboarding/basic-info");
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
    navigate("/");
  };

  // Update user info
  const updateUserInfo = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoading, 
      login, 
      signup, 
      logout,
      updateUserInfo
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
