export interface Notification {
  id: number;
  text: string;
  seen: boolean;
  createdAt: Date|string
}

export interface NotificationsResponse {
  success: boolean;
  notifications: Notification[];
}

export interface UnreadNotificationsCountResponse {
  success: boolean;
  count: number;
}