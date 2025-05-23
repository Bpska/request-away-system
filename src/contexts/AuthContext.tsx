
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "@/types";
import { supabase } from "@/integrations/supabase/client";
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
    // Check for existing session when component mounts
    const checkSession = async () => {
      setIsLoading(true);
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Fetch user profile data
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (error) {
            console.error("Error fetching user data:", error);
            setUser(null);
          } else if (data) {
            setUser({
              id: data.id,
              name: data.name,
              email: data.email,
              role: data.role,
              department: data.department || undefined,
              studentId: data.student_id || undefined,
              facultyId: data.faculty_id || undefined
            });
          }
        }
      } catch (error) {
        console.error("Session check error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Fetch user profile when signed in
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (data && !error) {
          setUser({
            id: data.id,
            name: data.name,
            email: data.email,
            role: data.role,
            department: data.department || undefined,
            studentId: data.student_id || undefined,
            facultyId: data.faculty_id || undefined
          });
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    checkSession();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }
      
      if (data.user) {
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Login error:", error);
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
      // For demo purposes, we'll just look up users from the existing database
      // In a real app with proper authentication, we would create new users
      const { data: existingUser, error: lookupError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
        
      if (lookupError && lookupError.code !== 'PGRST116') {
        // PGRST116 means no rows returned, which is expected for new users
        toast({
          title: "Registration Failed",
          description: "Error checking existing users.",
          variant: "destructive",
        });
        return false;
      }
      
      if (existingUser) {
        // If user exists, try to sign in with that email (for demo purposes)
        // In a real app, we would notify that the user already exists
        return await login(email, "any-password-for-demo");
      }
      
      // This is a demo app, so we'll allow "registration" by just logging in
      // with any of the pre-created users in the database
      toast({
        title: "Demo Mode",
        description: "In this demo, please use one of the pre-created users.",
      });
      
      return false;
    } catch (error) {
      console.error("Registration error:", error);
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

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error("Sign out error:", error);
      toast({
        title: "Logout Error",
        description: "An error occurred during logout.",
        variant: "destructive",
      });
    } else {
      setUser(null);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    }
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
