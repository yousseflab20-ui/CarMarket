import { OnboardingSlide } from "../../types/screens/onboarding";

export const onboardingData: OnboardingSlide[] = [
  {
    id: 1,
    image: require("../../assets/image/01_Onboarding_Take_Photos.png"),
    title: "Sell Your Car Easily",
    description:
      "Take photos of your car and create your listing in minutes",
    buttonText: "Next",
  },

  {
    id: 2,
    image: require("../../assets/image/02_Onboarding_Add_Car.png"),
    title: "Create Listings Fast",
    description:
      "Add details, upload images, and publish your car instantly",
    buttonText: "Next",
  },

  {
    id: 3,
    image: require("../../assets/image/03_Onboarding_Deals_Map.png"),
    title: "Connect With Buyers",
    description:
      "Connect with nearby buyers and close deals easily",
    buttonText: "Next",
  },

  {
    id: 4,
    image: require("../../assets/image/04_Onboarding_Close_Deal.png"),
    title: "Buy & Sell With Confidence",
    description:
      "Safe, fast, and reliable car marketplace experience",
    buttonText: "Get Started",
  },
];

export default function DummyOnboardingData() {
    return null;
}