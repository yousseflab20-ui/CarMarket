export interface OnboardingStore {
  hasCompletedOnboarding: boolean;
  isLoading: boolean;

  setHasCompletedOnboarding: (
    value: boolean
  ) => Promise<void>;

  loadOnboardingStatus: () => Promise<void>;
}