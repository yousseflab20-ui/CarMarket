/**
 * AlertDialog Context
 * 
 * Provides a global context for displaying alert dialogs throughout the app.
 * Uses React Native's Modal for compatibility with RN 0.83+.
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Pressable,
} from 'react-native';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react-native';

// Types
export type AlertStatus = 'success' | 'error' | 'warning' | 'info';

export interface AlertAction {
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
}

export interface AlertOptions {
    title: string;
    message: string;
    status?: AlertStatus;
    actions?: AlertAction[];
}

interface AlertDialogContextType {
    showAlert: (options: AlertOptions) => void;
    showError: (error: any, title?: string) => void;
    showSuccess: (message: string, title?: string, actions?: AlertAction[]) => void;
    hideAlert: () => void;
}

// Context
const AlertDialogContext = createContext<AlertDialogContextType | undefined>(undefined);

// Status colors matching app theme
const STATUS_COLORS: Record<AlertStatus, { bg: string; icon: string; border: string }> = {
    success: { bg: '#10B98120', icon: '#10B981', border: '#10B981' },
    error: { bg: '#EF444420', icon: '#EF4444', border: '#EF4444' },
    warning: { bg: '#F59E0B20', icon: '#F59E0B', border: '#F59E0B' },
    info: { bg: '#3B82F620', icon: '#3B82F6', border: '#3B82F6' },
};

// Status icons
const StatusIcon = ({ status }: { status: AlertStatus }) => {
    const color = STATUS_COLORS[status].icon;
    const size = 32;

    switch (status) {
        case 'success':
            return <CheckCircle size={size} color={color} />;
        case 'error':
            return <XCircle size={size} color={color} />;
        case 'warning':
            return <AlertTriangle size={size} color={color} />;
        case 'info':
            return <Info size={size} color={color} />;
    }
};

// Provider component
export function AlertDialogProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [alertOptions, setAlertOptions] = useState<AlertOptions>({
        title: '',
        message: '',
        status: 'info',
        actions: [],
    });

    const showAlert = useCallback((options: AlertOptions) => {
        setAlertOptions({
            ...options,
            status: options.status || 'info',
            actions: options.actions || [{ text: 'OK', style: 'default' }],
        });
        setIsOpen(true);
    }, []);

    const showError = useCallback((error: any, title?: string) => {
        const errorMessage = typeof error === 'string'
            ? error
            : error?.message || error?.title || 'An unexpected error occurred';

        showAlert({
            title: title || error?.title || 'Error',
            message: errorMessage,
            status: 'error',
            actions: [{ text: 'OK', style: 'default' }],
        });
    }, [showAlert]);

    const showSuccess = useCallback((message: string, title?: string, actions?: AlertAction[]) => {
        showAlert({
            title: title || 'Success',
            message,
            status: 'success',
            actions: actions || [{ text: 'OK', style: 'default' }],
        });
    }, [showAlert]);

    const hideAlert = useCallback(() => {
        setIsOpen(false);
    }, []);

    const handleAction = (action: AlertAction) => {
        hideAlert();
        action.onPress?.();
    };

    const status = alertOptions.status || 'info';
    const statusColors = STATUS_COLORS[status];

    return (
        <AlertDialogContext.Provider value={{ showAlert, showError, showSuccess, hideAlert }}>
            {children}
            <Modal
                visible={isOpen}
                transparent
                animationType="fade"
                onRequestClose={hideAlert}
            >
                <Pressable style={styles.overlay} onPress={hideAlert}>
                    <Pressable
                        style={[styles.content, { borderColor: statusColors.border }]}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: statusColors.bg }]}>
                            <StatusIcon status={status} />
                        </View>
                        <Text style={styles.title}>{alertOptions.title}</Text>
                        <Text style={styles.message}>{alertOptions.message}</Text>
                        <View style={styles.actionsRow}>
                            {alertOptions.actions?.map((action, index) => {
                                const isDestructive = action.style === 'destructive';
                                const isCancel = action.style === 'cancel';

                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.button,
                                            isCancel ? styles.buttonCancel : styles.buttonPrimary,
                                            isDestructive && styles.buttonDestructive,
                                        ]}
                                        onPress={() => handleAction(action)}
                                        activeOpacity={0.8}
                                    >
                                        <Text
                                            style={[
                                                styles.buttonText,
                                                isCancel && styles.buttonTextCancel,
                                            ]}
                                        >
                                            {action.text}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </AlertDialogContext.Provider>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    content: {
        width: '100%',
        maxWidth: 340,
        backgroundColor: '#1C1F26',
        borderRadius: 16,
        borderWidth: 1,
        padding: 24,
        alignItems: 'center',
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 8,
    },
    message: {
        fontSize: 15,
        color: '#94A3B8',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 20,
    },
    actionsRow: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonPrimary: {
        backgroundColor: '#3B82F6',
    },
    buttonCancel: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: '#3B82F6',
    },
    buttonDestructive: {
        backgroundColor: '#EF4444',
    },
    buttonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },
    buttonTextCancel: {
        color: '#3B82F6',
    },
});

// Hook for using the alert dialog
export function useAlertDialog() {
    const context = useContext(AlertDialogContext);
    if (!context) {
        throw new Error('useAlertDialog must be used within an AlertDialogProvider');
    }
    return context;
}
