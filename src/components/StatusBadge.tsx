
import React from "react";
import { LeaveStatus } from "@/types";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: LeaveStatus;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  return (
    <span className={cn(
      "status-badge",
      status === "pending" && "status-pending",
      status === "approved" && "status-approved",
      status === "rejected" && "status-rejected"
    )}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default StatusBadge;
