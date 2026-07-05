import API from "../api";

export const blockUser = (userId: number) => {
  try {
    const response = API.post(`/blockedUsers/${userId}`);
    return response;
  } catch (error) {
    throw error;
  }
};
