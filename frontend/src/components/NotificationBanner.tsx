import React, { useEffect, useState, useCallback } from 'react';
import { useNotificationStore } from '../store/notificationStore';
import { router } from 'expo-router';
import { TouchableOpacity, View, Text, StyleSheet, Dimensions } from 'react-native';
import { Info, MessageSquare, Search, ShieldCheck, CheckCircle, XCircle } from 'lucide-react-native';
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
const isReportNotif = (data: any) => data?.type === 'REPORT_UPDATE';

const getReportAccent = (data: any): { color: string; bg: string } => {
    const s = (data?.status || '').toUpperCase();
    if (s === 'REJECTED') return { color: '#EF4444', bg: '#1A0808' };
    return { color: '#22C55E', bg: '#0D1A10' };
};

// ─── Admin / Report card (distinct design) ───────────────────────────────────
const AdminNotifCard = ({
    item,
    index,
    onRemove,
}: {
    item: NotifItem;
    index: number;
    onRemove: (id: string) => void;
}) => {
    const enterY = useSharedValue(-55);
    const enterOpacity = useSharedValue(0);
    const stackY = useSharedValue(0);
    const stackScale = useSharedValue(1);
    const stackDim = useSharedValue(1);

    const { color: accentColor, bg: bgColor } = getReportAccent(item.data);
    const status = (item.data?.status || '').toUpperCase();
    const StatusIcon = status === 'REJECTED' ? XCircle : CheckCircle;

    // Extract admin message from body (after "Admin note:") if present
    const adminNoteMatch = item.body.match(/Admin note: "(.+)"/);
    const adminNote = adminNoteMatch ? adminNoteMatch[1] : null;
    // Main message = everything before "\nAdmin note:" or full body
    const mainMessage = item.body.split('\nAdmin note:')[0].trim();

    const dismiss = useCallback(() => {
        enterY.value = withSpring(-55, { damping: 16, stiffness: 180 });
        enterOpacity.value = withTiming(0, { duration: 180 }, (finished) => {
            if (finished) runOnJS(onRemove)(item.id);
        });
    }, [item.id, onRemove]);

    useEffect(() => {
        enterY.value = withSpring(0, SPRING);
        enterOpacity.value = withTiming(1, { duration: 220 });
        const timer = setTimeout(dismiss, 7000);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        stackY.value = withSpring(index * 10, SPRING);
        stackScale.value = withSpring(1 - index * 0.05, SPRING);
        stackDim.value = withSpring(
            index === 0 ? 1 : Math.max(0.6, 1 - index * 0.22),
            SPRING,
        );
    }, [index]);

    const animStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: enterY.value + stackY.value },
            { scale: stackScale.value },
        ],
        opacity: enterOpacity.value * stackDim.value,
    }));

    const handlePress = () => {
        router.push('/NotificationsScreen');
        dismiss();
    };

    return (
        <Animated.View
            style={[
                adminStyles.card,
                { zIndex: 100 - index, borderColor: accentColor + '40', backgroundColor: bgColor },
                animStyle,
            ]}
        >
            {/* Left accent bar */}
            <View style={[adminStyles.accentBar, { backgroundColor: accentColor }]} />

            <TouchableOpacity
                onPress={handlePress}
                style={adminStyles.inner}
                activeOpacity={0.8}
            >
                {/* Top row: badge + close */}
                <View style={adminStyles.topRow}>
                    <View style={[adminStyles.badge, { backgroundColor: accentColor + '22', borderColor: accentColor + '55' }]}>
                        <ShieldCheck size={10} color={accentColor} strokeWidth={2.5} />
                        <Text style={[adminStyles.badgeText, { color: accentColor }]}>
                            Official Notice
                        </Text>
                    </View>

                    {index === 0 && (
                        <TouchableOpacity onPress={dismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                            <Text style={adminStyles.closeX}>✕</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Content row */}
                <View style={adminStyles.contentRow}>
                    <View style={[adminStyles.iconCircle, { backgroundColor: accentColor + '20', borderColor: accentColor + '50' }]}>
                        <StatusIcon size={18} color={accentColor} strokeWidth={2} />
                    </View>

                    <View style={adminStyles.textBlock}>
                        {/* Title + status pill on same row */}
                        <View style={adminStyles.titleRow}>
                            <Text style={adminStyles.title} numberOfLines={1}>{item.title}</Text>
                            <View style={[adminStyles.statusPill, { backgroundColor: accentColor + '25', borderColor: accentColor + '55' }]}>
                                <Text style={[adminStyles.statusPillText, { color: accentColor }]}>{status}</Text>
                            </View>
                        </View>

                        {/* Main message only — admin note shown in NotificationsScreen */}
                        <Text style={[adminStyles.body, { color: accentColor + 'BB' }]} numberOfLines={2}>
                            {mainMessage}
                        </Text>
                    </View>
                </View>

                {index === 0 && (
                    <Text style={[adminStyles.hint, { color: accentColor }]}>
                        Tap to view details →
                    </Text>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
};

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

    const lastProcessedNotif = React.useRef<any>(null);

    useEffect(() => {
        if (isVisible && notification && notification !== lastProcessedNotif.current) {
            lastProcessedNotif.current = notification;
            const id = Math.random().toString(36).substring(7);
            setQueue(prev => [
                {
                    id,
                    title: notification.data?.senderName || notification.title || 'Notification',
                    body: notification.body || '',
                    data: notification.data,
                },
                ...prev,
            ].slice(0, 3));

            hideNotification();
        }
    }, [isVisible, notification, hideNotification]);

    if (queue.length === 0) return null;

    return (
        <View style={styles.container} pointerEvents="box-none">
            {[...queue].reverse().map((notif, reverseIdx) => {
                const index = queue.length - 1 - reverseIdx; // 0 = newest/front
                return isReportNotif(notif.data) ? (
                    <AdminNotifCard
                        key={notif.id}
                        item={notif}
                        index={index}
                        onRemove={removeNotif}
                    />
                ) : (
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

// ─── Standard styles ──────────────────────────────────────────────────────────
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

// ─── Admin card styles ────────────────────────────────────────────────────────
const adminStyles = StyleSheet.create({
    card: {
        position: 'absolute',
        left: 0,
        right: 0,
        flexDirection: 'row',
        borderRadius: 20,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 14,
        elevation: 10,
        borderWidth: 1,
        overflow: 'hidden',
    },
    accentBar: {
        width: 4,
        alignSelf: 'stretch',
        borderTopLeftRadius: 20,
        borderBottomLeftRadius: 20,
    },
    inner: {
        flex: 1,
        paddingHorizontal: 14,
        paddingVertical: 8,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 20,
        borderWidth: 1,
    },
    badgeText: {
        fontSize: 10,
        fontFamily: 'Lexend_600SemiBold',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    closeX: {
        color: '#555',
        fontSize: 13,
        fontFamily: 'Lexend_400Regular',
    },
    contentRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    iconCircle: {
        width: 34,
        height: 34,
        borderRadius: 17,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        marginTop: 1,
    },
    textBlock: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 5,
        gap: 6,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 13,
        fontFamily: 'Lexend_700Bold',
        flex: 1,
    },
    statusPill: {
        paddingHorizontal: 7,
        paddingVertical: 2,
        borderRadius: 8,
        borderWidth: 1,
        flexShrink: 0,
    },
    statusPillText: {
        fontSize: 9,
        fontFamily: 'Lexend_700Bold',
        letterSpacing: 0.6,
    },
    body: {
        fontSize: 12,
        fontFamily: 'Lexend_400Regular',
        lineHeight: 17,
    },
    adminNote: {
        fontSize: 11,
        fontFamily: 'Lexend_400Regular',
        color: '#777',
        marginTop: 4,
    },
    hint: {
        fontSize: 11,
        fontFamily: 'Lexend_500Medium',
        marginTop: 6,
        textAlign: 'right',
    },
});
