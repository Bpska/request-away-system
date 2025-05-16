
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLeave } from "@/contexts/LeaveContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Navigate } from "react-router-dom";

const AdminPanel = () => {
  const { user } = useAuth();
  const { allLeaves, updateLeave } = useLeave();
  const [selectedLeaveId, setSelectedLeaveId] = useState<string | null>(null);
  const [action, setAction] = useState<"approved" | "rejected" | null>(null);
  const [comments, setComments] = useState("");
  
  // Only admins can access this page
  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" />;
  }
  
  const pendingLeaves = allLeaves.filter(leave => leave.status === "pending");
  const approvedLeaves = allLeaves.filter(leave => leave.status === "approved");
  const rejectedLeaves = allLeaves.filter(leave => leave.status === "rejected");
  
  const handleOpenDialog = (leaveId: string, action: "approved" | "rejected") => {
    setSelectedLeaveId(leaveId);
    setAction(action);
    setComments("");
  };
  
  const handleCloseDialog = () => {
    setSelectedLeaveId(null);
    setAction(null);
    setComments("");
  };
  
  const handleConfirmAction = () => {
    if (selectedLeaveId && action) {
      updateLeave(selectedLeaveId, action, comments);
      handleCloseDialog();
    }
  };
  
  const renderLeaveList = (leaves: typeof allLeaves) => {
    if (leaves.length === 0) {
      return <p className="text-center py-4 text-gray-500">No leaves found</p>;
    }
    
    return (
      <div className="space-y-4">
        {leaves.map(leave => (
          <Card key={leave.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{leave.type}</CardTitle>
                  <CardDescription>
                    {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                  </CardDescription>
                </div>
                <StatusBadge status={leave.status} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Applicant</h4>
                    <p className="font-medium">
                      {leave.userName} <span className="font-normal text-gray-500">({leave.userRole})</span>
                    </p>
                  </div>
                  
                  {leave.status === "pending" && (
                    <div className="flex space-x-2 mt-4 sm:mt-0">
                      <Button
                        variant="outline"
                        className="border-leave-rejected text-leave-rejected hover:bg-leave-rejected/10"
                        onClick={() => handleOpenDialog(leave.id, "reject")}
                      >
                        Reject
                      </Button>
                      <Button
                        className="bg-leave-approved hover:bg-leave-approved/80"
                        onClick={() => handleOpenDialog(leave.id, "approve")}
                      >
                        Approve
                      </Button>
                    </div>
                  )}
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Reason</h4>
                  <p>{leave.reason}</p>
                </div>
                
                {leave.reviewedBy && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-500">Reviewed by</h4>
                    <p>{leave.reviewedBy} on {new Date(leave.reviewedAt!).toLocaleDateString()}</p>
                    
                    {leave.comments && (
                      <div className="mt-2">
                        <h4 className="text-sm font-medium text-gray-500">Comments</h4>
                        <p className="italic">{leave.comments}</p>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="text-xs text-gray-400">
                  Applied on {new Date(leave.createdAt).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
      
      <Tabs defaultValue="pending">
        <TabsList className="mb-4">
          <TabsTrigger value="pending">
            Pending <span className="ml-2 bg-gray-200 px-2 rounded-full">{pendingLeaves.length}</span>
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved <span className="ml-2 bg-gray-200 px-2 rounded-full">{approvedLeaves.length}</span>
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected <span className="ml-2 bg-gray-200 px-2 rounded-full">{rejectedLeaves.length}</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
          {renderLeaveList(pendingLeaves)}
        </TabsContent>
        
        <TabsContent value="approved">
          {renderLeaveList(approvedLeaves)}
        </TabsContent>
        
        <TabsContent value="rejected">
          {renderLeaveList(rejectedLeaves)}
        </TabsContent>
      </Tabs>
      
      <Dialog open={selectedLeaveId !== null} onOpenChange={() => handleCloseDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === "approved" ? "Approve Leave Request" : "Reject Leave Request"}
            </DialogTitle>
            <DialogDescription>
              {action === "approved"
                ? "Are you sure you want to approve this leave request?"
                : "Are you sure you want to reject this leave request?"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <label htmlFor="comments" className="text-sm font-medium">
              Comments (optional)
            </label>
            <Textarea
              id="comments"
              placeholder="Add any additional comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAction}
              className={action === "approved" ? "bg-leave-approved" : "bg-leave-rejected"}
            >
              {action === "approved" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPanel;
