import React, { useEffect } from 'react';
import { useNotificationStore } from '../store/notificationStore';
import { router } from 'expo-router';
import { Toast, useToast } from 'heroui-native';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Info, MessageSquare, Search, Bell } from 'lucide-react-native';

const NotificationBanner = () => {
    const { isVisible, notification, hideNotification } = useNotificationStore();
    const { toast } = useToast();

    useEffect(() => {
        if (isVisible && notification) {
            const handleAction = () => {
                if (notification.data?.conversationId) {
                    router.push({
                        pathname: "/ViewMessaageUse",
                        params: {
                            conversationId: notification.data.conversationId,
                            otherUserId: notification.data.senderId
                        }
                    });
                } else if (notification.data?.type === "SAVED_SEARCH_MATCH" && notification.data.carId) {
                    router.push({
                        pathname: "/CarDetailScreen",
                        params: { id: notification.data.carId }
                    });
                }
                hideNotification();
            };

            const getIcon = () => {
                if (notification.data?.conversationId) return <MessageSquare size={14} color="#fff" />;
                if (notification.data?.type === "SAVED_SEARCH_MATCH") return <Search size={14} color="#fff" />;
                return <Info size={14} color="#fff" />;
            };

            toast.show({
                component: (props: any) => (
                    <Toast
                        {...props}
                        placement="top"
                        style={styles.toastContainer}
                    >
                        <View style={styles.leftSection}>
                            {/* BLUE INFO ICON */}
                            <View style={styles.iconCircle}>
                                {getIcon()}
                            </View>

                            {/* TEXT CONTENT */}
                            <TouchableOpacity 
                                onPress={handleAction}
                                style={styles.textContainer}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.titleText}>
                                    {notification.data?.senderName || notification.title || 'Notification'}
                                </Text>
                                <Text style={styles.bodyText} numberOfLines={2}>
                                    {notification.body}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* BLUE CLOSE BUTTON */}
                        <TouchableOpacity
                            onPress={() => {
                                props.hide();
                                hideNotification();
                            }}
                            style={styles.closeButton}
                        >
                            <Text style={styles.closeText}>Close</Text>
                        </TouchableOpacity>
                    </Toast>
                ),
            });
        }
    }, [isVisible, notification]);

    return null;
};

const styles = StyleSheet.create({
    toastContainer: {
        marginHorizontal: 16,
        marginTop: 10,
        borderRadius: 24,
        backgroundColor: '#171717', // Neutral 900
        paddingHorizontal: 16,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    iconCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#0084FF', // Info Blue from photo
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer: {
        flex: 1,
        paddingRight: 8,
    },
    titleText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontFamily: 'Lexend_700Bold',
        letterSpacing: 0.2,
    },
    bodyText: {
        color: '#8E8E93', // iOS Grey description
        fontSize: 12,
        fontFamily: 'Lexend_400Regular',
        marginTop: 2,
    },
    closeButton: {
        backgroundColor: '#0084FF', // Blue pill from photo
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 16,
        marginLeft: 8,
    },
    closeText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontFamily: 'Lexend_600SemiBold',
    },
});

export default NotificationBanner;
