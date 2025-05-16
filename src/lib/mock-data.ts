
import { User, LeaveRequest, UserRole } from "@/types";

// Mock users data
export const users: User[] = [
  {
    id: "user1",
    name: "John Student",
    email: "john@student.edu",
    role: "student",
    studentId: "ST12345",
    department: "Computer Science"
  },
  {
    id: "user2",
    name: "Sarah Faculty",
    email: "sarah@faculty.edu",
    role: "faculty",
    facultyId: "FAC789",
    department: "Mathematics"
  },
  {
    id: "user3",
    name: "Admin User",
    email: "admin@admin.edu",
    role: "admin"
  },
];

// Mock leave requests
export const leaveRequests: LeaveRequest[] = [
  {
    id: "leave1",
    userId: "user1",
    userName: "John Student",
    userRole: "student",
    type: "Sick Leave",
    startDate: "2025-05-20",
    endDate: "2025-05-22",
    reason: "Medical appointment and recovery",
    status: "pending",
    createdAt: "2025-05-15T10:30:00"
  },
  {
    id: "leave2",
    userId: "user2",
    userName: "Sarah Faculty",
    userRole: "faculty",
    type: "Vacation",
    startDate: "2025-06-10",
    endDate: "2025-06-15",
    reason: "Family vacation",
    status: "approved",
    reviewedBy: "Admin User",
    reviewedAt: "2025-05-12T14:20:00",
    comments: "Approved as requested",
    createdAt: "2025-05-10T09:15:00"
  },
  {
    id: "leave3",
    userId: "user1",
    userName: "John Student",
    userRole: "student",
    type: "Personal Leave",
    startDate: "2025-05-05",
    endDate: "2025-05-06",
    reason: "Family emergency",
    status: "rejected",
    reviewedBy: "Admin User",
    reviewedAt: "2025-05-03T11:45:00",
    comments: "Insufficient documentation provided",
    createdAt: "2025-05-02T08:30:00"
  },
];

// Leave types based on user role
export const leaveTypes = {
  student: ["Sick Leave", "Personal Leave", "Academic Leave", "Bereavement Leave"],
  faculty: ["Sick Leave", "Vacation", "Personal Leave", "Professional Development", "Sabbatical", "Bereavement Leave"],
  admin: ["Sick Leave", "Vacation", "Personal Leave", "Bereavement Leave"]
};

// Authentication helpers
export const findUserByEmail = (email: string): User | undefined => {
  return users.find(user => user.email === email);
};

// Leave request helpers
export let nextLeaveId = leaveRequests.length + 1;

export const getUserLeaveRequests = (userId: string): LeaveRequest[] => {
  return leaveRequests.filter(leave => leave.userId === userId);
};

export const getAllLeaveRequests = (): LeaveRequest[] => {
  return [...leaveRequests];
};

export const getLeaveRequestById = (id: string): LeaveRequest | undefined => {
  return leaveRequests.find(leave => leave.id === id);
};

export const addLeaveRequest = (leaveRequest: Omit<LeaveRequest, "id" | "createdAt">): LeaveRequest => {
  const newLeave: LeaveRequest = {
    ...leaveRequest,
    id: `leave${nextLeaveId++}`,
    createdAt: new Date().toISOString(),
  };
  
  leaveRequests.push(newLeave);
  return newLeave;
};

export const updateLeaveStatus = (
  leaveId: string, 
  status: "approved" | "rejected", 
  reviewedBy: string, 
  comments?: string
): LeaveRequest | undefined => {
  const leaveIndex = leaveRequests.findIndex(leave => leave.id === leaveId);
  
  if (leaveIndex === -1) return undefined;
  
  leaveRequests[leaveIndex] = {
    ...leaveRequests[leaveIndex],
    status,
    reviewedBy,
    reviewedAt: new Date().toISOString(),
    comments
  };
  
  return leaveRequests[leaveIndex];
};
