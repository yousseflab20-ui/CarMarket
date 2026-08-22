export type ReportTargetType = "USER" | "CAR" | "POST" | "NEGOTIATION";

export type Reason = 
  | "Spam" 
  | "Scam" 
  | "Fake listing" 
  | "Other"
  | "Fake Offer / Not Serious"
  | "Agreed but didn't show up"
  | "Scam / Fraud attempt"
  | "Offensive language"
  | "Price / Deal Manipulation";

export interface ReportPayload {
  reason: Reason;
  message: string;
}

export const REASONS_GENERAL: Reason[] = ["Spam", "Scam", "Fake listing", "Other"];
export const REASONS_NEGOTIATION: Reason[] = [
  "Fake Offer / Not Serious",
  "Agreed but didn't show up",
  "Scam / Fraud attempt",
  "Offensive language",
  "Price / Deal Manipulation",
  "Other"
];

export interface ReasonChipProps {
  label: Reason;
  selected: boolean;
  hasError: boolean;
  onPress: () => void;
}
