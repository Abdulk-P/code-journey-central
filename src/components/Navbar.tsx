
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, Code } from "lucide-react";
import { toast } from "sonner";

interface NavbarProps {
  toggleSidebar?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Successfully logged out");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out. Please try again.");
    }
  };

  return (
    <nav className="border-b border-secondary px-4 py-3 flex items-center justify-between bg-background">
      <div className="flex items-center">
        {toggleSidebar && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="mr-2 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <Link to="/" className="text-xl font-bold text-purple-400 flex items-center">
          <Code className="h-5 w-5 mr-1" /> ProgressBuddy
        </Link>
      </div>

      <div className="hidden md:flex items-center space-x-6">
        <Link to="/#features" className="text-sm hover:text-purple-400 transition-colors">Features</Link>
        <Link to="/#about" className="text-sm hover:text-purple-400 transition-colors">About</Link>
        <Link to="/#contact" className="text-sm hover:text-purple-400 transition-colors">Contact Us</Link>
      </div>

      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <>
            <div className="hidden md:flex items-center gap-2">
              <div className="text-sm text-muted-foreground">
                {user?.firstName} {user?.lastName}
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex gap-2">
            <Button variant="ghost" asChild>
              <Link to="/signin">Sign In</Link>
            </Button>
            <Button variant="default" className="bg-purple-600 hover:bg-purple-700" asChild>
              <Link to="/signup">Sign Up</Link>
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
