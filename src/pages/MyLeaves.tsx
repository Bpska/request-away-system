
import React from "react";
import { useLeave } from "@/contexts/LeaveContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const MyLeaves = () => {
  const { userLeaves, isLoading } = useLeave();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Leave History</h1>
        <Button asChild>
          <Link to="/apply">Apply for Leave</Link>
        </Button>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : userLeaves.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">You haven't applied for any leaves yet</p>
          <Button asChild>
            <Link to="/apply">Apply Now</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {userLeaves.map((leave) => (
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
      )}
    </div>
  );
};

export default MyLeaves;
