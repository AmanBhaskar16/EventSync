
export type NotificationType =
  | "NEW_MESSAGE"
  | "QUOTE_RECEIVED"
  | "QUOTE_ACCEPTED"
  | "QUOTE_REJECTED"
  | "QUOTE_COUNTERED"
  | "BOOKING_CONFIRMED"
  | "BOOKING_CANCELLED"
  | "PAYMENT_RECEIVED"
  | "BOOKING_COMPLETED"
  | "REVIEW_RECEIVED"
  | "DISPUTE_RAISED"
  | "DISPUTE_RESOLVED";

export type Notification = {
  id:        string;
  type:      NotificationType;
  title:     string;
  message:   string;
  link?:     string;
  createdAt: string;
  isRead:    boolean;
};

export const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  NEW_MESSAGE:       "💬",
  QUOTE_RECEIVED:    "📋",
  QUOTE_ACCEPTED:    "✅",
  QUOTE_REJECTED:    "❌",
  QUOTE_COUNTERED:   "🔄",
  BOOKING_CONFIRMED: "🎉",
  BOOKING_CANCELLED: "❌",
  PAYMENT_RECEIVED:  "💰",
  BOOKING_COMPLETED: "⭐",
  REVIEW_RECEIVED:   "⭐",
  DISPUTE_RAISED:    "⚠️",
  DISPUTE_RESOLVED:  "✅",
};