import API from "../api";

export const blockUser = (blockedId: number) => {
  try {
    const response = API.post(`blockedUsers/${blockedId}`);

    return response;
  } catch (error) {
    console.log("error blocking user:", error);

    throw error;
  }
};

export const getBlockStatus = async (blockedId: number) => {
  try {
    const response = await API.get(`blockedUsers/status/${blockedId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const unblockUser = async (blockedId: number) => {
  try {
    const response = await API.delete(`blockedUsers/status/${blockedId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
