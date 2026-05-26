import { View, Text, Switch } from 'react-native';

import { OptionSwitchProps } from '../../types/components/forms';

export function OptionSwitch({
    label,
    subtitle,
    value,
    onValueChange,
}: OptionSwitchProps) {
    return (
        <View className="flex-row justify-between items-center bg-[#18181B] px-3.5 py-3 rounded-xl mb-2.5 border border-[#27272A]">
            <View className="flex-1">
                <Text className="text-sm text-slate-200 mb-1" style={{ fontFamily: 'Lexend_600SemiBold' }}>
                    {label}
                </Text>
                {subtitle && (
                    <Text className="text-xs text-slate-500" style={{ fontFamily: 'Lexend_500Medium' }}>
                        {subtitle}
                    </Text>
                )}
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                thumbColor={value ? '#3B82F6' : '#64748B'}
                trackColor={{
                    false: '#27272A',
                    true: '#1E293B',
                }}
            />
        </View>
    );
}