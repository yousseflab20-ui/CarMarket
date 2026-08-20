import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../hooks/useAppTheme';
import { X } from 'lucide-react-native';
import { useCreateOfferMutation, useCreateNegotiationMutation } from '../../service/negotiation/mutations';
import { router } from 'expo-router';

interface OfferBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  carTitle: string;
  currentPrice: number;
  negotiationId?: string | number;
  carId: number;
}

export function OfferBottomSheet({ visible, onClose, carTitle, currentPrice, negotiationId, carId }: OfferBottomSheetProps) {
  const { isDark } = useAppTheme();
  const { t } = useTranslation();
  
  const [offerAmount, setOfferAmount] = useState('');
  const [feedbackState, setFeedbackState] = useState<'IDLE' | 'AUTO_REJECTED' | 'AUTO_ACCEPTED' | 'PENDING'>('IDLE');
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);
  
  const offerMutation = useCreateOfferMutation();
  const negotiationMutation = useCreateNegotiationMutation();

  const handleSubmit = async () => {
    if (!offerAmount || isNaN(Number(offerAmount))) return;
    
    try {
      let activeNegotiationId = negotiationId;

      // If no negotiationId is provided (e.g. from Car Details), create or fetch the active one first
      if (!activeNegotiationId) {
        const negResponse = await negotiationMutation.mutateAsync(carId);
        activeNegotiationId = negResponse.negotiation.id;
      }

      const response = await offerMutation.mutateAsync({
        negotiationId: activeNegotiationId,
        amount: Number(offerAmount)
      });

      const status = response.offer.status; // PENDING, AUTO_REJECTED, ACCEPTED
      
      if (status === 'AUTO_REJECTED') {
        setFeedbackState('AUTO_REJECTED');
        setAttemptsLeft(response.remainingAttempts ?? 2); 
      } else if (status === 'ACCEPTED') {
        setFeedbackState('AUTO_ACCEPTED');
      } else {
        setFeedbackState('PENDING');
      }

    } catch (error) {
      console.log('Error submitting offer', error);
    }
  };

  const resetAndClose = () => {
    setOfferAmount('');
    setFeedbackState('IDLE');
    onClose();
  };

  const navToRoom = () => {
    resetAndClose();
    router.push({ pathname: '/NegotiationRoom', params: { carId } });
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={resetAndClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}
      >
        <Pressable style={{ flex: 1 }} onPress={resetAndClose} />
        
        <View className="rounded-t-[32px] p-6 pt-2" style={{ backgroundColor: isDark ? '#18181B' : '#FFFFFF' }}>
          {/* Drag Handle */}
          <View className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 self-center my-3" />
          
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-[18px]" style={{ fontFamily: 'Lexend_700Bold', color: isDark ? '#F8FAFC' : '#0F172A' }}>
                {carTitle}
              </Text>
              <Text className="text-[14px]" style={{ fontFamily: 'Lexend_500Medium', color: isDark ? '#94A3B8' : '#64748B' }}>
                Current Price: {currentPrice.toLocaleString()} DH
              </Text>
            </View>
            <TouchableOpacity onPress={resetAndClose} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
              <X size={20} color={isDark ? '#94A3B8' : '#64748B'} />
            </TouchableOpacity>
          </View>

          {feedbackState === 'IDLE' && (
            <View>
              <Text className="text-[13px] mb-2" style={{ fontFamily: 'Lexend_500Medium', color: isDark ? '#94A3B8' : '#64748B' }}>
                Your Offer
              </Text>
              <TextInput
                value={offerAmount}
                onChangeText={setOfferAmount}
                keyboardType="number-pad"
                placeholder="e.g. 165000"
                placeholderTextColor={isDark ? '#475569' : '#94A3B8'}
                className="rounded-2xl border px-4 py-4 text-2xl text-center"
                style={{
                  fontFamily: 'Lexend_700Bold',
                  backgroundColor: isDark ? '#09090B' : '#F8FAFC',
                  borderColor: isDark ? '#27272A' : '#E2E8F0',
                  color: isDark ? '#FFFFFF' : '#0F172A'
                }}
              />
              <Text className="text-[12px] text-center mt-3 mb-6" style={{ fontFamily: 'Lexend_400Regular', color: isDark ? '#94A3B8' : '#64748B' }}>
                This is an offer for this vehicle.
              </Text>

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={offerMutation.isPending || !offerAmount}
                className="rounded-2xl py-4 items-center justify-center"
                style={{ backgroundColor: (offerMutation.isPending || !offerAmount) ? (isDark ? '#334155' : '#CBD5E1') : '#3B82F6' }}
              >
                {offerMutation.isPending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-white text-[16px]" style={{ fontFamily: 'Lexend_700Bold' }}>
                    Submit Offer
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {feedbackState === 'AUTO_REJECTED' && (
            <View className="items-center py-4">
              <Text className="text-4xl mb-4">😕</Text>
              <Text className="text-[20px] mb-2" style={{ fontFamily: 'Lexend_700Bold', color: isDark ? '#F8FAFC' : '#0F172A' }}>
                Offer not accepted
              </Text>
              <Text className="text-[14px] text-center mb-4 px-4" style={{ fontFamily: 'Lexend_400Regular', color: isDark ? '#94A3B8' : '#64748B' }}>
                {Number(offerAmount).toLocaleString()} DH is below the seller's current negotiation range.
              </Text>
              
              <Text className="text-[14px] text-center mb-6" style={{ fontFamily: 'Lexend_600SemiBold', color: isDark ? '#F8FAFC' : '#0F172A' }}>
                {attemptsLeft} attempts remaining. Consider submitting a stronger offer.
              </Text>

              <View className="w-full flex-row gap-3">
                <TouchableOpacity
                  onPress={() => setFeedbackState('IDLE')}
                  className="flex-1 rounded-2xl py-4 items-center justify-center border"
                  style={{ borderColor: isDark ? '#27272A' : '#E2E8F0' }}
                >
                  <Text className="text-[15px]" style={{ fontFamily: 'Lexend_700Bold', color: isDark ? '#F8FAFC' : '#0F172A' }}>Try Again</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={navToRoom}
                  className="flex-1 rounded-2xl py-4 items-center justify-center bg-blue-500"
                >
                  <Text className="text-[15px] text-white" style={{ fontFamily: 'Lexend_700Bold' }}>View Negotiation</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {feedbackState === 'AUTO_ACCEPTED' && (
            <View className="items-center py-4">
              <Text className="text-4xl mb-4">🎉</Text>
              <Text className="text-[20px] mb-2" style={{ fontFamily: 'Lexend_700Bold', color: isDark ? '#F8FAFC' : '#0F172A' }}>
                Offer Accepted!
              </Text>
              <Text className="text-[24px] mb-4 text-blue-500" style={{ fontFamily: 'Lexend_800ExtraBold' }}>
                {Number(offerAmount).toLocaleString()} DH
              </Text>
              <Text className="text-[14px] text-center mb-8 px-4" style={{ fontFamily: 'Lexend_400Regular', color: isDark ? '#94A3B8' : '#64748B' }}>
                The seller's Smart Negotiation rules accepted your offer automatically.
              </Text>

              <TouchableOpacity
                onPress={navToRoom}
                className="w-full rounded-2xl py-4 items-center justify-center bg-blue-500"
              >
                <Text className="text-[15px] text-white" style={{ fontFamily: 'Lexend_700Bold' }}>Continue to Negotiation</Text>
              </TouchableOpacity>
            </View>
          )}

          {feedbackState === 'PENDING' && (
            <View className="items-center py-4">
              <Text className="text-4xl mb-4">⏳</Text>
              <Text className="text-[20px] mb-2" style={{ fontFamily: 'Lexend_700Bold', color: isDark ? '#F8FAFC' : '#0F172A' }}>
                Offer sent
              </Text>
              <Text className="text-[24px] mb-4 text-blue-500" style={{ fontFamily: 'Lexend_800ExtraBold' }}>
                {Number(offerAmount).toLocaleString()} DH
              </Text>
              <Text className="text-[14px] text-center mb-1" style={{ fontFamily: 'Lexend_400Regular', color: isDark ? '#94A3B8' : '#64748B' }}>
                The seller is reviewing your offer.
              </Text>
              <Text className="text-[14px] text-center mb-8 px-4" style={{ fontFamily: 'Lexend_400Regular', color: isDark ? '#94A3B8' : '#64748B' }}>
                We'll let you know when they respond.
              </Text>

              <TouchableOpacity
                onPress={navToRoom}
                className="w-full rounded-2xl py-4 items-center justify-center bg-blue-500"
              >
                <Text className="text-[15px] text-white" style={{ fontFamily: 'Lexend_700Bold' }}>View Negotiation</Text>
              </TouchableOpacity>
            </View>
          )}

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
