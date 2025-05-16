
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLeave } from "@/contexts/LeaveContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();
  const { userLeaves, allLeaves } = useLeave();

  // Count leaves by status
  const pendingLeaves = userLeaves.filter(leave => leave.status === "pending").length;
  const approvedLeaves = userLeaves.filter(leave => leave.status === "approved").length;
  const rejectedLeaves = userLeaves.filter(leave => leave.status === "rejected").length;

  // For admins, count all pending requests
  const adminPendingLeaves = allLeaves.filter(leave => leave.status === "pending").length;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Welcome, {user?.name}</h1>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-leave-pending">Pending</CardTitle>
            <CardDescription>Leave requests awaiting approval</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{pendingLeaves}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-leave-approved">Approved</CardTitle>
            <CardDescription>Approved leave requests</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{approvedLeaves}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-leave-rejected">Rejected</CardTitle>
            <CardDescription>Rejected leave requests</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{rejectedLeaves}</p>
          </CardContent>
        </Card>
      </div>

      {user?.role === "admin" && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Administrator Dashboard</CardTitle>
            <CardDescription>Review and manage leave applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg">Pending Requests: <span className="font-bold">{adminPendingLeaves}</span></p>
                <p className="text-sm text-gray-500">Requires your attention</p>
              </div>
              <Button asChild>
                <Link to="/admin">View All Requests</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Apply for Leave</CardTitle>
            <CardDescription>Submit a new leave application</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/apply">Apply Now</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Leave History</CardTitle>
            <CardDescription>View and track your leave requests</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link to="/my-leaves">View History</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
