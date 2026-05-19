import { View, Text, TextInput } from 'react-native';
import { Controller, FieldValues } from 'react-hook-form';
import { FormInputProps } from '../../types/components/forms';

export function FormInput<T extends FieldValues>({
    control,
    name,
    label,
    required = false,
    containerStyle,
    ...textInputProps
}: FormInputProps<T>) {

    return (
        <Controller
            control={control}
            name={name}
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <View className="mb-3" style={containerStyle}>
                    <Text className="text-[13px] text-slate-400 mb-2" style={{ fontFamily: 'Lexend_600SemiBold' }}>
                        {label}
                    </Text>
                    <TextInput
                        className={[
                            "bg-[#1C1F26] border border-[#2D3545] rounded-xl px-3.5 py-3 text-slate-200 text-sm",
                            error ? "border-red-500" : "",
                        ].join(" ")}
                        style={[{ fontFamily: 'Lexend_500Medium' }, textInputProps.style]}
                        value={value}
                        onChangeText={onChange}
                        placeholderTextColor="#64748B"
                        {...textInputProps}
                    />
                    {error && (
                        <Text className="text-red-500 text-xs mt-1" style={{ fontFamily: 'Lexend_500Medium' }}>
                            {error.message}
                        </Text>
                    )}
                </View>
            )}
        />
    );
}