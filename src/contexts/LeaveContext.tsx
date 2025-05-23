
import React, { createContext, useContext, useState, useEffect } from "react";
import { LeaveRequest } from "@/types";
import { useAuth } from "./AuthContext";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

  const mapDbLeaveToLeaveRequest = (dbLeave: any, userData?: any): LeaveRequest => {
    return {
      id: dbLeave.id,
      userId: dbLeave.user_id,
      userName: userData?.name || "Unknown User",
      userRole: userData?.role || "student",
      type: dbLeave.type,
      startDate: dbLeave.start_date,
      endDate: dbLeave.end_date,
      reason: dbLeave.reason,
      status: dbLeave.status,
      reviewedBy: dbLeave.reviewed_by || undefined,
      reviewedAt: dbLeave.reviewed_at || undefined,
      comments: dbLeave.comments || undefined,
      createdAt: dbLeave.created_at,
    };
  };

  const refreshLeaves = async () => {
    if (!user) {
      setUserLeaves([]);
      setAllLeaves([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Fetch user's leave requests
      const { data: userLeavesData, error: userLeavesError } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('user_id', user.id);
      
      if (userLeavesError) {
        console.error("Error fetching user leaves:", userLeavesError);
      } else if (userLeavesData) {
        const mappedUserLeaves = userLeavesData.map(leave => 
          mapDbLeaveToLeaveRequest(leave, user)
        );
        setUserLeaves(mappedUserLeaves);
      }
      
      // If admin, fetch all leave requests with user details
      if (user.role === "admin") {
        const { data: allLeavesData, error: allLeavesError } = await supabase
          .from('leave_requests')
          .select(`
            *,
            users:user_id (
              id, name, role
            )
          `);
        
        if (allLeavesError) {
          console.error("Error fetching all leaves:", allLeavesError);
        } else if (allLeavesData) {
          const mappedAllLeaves = allLeavesData.map(leave => {
            const userData = leave.users;
            return mapDbLeaveToLeaveRequest(leave, userData);
          });
          setAllLeaves(mappedAllLeaves);
        }
      } else {
        setAllLeaves([]);
      }
    } catch (error) {
      console.error("Error refreshing leaves:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshLeaves();
  }, [user]);

  const createLeaveRequest = async (leaveData: Omit<LeaveRequest, "id" | "userId" | "userName" | "userRole" | "status" | "createdAt">) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('leave_requests')
        .insert({
          user_id: user.id,
          type: leaveData.type,
          start_date: leaveData.startDate,
          end_date: leaveData.endDate,
          reason: leaveData.reason,
          status: 'pending'
        })
        .select()
        .single();
      
      if (error) {
        toast({
          title: "Submission Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Leave Request Submitted",
        description: "Your leave application has been submitted successfully.",
      });
      
      refreshLeaves();
    } catch (error) {
      console.error("Error creating leave request:", error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit leave application. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateLeave = async (leaveId: string, status: "approved" | "rejected", comments?: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('leave_requests')
        .update({
          status: status,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          comments: comments
        })
        .eq('id', leaveId);
        
      if (error) {
        toast({
          title: "Update Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: `Leave Request ${status === "approved" ? "Approved" : "Rejected"}`,
        description: `The leave application has been ${status}.`,
      });
      
      refreshLeaves();
    } catch (error) {
      console.error("Error updating leave:", error);
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
