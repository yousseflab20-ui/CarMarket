import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Animated, {
    useAnimatedStyle,
    withSpring,
    withTiming,
    useSharedValue,
    runOnJS,
} from 'react-native-reanimated';
import { useStackedToastStore, ToastItem } from '../store/stackedToastStore';
import { CheckCircle, AlertCircle, X } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const SPRING = { damping: 18, stiffness: 200, mass: 0.8 };

// ─── Single card ──────────────────────────────────────────────────────────────
const ToastCard = ({
    item,
    index,
    onRemove,
}: {
    item: ToastItem;
    index: number;
    onRemove: (id: string) => void;
}) => {
    // Entrance shared values (set once on mount)
    const enterY = useSharedValue(-55);
    const enterOpacity = useSharedValue(0);

    // Stack position shared values (updated when index changes)
    const stackY = useSharedValue(0);
    const stackScale = useSharedValue(1);
    const stackDim = useSharedValue(1);

    // ── Exit helper — slides up then removes ─────────────────────────────────
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

        const timer = setTimeout(dismiss, 4000);
        return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Stack position (when index changes — NO re-entrance) ─────────────────
    useEffect(() => {
        stackY.value = withSpring(index * 10, SPRING);
        stackScale.value = withSpring(1 - index * 0.05, SPRING);
        stackDim.value = withSpring(
            index === 0 ? 1 : Math.max(0.6, 1 - index * 0.22),
            SPRING,
        );
    }, [index]);

    // ── Only READ shared values here — zero withSpring() calls ───────────────
    const animStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: enterY.value + stackY.value },
            { scale: stackScale.value },
        ],
        opacity: enterOpacity.value * stackDim.value,
    }));

    const isError = item.type === 'error';
    const accentColor = isError ? '#EF4444' : '#10B981';
    const bgColor = isError ? '#1A0E0E' : '#0E1A14';
    const borderColor = isError
        ? 'rgba(239,68,68,0.25)'
        : 'rgba(16,185,129,0.25)';

    return (
        <Animated.View
            style={[
                styles.card,
                { backgroundColor: bgColor, borderColor, zIndex: 100 - index },
                animStyle,
            ]}
        >
            {/* Colored left bar */}
            <View style={[styles.bar, { backgroundColor: accentColor }]} />

            {/* Icon */}
            <View style={[styles.iconWrap, { backgroundColor: accentColor + '22' }]}>
                {isError
                    ? <AlertCircle size={20} color={accentColor} />
                    : <CheckCircle size={20} color={accentColor} />
                }
            </View>

            {/* Text */}
            <View style={styles.textWrap}>
                <Text style={styles.title}>{item.title}</Text>
                {item.description
                    ? <Text style={styles.body}>{item.description}</Text>
                    : null
                }
            </View>

            {/* Close — only on front card, triggers exit animation */}
            {index === 0 && (
                <TouchableOpacity onPress={dismiss} style={styles.closeBtn} hitSlop={10}>
                    <X size={15} color="rgba(255,255,255,0.45)" />
                </TouchableOpacity>
            )}
        </Animated.View>
    );
};

// ─── Stacked container ────────────────────────────────────────────────────────
export default function StackedToaster() {
    const { toasts, removeToast } = useStackedToastStore();

    if (toasts.length === 0) return null;

    return (
        <View style={styles.container} pointerEvents="box-none">
            {[...toasts].reverse().map((toast, reverseIdx) => {
                const index = toasts.length - 1 - reverseIdx; // 0 = newest/front
                return (
                    <ToastCard
                        key={toast.id}
                        item={toast}
                        index={index}
                        onRemove={removeToast}
                    />
                );
            })}
        </View>
    );
}

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
        borderRadius: 18,
        borderWidth: 1,
        paddingHorizontal: 14,
        paddingVertical: 13,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    bar: {
        width: 3,
        height: 36,
        borderRadius: 2,
        marginRight: 12,
    },
    iconWrap: {
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    textWrap: {
        flex: 1,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 15,
        fontFamily: 'Lexend_700Bold',
        letterSpacing: 0.1,
    },
    body: {
        color: '#8E8E93',
        fontSize: 12,
        fontFamily: 'Lexend_400Regular',
        marginTop: 2,
    },
    closeBtn: {
        padding: 4,
        marginLeft: 8,
    },
});
