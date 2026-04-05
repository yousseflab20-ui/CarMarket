export interface VerificationPayload {
    fullName: string;
    phone: string;
    city: string;
    bio: string;
    selfieUri: string | null;
}

export interface VerificationResponse {
    message: string;
    success: boolean;
}

export interface FieldProps {
    label: string;
    icon: React.ReactNode;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    multiline?: boolean;
    rows?: number;
    keyboardType?: any;
}

export interface UploadBoxProps {
    icon: React.ReactNode;
    label: string;
    sublabel: string;
    done: boolean;
    onPress: () => void;
}

export interface ReviewRowProps {
    label: string;
    value: string;
}
