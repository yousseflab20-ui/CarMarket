export type OfferStatus =
  | "PENDING"
  | "COUNTERED"
  | "ACCEPTED"
  | "REJECTED"
  | "AUTO_REJECTED"
  | "EXPIRED";

export type Offer = {
  id: number | string;
  amount: number | string;
  type?: "BUYER_OFFER" | "SELLER_COUNTER";
  status?: OfferStatus;
  createdAt?: string;
  expiresAt?: string;
};

export type NegotiationStatus =
  | "ACTIVE"
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "EXPIRED"
  | "CANCELLED";

export type Negotiation = {
  id: number | string;
  carId?: number | string;
  buyerId?: number | string;
  sellerId?: number | string;
  status?: NegotiationStatus;
  maxAttempts?: number;
  Car?: {
    id?: number | string;
    title?: string;
    brand?: string;
    model?: string;
    images?: string[];
    price?: number | string;
    status?: string;
  };
  car?: {
    id?: number | string;
    title?: string;
    brand?: string;
    model?: string;
    images?: string[];
    price?: number | string;
    status?: string;
  };
  buyer?: { id?: number | string; name?: string; photo?: string };
  seller?: { id?: number | string; name?: string; photo?: string };
  Offers?: Offer[];
};
