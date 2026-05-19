import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, TouchableOpacity } from 'react-native';

import { FeatureSelectorProps } from '../../types/components/forms';

export function FeatureSelector({
    features,
    selectedFeatures,
    onFeaturesChange,
    translationKey,
}: FeatureSelectorProps) {
    const { t } = useTranslation();
    const toggleFeature = (feature: string) => {
        if (selectedFeatures.includes(feature)) {
            onFeaturesChange(selectedFeatures.filter((f) => f !== feature));
        } else {
            onFeaturesChange([...selectedFeatures, feature]);
        }
    };

    return (
        <View className="mb-6">
            <Text className="text-base text-slate-200 mb-3.5" style={{ fontFamily: 'Lexend_700Bold' }}>
                {t('addCar.specs')} - {t('addCar.options')}
            </Text>
            <View className="flex-row flex-wrap gap-2.5">
                {features.map((feature) => {
                    const isSelected = selectedFeatures.includes(feature);
                    return (
                        <TouchableOpacity
                            key={feature}
                            className={[
                                "bg-[#1C1F26] border-[1.5px] border-[#2D3545] rounded-xl px-3.5 py-2.5 w-[48%]",
                                isSelected ? "bg-blue-500 border-blue-500" : "",
                            ].join(" ")}
                            onPress={() => toggleFeature(feature)}
                            activeOpacity={0.7}
                        >
                            <Text
                                className={[
                                    "text-slate-400 text-xs text-center",
                                    isSelected ? "text-white" : "",
                                ].join(" ")}
                                style={{ fontFamily: 'Lexend_600SemiBold' }}
                            >
                                {translationKey ? t(`${translationKey}.${feature}`) : feature}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}