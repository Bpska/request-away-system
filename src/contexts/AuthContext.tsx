
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: UserRole, department?: string) => Promise<boolean>;
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
          // Fetch user profile data from our users table
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
      console.log("Auth state changed:", event, session?.user?.email);
      
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

  const register = async (name: string, email: string, password: string, role: UserRole, department?: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // First, create the auth user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (authError) {
        toast({
          title: "Registration Failed",
          description: authError.message,
          variant: "destructive",
        });
        return false;
      }
      
      if (authData.user) {
        // Then insert the user profile data into our users table
        const userData = {
          id: authData.user.id,
          name: name,
          email: email,
          role: role,
          department: department || null,
          student_id: role === 'student' ? `ST${Math.floor(10000 + Math.random() * 90000)}` : null,
          faculty_id: role === 'faculty' ? `FAC${Math.floor(1000 + Math.random() * 9000)}` : null
        };

        const { error: profileError } = await supabase
          .from('users')
          .insert(userData);
          
        if (profileError) {
          console.error("Profile creation error:", profileError);
          toast({
            title: "Account Creation Issue",
            description: "Your account was created but profile setup failed. Please contact support.",
            variant: "destructive",
          });
          return false;
        }
        
        toast({
          title: "Registration Successful",
          description: "Your account has been created! Please check your email to verify your account.",
        });
        return true;
      }
      
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
