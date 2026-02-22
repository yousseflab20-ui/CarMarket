import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    TouchableOpacity,
    PanResponder,
    Dimensions,
    Platform,
    Image,
} from 'react-native';
import { useNotificationStore } from '../store/notificationStore';
import { Bell, X } from 'lucide-react-native';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

const NotificationBanner = () => {
    const { isVisible, notification, hideNotification } = useNotificationStore();
    const translateY = useRef(new Animated.Value(-150)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        console.log("NotificationBanner Effect:", { isVisible, hasNotification: !!notification });
        if (isVisible && notification) {
            if (timerRef.current) clearTimeout(timerRef.current);

            Animated.parallel([
                Animated.spring(translateY, {
                    toValue: Platform.OS === 'ios' ? 50 : 20,
                    useNativeDriver: true,
                    tension: 50,
                    friction: 8,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
            timerRef.current = setTimeout(() => {
                handleDismiss();
            }, 5000);
        } else {
            handleDismiss();
        }
    }, [isVisible, notification]);

    const handleDismiss = () => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: -150,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            hideNotification();
        });
    };

    const handlePress = () => {
        if (notification?.data?.conversationId) {
            router.push({
                pathname: "/ViewMessaageUse",
                params: {
                    conversationId: notification.data.conversationId,
                    otherUserId: notification.data.senderId
                }
            });
        }
        handleDismiss();
    };

    if (!isVisible) return null;
    console.log("NotificationBanner Rendering:", notification?.title);

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ translateY }],
                    opacity,
                },
            ]}
        >
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={handlePress}
                style={styles.banner}
            >
                <View style={styles.content}>
                    <View style={styles.iconContainer}>
                        {notification?.data?.senderPhoto ? (
                            <Image
                                source={{ uri: notification.data.senderPhoto }}
                                style={styles.senderAvatar}
                            />
                        ) : (
                            <View style={styles.appIconWrapper}>
                                <Bell size={14} color="#FFFFFF" fill="#FFFFFF" />
                            </View>
                        )}
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.title} numberOfLines={1}>
                            {notification?.data?.senderName || notification?.title || 'New Message'}
                        </Text>
                        <Text style={styles.body} numberOfLines={2}>
                            {notification?.body || ''}
                        </Text>
                    </View>

                    <TouchableOpacity onPress={handleDismiss} style={styles.closeButton}>
                        <X size={18} color="#94A3B8" />
                    </TouchableOpacity>
                </View>

                <View style={styles.indicator} />
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        alignItems: 'center',
        paddingHorizontal: 12,
    },
    banner: {
        width: '100%',
        maxWidth: 450,
        backgroundColor: '#1E293B',
        borderRadius: 16,
        padding: 12,
        flexDirection: 'column',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        marginRight: 12,
    },
    appIconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#0EA5E9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    senderAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#334155',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        color: '#F8FAFC',
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 2,
    },
    body: {
        color: '#CBD5E1',
        fontSize: 14,
        lineHeight: 18,
    },
    closeButton: {
        padding: 4,
        marginLeft: 8,
    },
    indicator: {
        width: 36,
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 10,
    }
});

export default NotificationBanner;
