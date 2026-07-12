import api from "./api";

export const adminGetEmployees = async () => {
  const res = await api.get("/employee/admin/employees");
  return res.data;
};

export const adminCreateEmployee = async (payload) => {
  const res = await api.post("/employee/admin/employees", payload);
  return res.data;
};

export const adminUpdateEmployee = async (id, payload) => {
  const res = await api.patch(`/employee/admin/employees/${id}`, payload);
  return res.data;
};

export const adminDeleteEmployee = async (id) => {
  const res = await api.delete(`/employee/admin/employees/${id}`);
  return res.data;
};

export const adminUpdateEmployeeStatus = async (id, status) => {
  const res = await api.patch(`/employee/admin/employees/${id}/status`, {
    status,
  });
  return res.data;
};
