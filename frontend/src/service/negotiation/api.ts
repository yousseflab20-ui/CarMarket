import API from "../api";

// --- Negotiation API ---

export const createNegotiation = async (carId: number | string) => {
  const response = await API.post("negotiation", { carId });
  return response.data;
};

export const getBuyerNegotiations = async () => {
  const response = await API.get("negotiation/sent");
  return response.data;
};

export const getSellerNegotiations = async () => {
  const response = await API.get("negotiation/received");
  return response.data;
};

// --- Offer API ---

export const createOffer = async (payload: { negotiationId: number | string; amount: number }) => {
  const response = await API.post("offer", payload);
  return response.data;
};

export const respondToOffer = async ({ 
  offerId, 
  action, 
  counterAmount 
}: { 
  offerId: number | string; 
  action: "ACCEPT" | "REJECT" | "COUNTER"; 
  counterAmount?: number 
}) => {
  const response = await API.put(`offer/${offerId}/respond`, { action, counterAmount });
  return response.data;
};

export const counterResponse = async ({ 
  offerId, 
  action 
}: { 
  offerId: number | string; 
  action: "ACCEPT" | "REJECT" 
}) => {
  const response = await API.put(`offer/${offerId}/counter-response`, { action });
  return response.data;
};
