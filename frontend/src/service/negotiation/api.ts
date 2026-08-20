import API from "../api";

// --- Negotiation API ---

export const createNegotiation = async (carId: number | string) => {
  const response = await API.post("Negotiation", { carId });
  return response.data;
};

export const getBuyerNegotiations = async () => {
  const response = await API.get("Negotiation/sent");
  return response.data;
};

export const getSellerNegotiations = async () => {
  const response = await API.get("Negotiation/received");
  return response.data;
};

export const getNegotiationById = async (id: number | string) => {
  const response = await API.get(`Negotiation/${id}`);
  return response.data;
};

// --- Offer API ---

export const createOffer = async (payload: { negotiationId: number | string; amount: number }) => {
  const response = await API.post("offers", payload);
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
  const response = await API.put(`offers/${offerId}/respond`, { action, counterAmount });
  return response.data;
};

export const counterResponse = async ({ 
  offerId, 
  action 
}: { 
  offerId: number | string; 
  action: "ACCEPT" | "REJECT" 
}) => {
  const response = await API.put(`offers/${offerId}/counter-response`, { action });
  return response.data;
};
