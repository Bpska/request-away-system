
import React, { createContext, useContext, useState, useEffect } from "react";
import { LeaveRequest } from "@/types";
import { 
  getUserLeaveRequests, 
  getAllLeaveRequests, 
  addLeaveRequest, 
  updateLeaveStatus 
} from "@/lib/mock-data";
import { useAuth } from "./AuthContext";
import { toast } from "@/components/ui/use-toast";

interface LeaveContextType {
  userLeaves: LeaveRequest[];
  allLeaves: LeaveRequest[];
  isLoading: boolean;
  createLeaveRequest: (leaveData: Omit<LeaveRequest, "id" | "userId" | "userName" | "userRole" | "status" | "createdAt">) => void;
  updateLeave: (leaveId: string, status: "approved" | "rejected", comments?: string) => void;
  refreshLeaves: () => void;
}

const LeaveContext = createContext<LeaveContextType | undefined>(undefined);

export function LeaveProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [userLeaves, setUserLeaves] = useState<LeaveRequest[]>([]);
  const [allLeaves, setAllLeaves] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshLeaves = () => {
    if (user) {
      setUserLeaves(getUserLeaveRequests(user.id));
      
      // If admin, get all leaves
      if (user.role === "admin") {
        setAllLeaves(getAllLeaveRequests());
      } else {
        setAllLeaves([]);
      }
    } else {
      setUserLeaves([]);
      setAllLeaves([]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    refreshLeaves();
  }, [user]);

  const createLeaveRequest = (leaveData: Omit<LeaveRequest, "id" | "userId" | "userName" | "userRole" | "status" | "createdAt">) => {
    if (!user) return;
    
    try {
      const newLeave = addLeaveRequest({
        ...leaveData,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        status: "pending"
      });
      
      setUserLeaves(prev => [...prev, newLeave]);
      
      toast({
        title: "Leave Request Submitted",
        description: "Your leave application has been submitted successfully.",
      });
      
      refreshLeaves();
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Failed to submit leave application. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateLeave = (leaveId: string, status: "approved" | "rejected", comments?: string) => {
    if (!user) return;
    
    try {
      const updatedLeave = updateLeaveStatus(leaveId, status, user.name, comments);
      
      if (updatedLeave) {
        toast({
          title: `Leave Request ${status === "approved" ? "Approved" : "Rejected"}`,
          description: `The leave application has been ${status}.`,
        });
        
        refreshLeaves();
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update leave status. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <LeaveContext.Provider value={{ 
      userLeaves, 
      allLeaves, 
      isLoading, 
      createLeaveRequest,
      updateLeave,
      refreshLeaves
    }}>
      {children}
    </LeaveContext.Provider>
  );
}

export function useLeave() {
  const context = useContext(LeaveContext);
  if (context === undefined) {
    throw new Error("useLeave must be used within a LeaveProvider");
  }
  return context;
}
