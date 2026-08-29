import type { ReactNode } from 'react';

export interface Report {
    id: number;
    userId: number;
    targetType: string;
    targetId: number;
    targetLabel?: string;
    reason: string;
    message?: string;
    status: string;
    reporterMessage?: string | null;
    reportedMessage?: string | null;
    previousViolations?: number;
    createdAt: string;
    reporter?: {
        name: string;
        email: string;
        photo?: string | null;
    } | null;
    targetData?: {
        title?: string;
        name?: string;
        [key: string]: any;
    } | null;
}

export interface StatusConfigItem {
    label: string;
    classes: string;
    icon: ReactNode;
}

export interface TypeConfigItem {
    classes: string;
    icon: ReactNode;
}

export interface UpdateReport {
    id: number;
    status: string;
    reporterMessage?: string;
    reportedMessage?: string;
    takedownContent?: boolean;
}

// Payload for bulk update (multiple reports same target)
export interface BulkUpdateReport {
    reportIds: number[];
    status: string;
    reporterMessage?: string;
    reportedMessage?: string;
    takedownContent?: boolean;
}

// Auto-group: all reports targeting the same entity
export interface ReportGroup {
    key: string;           // unique: "CAR_7", "USER_12"
    targetId: number;
    targetType: string;
    targetData: Report["targetData"];
    reports: Report[];
    groupStatus: string;   // status dyal l-majority
    latestAt: string;      // createdAt dyal l-report l-jdid
}