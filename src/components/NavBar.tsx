
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "lucide-react";

const NavBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Link to="/dashboard" className="text-xl font-bold text-leave-primary">
            Leave System
          </Link>
        </div>

        {user && (
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/dashboard"
              className="text-gray-600 hover:text-leave-primary transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/apply"
              className="text-gray-600 hover:text-leave-primary transition-colors"
            >
              Apply for Leave
            </Link>
            <Link
              to="/my-leaves"
              className="text-gray-600 hover:text-leave-primary transition-colors"
            >
              My Leaves
            </Link>
            {user.role === "admin" && (
              <Link
                to="/admin"
                className="text-gray-600 hover:text-leave-primary transition-colors"
              >
                Admin Panel
              </Link>
            )}
          </nav>
        )}

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                {user.name} ({user.role})
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button asChild>
            <Link to="/">Login</Link>
          </Button>
        )}
      </div>
    </header>
  );
};

export default NavBar;
