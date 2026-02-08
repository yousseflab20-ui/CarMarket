import { View, Text, Switch, StyleSheet } from 'react-native';

interface OptionSwitchProps {
    label: string;
    subtitle?: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
}

export function OptionSwitch({
    label,
    subtitle,
    value,
    onValueChange,
}: OptionSwitchProps) {
    return (
        <View style={styles.optionRow}>
            <View style={styles.labelContainer}>
                <Text style={styles.optionLabel}>{label}</Text>
                {subtitle && (
                    <Text style={styles.optionSubtitle}>{subtitle}</Text>
                )}
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                thumbColor={value ? '#3B82F6' : '#64748B'}
                trackColor={{
                    false: '#2D3545',
                    true: '#1E293B',
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    optionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#1C1F26',
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#2D3545',
    },
    labelContainer: {
        flex: 1,
    },
    optionLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#E2E8F0',
        marginBottom: 4,
    },
    optionSubtitle: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '500',
    },
});