
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "@/types";
import { findUserByEmail, users } from "@/lib/mock-data";
import { toast } from "@/components/ui/use-toast";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, role: UserRole, department?: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In a real app, password would be validated on server
      // For this demo, we'll just check if the user exists by email
      // and assume any password is valid
      const foundUser = findUserByEmail(email);
      
      if (foundUser) {
        setUser(foundUser);
        localStorage.setItem("user", JSON.stringify(foundUser));
        toast({
          title: "Login Successful",
          description: `Welcome back, ${foundUser.name}!`,
        });
        return true;
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid email or password.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Login Error",
        description: "An error occurred during login.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, role: UserRole, department?: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // In a real app, this would call an API to register the user
      // For this demo, we'll simulate success but not actually store new users
      
      // Check if user already exists
      const existingUser = findUserByEmail(email);
      if (existingUser) {
        toast({
          title: "Registration Failed",
          description: "A user with this email already exists.",
          variant: "destructive",
        });
        return false;
      }
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Create mock user (in a real app, this would be saved to a database)
      const newUser: User = {
        id: `user${users.length + 1}`,
        name,
        email,
        role,
        department: department || undefined,
      };
      
      if (role === 'student') {
        newUser.studentId = `ST${Math.floor(10000 + Math.random() * 90000)}`;
      } else if (role === 'faculty') {
        newUser.facultyId = `FAC${Math.floor(100 + Math.random() * 900)}`;
      }
      
      // In a real app, we would add the user to the database here
      // For this demo, we'll just log in with the new user data
      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
      
      toast({
        title: "Registration Successful",
        description: `Welcome, ${name}!`,
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Registration Error",
        description: "An error occurred during registration.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
