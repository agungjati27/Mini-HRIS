import axiosClient from "../api/axiosClient";

interface LeaveRequest {
  type: string;
  reason: string;
  attachment_url?: string;
}

interface ReviewRequest {
  status: "approved" | "rejected";
  admin_note?: string;
  approved_days?: number;
}

export const leaveService = {
  // Employee: Submit leave request
  submitLeaveRequest: async (data: LeaveRequest) => {
    return axiosClient.post("/leave/requests", data);
  },

  // Employee: Get own leave requests
  getMyLeaveRequests: async () => {
    return axiosClient.get("/leave/requests/me");
  },

  // Admin: Get all leave requests
  getAllLeaveRequests: async () => {
    return axiosClient.get("/leave/requests");
  },

  // Admin: Review/approve/reject leave request
  reviewLeaveRequest: async (id: string, data: ReviewRequest) => {
    return axiosClient.patch(`/leave/requests/${id}`, data);
  },
};
