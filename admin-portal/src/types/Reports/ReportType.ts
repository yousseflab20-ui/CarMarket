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
    adminMessage?: string | null;
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
    adminMessage?: string;
}