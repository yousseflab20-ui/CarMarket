export interface OnboardingFeature {
    icon: string;
    label: string;
}

export interface OnboardingSlide {
    id: number;
    image: any;
    title: string;
    description: string;
    buttonText: string;
    headerTitle?: string;
    headerSubtitle?: string;
    headerDesc?: string;
    features?: OnboardingFeature[];
    stepNumber?: number;
}
