import * as ImagePicker from "expo-image-picker";
import { TextInputProps, ViewStyle } from 'react-native';
import { Control, FieldValues, Path } from 'react-hook-form';

export interface FeatureSelectorProps {
    features: readonly string[];
    selectedFeatures: string[];
    onFeaturesChange: (features: string[]) => void;
}

export interface ImageUploaderProps {
    images: ImagePicker.ImagePickerAsset[];
    onImagesChange: (images: ImagePicker.ImagePickerAsset[]) => void;
    maxImages?: number;
}

export interface OptionSwitchProps {
    label: string;
    subtitle?: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
}

export interface SelectFieldProps {
    label: string;
    options: readonly string[];
    value: string;
    onValueChange: (value: string) => void;
    containerStyle?: object;
}

export interface FormInputProps<T extends FieldValues> extends Omit<TextInputProps, 'value' | 'onChangeText'> {
    control: Control<T>;
    name: Path<T>;
    label: string;
    required?: boolean;
    containerStyle?: ViewStyle;
}
