/**
 * AlertDialog Context
 * 
 * Provides a global context for displaying alert dialogs throughout the app.
 * Uses native-base's AlertDialog component for consistent theming.
 */

import React, { createContext, useContext, useState, useRef, useCallback, ReactNode } from 'react';
import {
    AlertDialog as NBAlertDialog,
    Button,
    Center,
    HStack,
    VStack,
    Text,
    Icon,
} from 'native-base';
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
    const cancelRef = useRef(null);

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
            <NBAlertDialog
                leastDestructiveRef={cancelRef}
                isOpen={isOpen}
                onClose={hideAlert}
            >
                <NBAlertDialog.Content
                    bg="#1C1F26"
                    borderColor={statusColors.border}
                    borderWidth={1}
                    borderRadius={16}
                    maxW="90%"
                >
                    <NBAlertDialog.Body py={6} px={5}>
                        <VStack space={4} alignItems="center">
                            <Center
                                w={16}
                                h={16}
                                borderRadius={32}
                                bg={statusColors.bg}
                            >
                                <StatusIcon status={status} />
                            </Center>
                            <VStack space={2} alignItems="center">
                                <Text
                                    fontSize="xl"
                                    fontWeight="bold"
                                    color="#fff"
                                    textAlign="center"
                                >
                                    {alertOptions.title}
                                </Text>
                                <Text
                                    fontSize="md"
                                    color="#94A3B8"
                                    textAlign="center"
                                    lineHeight="lg"
                                >
                                    {alertOptions.message}
                                </Text>
                            </VStack>
                            <HStack space={3} mt={2} w="100%">
                                {alertOptions.actions?.map((action, index) => {
                                    const isDestructive = action.style === 'destructive';
                                    const isCancel = action.style === 'cancel';

                                    return (
                                        <Button
                                            key={index}
                                            ref={isCancel ? cancelRef : undefined}
                                            flex={1}
                                            variant={isCancel ? 'outline' : 'solid'}
                                            bg={isCancel ? 'transparent' : isDestructive ? '#EF4444' : '#3B82F6'}
                                            borderColor={isCancel ? '#3B82F6' : 'transparent'}
                                            borderWidth={isCancel ? 1.5 : 0}
                                            _text={{
                                                color: isCancel ? '#3B82F6' : '#fff',
                                                fontWeight: 'bold',
                                            }}
                                            _pressed={{
                                                opacity: 0.8,
                                            }}
                                            borderRadius={12}
                                            py={3}
                                            onPress={() => handleAction(action)}
                                        >
                                            {action.text}
                                        </Button>
                                    );
                                })}
                            </HStack>
                        </VStack>
                    </NBAlertDialog.Body>
                </NBAlertDialog.Content>
            </NBAlertDialog>
        </AlertDialogContext.Provider>
    );
}

// Hook for using the alert dialog
export function useAlertDialog() {
    const context = useContext(AlertDialogContext);
    if (!context) {
        throw new Error('useAlertDialog must be used within an AlertDialogProvider');
    }
    return context;
}
