import type { ReactNode } from 'react';

export interface Report {
    id: number;
    userId: number;
    reporterName: string;
    reporterEmail: string;
    targetType: string;
    targetId: number;
    targetLabel: string;
    reason: string;
    message?: string;
    status: string;
    createdAt: string;
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
    id:number;
    status: string;
    adminMessage?: string;
}