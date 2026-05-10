import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { CheckCircle, AlertCircle, X } from 'lucide-react-native';

const { width } = Dimensions.get('window');

// ─── Success Toast ────────────────────────────────────────────────────────────
const SuccessToast = ({ text1, text2, hide }: any) => (
    <View style={[styles.card, styles.successCard]}>
        <View style={styles.iconWrap}>
            <CheckCircle size={22} color="#fff" />
        </View>
        <View style={styles.textWrap}>
            <Text style={styles.title}>{text1}</Text>
            {text2 ? <Text style={styles.body}>{text2}</Text> : null}
        </View>
        <TouchableOpacity onPress={hide} style={styles.closeWrap}>
            <X size={16} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>
    </View>
);

// ─── Error Toast ──────────────────────────────────────────────────────────────
const ErrorToast = ({ text1, text2, hide }: any) => (
    <View style={[styles.card, styles.errorCard]}>
        <View style={styles.iconWrap}>
            <AlertCircle size={22} color="#fff" />
        </View>
        <View style={styles.textWrap}>
            <Text style={styles.title}>{text1}</Text>
            {text2 ? <Text style={styles.body}>{text2}</Text> : null}
        </View>
        <TouchableOpacity onPress={hide} style={styles.closeWrap}>
            <X size={16} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>
    </View>
);

// ─── Export config ────────────────────────────────────────────────────────────
export const toastConfig = {
    success: (props: any) => <SuccessToast {...props} />,
    error: (props: any) => <ErrorToast {...props} />,
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    card: {
        width: width - 32,
        marginTop: 10,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 8,
        borderWidth: 1,
    },
    successCard: {
        backgroundColor: '#0D1F18',
        borderColor: 'rgba(16,185,129,0.25)',
    },
    errorCard: {
        backgroundColor: '#1F0D0D',
        borderColor: 'rgba(239,68,68,0.25)',
    },
    iconWrap: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.1)',
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
        letterSpacing: 0.2,
    },
    body: {
        color: '#8E8E93',
        fontSize: 12,
        fontFamily: 'Lexend_400Regular',
        marginTop: 2,
    },
    closeWrap: {
        padding: 6,
        marginLeft: 8,
    },
});
