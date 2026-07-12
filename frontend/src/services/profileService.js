import api from "./api";

export const getUserProfile = async () => {
  const response = await api.get("/profile");
  return response.data;
};

export const updateUserProfile = async (data) => {
  const response = await api.put("/profile", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};
