export const STATUS_CONFIG = {
    available: {
        label: "Available",
        bg: "rgba(16, 185, 129, 0.15)",
        color: "#10B981",
    },
    reserved: {
        label: "Reserved",
        bg: "rgba(245, 158, 11, 0.15)",
        color: "#F59E0B",
    },
    sold: {
        label: "Sold",
        bg: "rgba(239, 68, 68, 0.15)",
        color: "#EF4444",
    },
} as const;
export type CarStatus = keyof typeof STATUS_CONFIG;
