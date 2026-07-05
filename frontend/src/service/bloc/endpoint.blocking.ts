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
