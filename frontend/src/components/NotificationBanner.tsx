import React, { useEffect, useState, useCallback } from 'react';
import { useNotificationStore } from '../store/notificationStore';
import { router } from 'expo-router';
import { TouchableOpacity, View, Text, StyleSheet, Dimensions } from 'react-native';
import { Info, MessageSquare, Search } from 'lucide-react-native';
import Animated, {
    useAnimatedStyle,
    withSpring,
    withTiming,
    useSharedValue,
    runOnJS,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const SPRING = { damping: 18, stiffness: 200, mass: 0.8 };

// ─── Notification item type ───────────────────────────────────────────────────
interface NotifItem {
    id: string;
    title: string;
    body: string;
    data: any;
}

// ─── Single animated notification card ───────────────────────────────────────
const NotifCard = ({
    item,
    index,
    onRemove,
}: {
    item: NotifItem;
    index: number;
    onRemove: (id: string) => void;
}) => {
    // Entrance
    const enterY = useSharedValue(-55);
    const enterOpacity = useSharedValue(0);

    // Stack position
    const stackY = useSharedValue(0);
    const stackScale = useSharedValue(1);
    const stackDim = useSharedValue(1);

    // ── Exit: slide up then remove ───────────────────────────────────────────
    const dismiss = useCallback(() => {
        enterY.value = withSpring(-55, { damping: 16, stiffness: 180 });
        enterOpacity.value = withTiming(0, { duration: 180 }, (finished) => {
            if (finished) runOnJS(onRemove)(item.id);
        });
    }, [item.id, onRemove]);

    // ── Entrance (once on mount) ─────────────────────────────────────────────
    useEffect(() => {
        enterY.value = withSpring(0, SPRING);
        enterOpacity.value = withTiming(1, { duration: 220 });

        const timer = setTimeout(dismiss, 5000);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Stack position (when index changes — no re-entrance) ─────────────────
    useEffect(() => {
        stackY.value = withSpring(index * 10, SPRING);
        stackScale.value = withSpring(1 - index * 0.05, SPRING);
        stackDim.value = withSpring(
            index === 0 ? 1 : Math.max(0.6, 1 - index * 0.22),
            SPRING,
        );
    }, [index]);

    // ── Only read shared values — no withSpring() inside ─────────────────────
    const animStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: enterY.value + stackY.value },
            { scale: stackScale.value },
        ],
        opacity: enterOpacity.value * stackDim.value,
    }));

    // Navigation on press
    const handlePress = () => {
        if (item.data?.conversationId) {
            router.push({
                pathname: '/ViewMessaageUse',
                params: {
                    conversationId: item.data.conversationId,
                    otherUserId: item.data.senderId,
                },
            });
        } else if (item.data?.type === 'SAVED_SEARCH_MATCH' && item.data?.carId) {
            router.push({
                pathname: '/CarDetailScreen',
                params: { id: item.data.carId },
            });
        }
        dismiss();
    };

    const getIcon = () => {
        if (item.data?.conversationId) return <MessageSquare size={14} color="#fff" />;
        if (item.data?.type === 'SAVED_SEARCH_MATCH') return <Search size={14} color="#fff" />;
        return <Info size={14} color="#fff" />;
    };

    return (
        <Animated.View
            style={[
                styles.card,
                { zIndex: 100 - index },
                animStyle,
            ]}
        >
            {/* Blue icon circle */}
            <View style={styles.iconCircle}>
                {getIcon()}
            </View>

            {/* Text — tappable */}
            <TouchableOpacity
                onPress={handlePress}
                style={styles.textContainer}
                activeOpacity={0.7}
            >
                <Text style={styles.titleText} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.bodyText} numberOfLines={2}>{item.body}</Text>
            </TouchableOpacity>

            {/* Close — only on front card */}
            {index === 0 && (
                <TouchableOpacity onPress={dismiss} style={styles.closeButton}>
                    <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
            )}
        </Animated.View>
    );
};

// ─── Main component — listens for new notifications and stacks them ───────────
const NotificationBanner = () => {
    const { isVisible, notification, hideNotification } = useNotificationStore();
    const [queue, setQueue] = useState<NotifItem[]>([]);

    const removeNotif = useCallback((id: string) => {
        setQueue(prev => prev.filter(n => n.id !== id));
    }, []);

    useEffect(() => {
        if (isVisible && notification) {
            const id = Math.random().toString(36).substring(7);
            setQueue(prev => [
                {
                    id,
                    title: notification.data?.senderName || notification.title || 'Notification',
                    body: notification.body || '',
                    data: notification.data,
                },
                ...prev,
            ].slice(0, 3)); // max 3 in the deck
            hideNotification();
        }
    }, [isVisible, notification]);

    if (queue.length === 0) return null;

    return (
        <View style={styles.container} pointerEvents="box-none">
            {[...queue].reverse().map((notif, reverseIdx) => {
                const index = queue.length - 1 - reverseIdx; // 0 = newest/front
                return (
                    <NotifCard
                        key={notif.id}
                        item={notif}
                        index={index}
                        onRemove={removeNotif}
                    />
                );
            })}
        </View>
    );
};

export default NotificationBanner;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 56,
        left: 16,
        right: 16,
        zIndex: 9999,
        alignItems: 'stretch',
    },
    card: {
        position: 'absolute',
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 24,
        backgroundColor: '#171717',
        paddingHorizontal: 16,
        paddingVertical: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    iconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#0084FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        flexShrink: 0,
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
        color: '#8E8E93',
        fontSize: 12,
        fontFamily: 'Lexend_400Regular',
        marginTop: 2,
    },
    closeButton: {
        backgroundColor: '#0084FF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 14,
        marginLeft: 8,
        flexShrink: 0,
    },
    closeText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontFamily: 'Lexend_600SemiBold',
    },
});
