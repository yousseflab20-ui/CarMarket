import { View, Text, Switch } from 'react-native';

import { OptionSwitchProps } from '../../types/components/forms';

export function OptionSwitch({
    label,
    subtitle,
    value,
    onValueChange,
}: OptionSwitchProps) {
    return (
        <View className="flex-row justify-between items-center bg-[#1C1F26] px-3.5 py-3 rounded-xl mb-2.5 border border-[#2D3545]">
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
                    false: '#2D3545',
                    true: '#1E293B',
                }}
            />
        </View>
    );
}