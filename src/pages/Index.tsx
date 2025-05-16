import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // If user is logged in, redirect to dashboard
    // Otherwise redirect to login page
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/");
    }
  }, [user, navigate]);
  
  return null;
};

export default Index;
