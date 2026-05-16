export type ReportTargetType = "USER" | "CAR" | "POST";

export type Reason = "Spam" | "Scam" | "Fake listing" | "Other";

export interface ReportPayload {
  reason: Reason;
  message: string;
}

export const REASONS: Reason[] = ["Spam", "Scam", "Fake listing", "Other"];

export interface ReasonChipProps {
  label: Reason;
  selected: boolean;
  hasError: boolean;
  onPress: () => void;
}
