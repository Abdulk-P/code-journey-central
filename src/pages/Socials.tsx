
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Linkedin, Twitter, Globe, FileText } from "lucide-react";

const Socials: React.FC = () => {
  const { user, updateUserInfo } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [socials, setSocials] = useState({
    linkedin: '',
    twitter: '',
    website: '',
    resume: '',
  });

  // Update form when user data changes
  useEffect(() => {
    if (user && user.socials) {
      setSocials({
        linkedin: user.socials.linkedin || '',
        twitter: user.socials.twitter || '',
        website: user.socials.website || '',
        resume: user.socials.resume || '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSocials(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await updateUserInfo({ socials });
      toast.success("Social profiles updated successfully");
    } catch (error) {
      console.error("Error updating socials:", error);
      toast.error("Failed to update social profiles");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Social Profiles</h1>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Connect Your Social Profiles</CardTitle>
          <CardDescription>
            Link your professional profiles and resume
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Linkedin className="text-purple-400" size={20} />
                <div className="flex-1 space-y-2">
                  <label htmlFor="linkedin" className="text-sm font-medium">
                    LinkedIn
                  </label>
                  <Input
                    id="linkedin"
                    name="linkedin"
                    placeholder="https://linkedin.com/in/yourusername"
                    value={socials.linkedin}
                    onChange={handleChange}
                    className="bg-background/50"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Twitter className="text-purple-400" size={20} />
                <div className="flex-1 space-y-2">
                  <label htmlFor="twitter" className="text-sm font-medium">
                    Twitter
                  </label>
                  <Input
                    id="twitter"
                    name="twitter"
                    placeholder="https://twitter.com/yourusername"
                    value={socials.twitter}
                    onChange={handleChange}
                    className="bg-background/50"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Globe className="text-purple-400" size={20} />
                <div className="flex-1 space-y-2">
                  <label htmlFor="website" className="text-sm font-medium">
                    Personal Website
                  </label>
                  <Input
                    id="website"
                    name="website"
                    placeholder="https://yourwebsite.com"
                    value={socials.website}
                    onChange={handleChange}
                    className="bg-background/50"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <FileText className="text-purple-400" size={20} />
                <div className="flex-1 space-y-2">
                  <label htmlFor="resume" className="text-sm font-medium">
                    Resume URL
                  </label>
                  <Input
                    id="resume"
                    name="resume"
                    placeholder="https://drive.google.com/file/youresume"
                    value={socials.resume}
                    onChange={handleChange}
                    className="bg-background/50"
                  />
                </div>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="bg-purple-600 hover:bg-purple-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Why Connect Social Profiles?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">Showcase Your Work</h3>
            <p className="text-muted-foreground text-sm">
              Link your profiles to give recruiters and peers a complete view of your coding journey and projects.
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium">Build Your Network</h3>
            <p className="text-muted-foreground text-sm">
              Connect with other developers who share similar interests and skill levels.
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium">Get Discovered</h3>
            <p className="text-muted-foreground text-sm">
              When you make your profile public, recruiters can find your unified coding profile with all your achievements.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Socials;
