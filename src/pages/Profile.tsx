
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">User Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle>{user?.name}</CardTitle>
          <CardDescription>{user?.email}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-gray-500">Role</h3>
            <p className="capitalize">{user?.role}</p>
          </div>

          {user?.department && (
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-gray-500">Department</h3>
              <p>{user.department}</p>
            </div>
          )}

          {user?.studentId && (
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-gray-500">Student ID</h3>
              <p>{user.studentId}</p>
            </div>
          )}

          {user?.facultyId && (
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-gray-500">Faculty ID</h3>
              <p>{user.facultyId}</p>
            </div>
          )}

          <div className="pt-4">
            <Button 
              variant="outline" 
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
