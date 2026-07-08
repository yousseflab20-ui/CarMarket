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
        <View className="mb-6 mt-2">
            <Text className="text-[13px] text-slate-500 dark:text-slate-400 mb-3" style={{ fontFamily: 'Lexend_600SemiBold' }}>
                {t('addCar.specs')} - {t('addCar.options')}
            </Text>
            <View className="flex-row flex-wrap justify-between gap-y-3">
                {features.map((feature) => {
                    const isSelected = selectedFeatures.includes(feature);
                    return (
                        <TouchableOpacity
                            key={feature}
                            className={[
                                "w-[48%] py-3.5 rounded-[14px] border-[1.5px] items-center justify-center",
                                isSelected 
                                    ? "bg-blue-500/20 border-blue-500" 
                                    : "bg-slate-50 dark:bg-[#18181B] border-slate-200 dark:border-[#27272A]"
                            ].join(" ")}
                            onPress={() => toggleFeature(feature)}
                            activeOpacity={0.7}
                        >
                            <Text
                                className={[
                                    "text-[13px] text-center",
                                    isSelected ? "text-blue-600 dark:text-white" : "text-slate-700 dark:text-slate-300"
                                ].join(" ")}
                                style={{ fontFamily: 'Lexend_600SemiBold' }}
                            >
                                {feature === 'AC' ? 'A/C' : (translationKey ? t(`${translationKey}.${feature}`) : feature)}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}