import { View, Text, TextInput, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { Control, Controller } from 'react-hook-form';

interface FormInputProps extends Omit<TextInputProps, 'value' | 'onChangeText'> {
    control: Control<any>;
    name: string;
    label: string;
    required?: boolean;
    containerStyle?: ViewStyle;
}

export function FormInput({
    control,
    name,
    label,
    required = false,
    containerStyle,
    ...textInputProps
}: FormInputProps) {
    return (
        <Controller
            control={control}
            name={name}
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <View style={[styles.formGroup, containerStyle]}>
                    <Text style={styles.label}>
                        {label}{required && ' *'}
                    </Text>
                    <TextInput
                        style={[
                            styles.input,
                            error && styles.inputError,
                        ]}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholderTextColor="#64748B"
                        {...textInputProps}
                    />
                    {error && (
                        <Text style={styles.errorText}>{error.message}</Text>
                    )}
                </View>
            )}
        />
    );
}

const styles = StyleSheet.create({
    formGroup: {
        marginBottom: 12,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#94A3B8',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#1C1F26',
        borderWidth: 1,
        borderColor: '#2D3545',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        color: '#E2E8F0',
        fontSize: 14,
        fontWeight: '500',
    },
    inputError: {
        borderColor: '#EF4444',
    },
    errorText: {
        color: '#EF4444',
        fontSize: 12,
        marginTop: 4,
        fontWeight: '500',
    },
});
