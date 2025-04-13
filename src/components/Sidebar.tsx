
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  LayoutDashboard, 
  BookOpen, 
  User, 
  Link as LinkIcon, 
  Settings, 
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, closeSidebar }) => {
  const { user } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { path: "/platforms", label: "Platforms", icon: <BookOpen size={20} /> },
    { path: "/profile", label: "Profile", icon: <User size={20} /> },
    { path: "/socials", label: "Socials", icon: <LinkIcon size={20} /> },
    { path: "/settings", label: "Settings", icon: <Settings size={20} /> }
  ];

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-secondary transform transition-transform duration-200 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-secondary flex items-center justify-between">
          <Link to="/dashboard" className="text-xl font-bold text-purple-400">
            ProgressBuddy
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={closeSidebar}
            className="md:hidden"
          >
            <X size={20} />
          </Button>
        </div>

        {user && (
          <div className="p-4 border-b border-secondary">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={user.avatarUrl} />
                <AvatarFallback className="bg-purple-800">
                  {user.firstName.charAt(0)}
                  {user.lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-sm text-muted-foreground">{user.email}</div>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center space-x-2 px-3 py-2 rounded-md transition-colors",
                location.pathname === item.path
                  ? "bg-purple-600/20 text-purple-400"
                  : "text-foreground hover:bg-secondary"
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
