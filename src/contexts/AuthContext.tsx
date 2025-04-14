import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// User type based on database schema
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
  batchYear?: number;
  department?: string;
  collegeId?: string;
  role?: string;
  platforms?: {
    id: string;
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
  isAdmin?: boolean;
  adminColleges?: {
    id: string;
    name: string;
    title?: string;
  }[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
  updateUserInfo: (userData: Partial<User>) => Promise<void>;
  fetchUserData: () => Promise<void>;
  isCollegeAdmin: (collegeId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Initialize default stats (temporary until we integrate with actual platform APIs)
  const defaultStats = {
    totalQuestions: 0,
    activeDays: 0,
    topicAnalysis: [
      { topic: "Arrays", count: 0 },
      { topic: "Strings", count: 0 },
      { topic: "Dynamic Programming", count: 0 },
      { topic: "Trees", count: 0 },
      { topic: "Graphs", count: 0 }
    ],
    problemsSolvedByDay: Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return {
        date: date.toISOString().split('T')[0],
        count: 0
      };
    }).reverse()
  };

  // Function to fetch user data from Supabase
  const fetchUserData = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        setIsLoading(false);
        return;
      }

      // Fetch platforms data
      const { data: platformsData, error: platformsError } = await supabase
        .from('platforms')
        .select('*')
        .eq('user_id', authUser.id);

      if (platformsError) {
        console.error("Error fetching platforms:", platformsError);
      }

      // Fetch socials data
      const { data: socialsData, error: socialsError } = await supabase
        .from('socials')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      if (socialsError && socialsError.code !== 'PGRST116') {
        console.error("Error fetching socials:", socialsError);
      }

      // Fetch user roles
      const { data: userRoles, error: userRolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', authUser.id);

      if (userRolesError) {
        console.error("Error fetching user roles:", userRolesError);
      }

      const isAdmin = userRoles?.some(r => r.role === 'admin') || false;

      // Fetch admin colleges if user is an admin
      let adminColleges = [];
      if (isAdmin) {
        const { data: adminData, error: adminError } = await supabase
          .from('college_admins')
          .select(`
            id,
            title,
            college:colleges(id, name)
          `)
          .eq('user_id', authUser.id);

        if (adminError) {
          console.error("Error fetching admin colleges:", adminError);
        } else if (adminData) {
          adminColleges = adminData.map(item => ({
            id: item.college.id,
            name: item.college.name,
            title: item.title
          }));
        }
      }

      // Construct user object from data
      const userData: User = {
        id: authUser.id,
        firstName: profileData?.first_name || '',
        lastName: profileData?.last_name || '',
        email: profileData?.email || authUser.email || '',
        avatarUrl: profileData?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileData?.first_name || ''}${profileData?.last_name || ''}`,
        bio: profileData?.bio || '',
        country: profileData?.country || '',
        college: profileData?.college || '',
        degree: profileData?.degree || '',
        branch: profileData?.branch || '',
        graduationYear: profileData?.graduation_year,
        batchYear: profileData?.batch_year,
        department: profileData?.department,
        collegeId: profileData?.college_id,
        isAdmin,
        adminColleges: isAdmin ? adminColleges : [],
        platforms: platformsData?.map(p => ({
          id: p.id,
          name: p.name,
          username: p.username,
          verified: p.verified
        })) || [],
        socials: socialsData ? {
          linkedin: socialsData.linkedin || '',
          twitter: socialsData.twitter || '',
          website: socialsData.website || '',
          resume: socialsData.resume || ''
        } : {},
        stats: defaultStats  // Using default stats until platform API integration
      };

      setUser(userData);
      setIsAuthenticated(true);
      setIsLoading(false);
    } catch (error) {
      console.error("Error in fetchUserData:", error);
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };

  // Check if user is already logged in
  useEffect(() => {
    const setupAuth = async () => {
      try {
        setIsLoading(true);
        
        // Set up auth state listener
        const { data: { subscription } } = await supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (session && session.user) {
              await fetchUserData();
            } else {
              setUser(null);
              setIsAuthenticated(false);
              setIsLoading(false);
            }
          }
        );

        // Initial fetch
        await fetchUserData();

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Auth setup error:", error);
        setIsLoading(false);
      }
    };

    setupAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      await fetchUserData();
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Failed to sign in");
      setIsLoading(false);
      throw error;
    }
  };

  // Signup function
  const signup = async (email: string, password: string, firstName: string, lastName: string) => {
    setIsLoading(true);
    try {
      // Register the user
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName
          }
        }
      });

      if (error) {
        throw error;
      }

      // Update the profile with first and last name
      if (data.user) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            first_name: firstName,
            last_name: lastName,
            email: email
          })
          .eq('id', data.user.id);

        if (updateError) {
          console.error("Error updating profile:", updateError);
        }
      }

      await fetchUserData();
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || "Failed to create account");
      setIsLoading(false);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
        toast.error("Failed to sign out");
      } else {
        setUser(null);
        setIsAuthenticated(false);
        navigate("/");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Update user info
  const updateUserInfo = async (userData: Partial<User>) => {
    if (!user) return;

    try {
      // Update profile data if present
      if (userData.firstName || userData.lastName || userData.bio || userData.country || 
          userData.college || userData.degree || userData.branch || userData.graduationYear) {
        
        const { error } = await supabase
          .from('profiles')
          .update({
            first_name: userData.firstName !== undefined ? userData.firstName : user.firstName,
            last_name: userData.lastName !== undefined ? userData.lastName : user.lastName,
            bio: userData.bio !== undefined ? userData.bio : user.bio,
            country: userData.country !== undefined ? userData.country : user.country,
            college: userData.college !== undefined ? userData.college : user.college,
            degree: userData.degree !== undefined ? userData.degree : user.degree,
            branch: userData.branch !== undefined ? userData.branch : user.branch,
            graduation_year: userData.graduationYear !== undefined ? userData.graduationYear : user.graduationYear,
          })
          .eq('id', user.id);

        if (error) {
          console.error("Error updating profile:", error);
          toast.error("Failed to update profile");
          return;
        }
      }

      // Update socials if present
      if (userData.socials) {
        const { error } = await supabase
          .from('socials')
          .upsert({
            user_id: user.id,
            linkedin: userData.socials.linkedin || null,
            twitter: userData.socials.twitter || null,
            website: userData.socials.website || null,
            resume: userData.socials.resume || null,
          }, { onConflict: 'user_id' });

        if (error) {
          console.error("Error updating socials:", error);
          toast.error("Failed to update social profiles");
          return;
        }
      }

      // Fetch updated user data
      await fetchUserData();
    } catch (error) {
      console.error("Update user info error:", error);
      toast.error("Failed to update user information");
    }
  };

  // Check if user is an admin for a specific college
  const isCollegeAdmin = (collegeId: string): boolean => {
    if (!user || !user.isAdmin || !user.adminColleges) return false;
    return user.adminColleges.some(college => college.id === collegeId);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoading, 
      login, 
      signup, 
      logout,
      updateUserInfo,
      fetchUserData,
      isCollegeAdmin
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
