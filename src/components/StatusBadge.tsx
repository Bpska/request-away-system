
import React from "react";
import { LeaveStatus } from "@/types";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: LeaveStatus;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  return (
    <span className={cn(
      "px-2 py-1 text-xs font-medium rounded-full",
      status === "pending" && "bg-yellow-100 text-yellow-800",
      status === "approved" && "bg-green-100 text-green-800",
      status === "rejected" && "bg-red-100 text-red-800"
    )}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default StatusBadge;
