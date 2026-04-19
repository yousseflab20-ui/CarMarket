import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

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
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>{t('addCar.specs')} - {t('addCar.options')}</Text>
            <View style={styles.featuresGrid}>
                {features.map((feature) => {
                    const isSelected = selectedFeatures.includes(feature);
                    return (
                        <TouchableOpacity
                            key={feature}
                            style={[
                                styles.featureButton,
                                isSelected && styles.featureButtonActive,
                            ]}
                            onPress={() => toggleFeature(feature)}
                            activeOpacity={0.7}
                        >
                            <Text
                                style={[
                                    styles.featureText,
                                    isSelected && styles.featureTextActive,
                                ]}
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

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: 'Lexend_700Bold',
        color: '#E2E8F0',
        marginBottom: 14,
    },
    featuresGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    featureButton: {
        backgroundColor: '#1C1F26',
        borderWidth: 1.5,
        borderColor: '#2D3545',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        width: '48%',
    },
    featureButtonActive: {
        backgroundColor: '#3B82F6',
        borderColor: '#3B82F6',
    },
    featureText: {
        color: '#94A3B8',
        fontSize: 12,
        fontFamily: 'Lexend_600SemiBold',
        textAlign: 'center',
    },
    featureTextActive: {
        color: '#fff',
    },
});