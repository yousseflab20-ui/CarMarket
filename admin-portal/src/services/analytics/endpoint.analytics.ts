import api from "../api";

export const getAnalytics = async () => {
  const response = await api.get("/admin/users/analytics");
  return response.data;
};
