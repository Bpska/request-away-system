
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [demoUsers, setDemoUsers] = useState<{id: string, name: string, email: string, role: string}[]>([]);

  // Fetch demo users from Supabase
  React.useEffect(() => {
    const fetchDemoUsers = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role')
        .limit(5);
        
      if (error) {
        console.error("Error fetching demo users:", error);
      } else if (data) {
        setDemoUsers(data);
      }
    };
    
    fetchDemoUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await login(email, "demo-password");
      if (success) {
        navigate("/dashboard");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-leave-light">
      <div className="w-full max-w-md px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-leave-primary mb-2">Leave Application System</h1>
          <p className="text-gray-600">Sign in to access your account</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@institution.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter any password for demo"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-500">For demo, any password works</p>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col">
            <div className="text-center mt-4 mb-2">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link to="/signup" className="text-leave-primary hover:underline">
                  Sign up here
                </Link>
              </p>
            </div>
            <div className="text-sm text-gray-500 mt-4">
              <p className="font-semibold">Demo Accounts:</p>
              <ul className="mt-2 space-y-1">
                {demoUsers.map(user => (
                  <li key={user.id} className="flex justify-between">
                    <span>{user.name} ({user.role})</span>
                    <span className="text-leave-primary cursor-pointer" 
                      onClick={() => setEmail(user.email)}>
                      {user.email}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-center">For demo purposes, any password will work</p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
