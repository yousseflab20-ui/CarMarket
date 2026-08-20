import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams, router } from 'expo-router';
import { useAppTheme } from '../hooks/useAppTheme';
import { ArrowLeft, Clock, CheckCircle, XCircle } from 'lucide-react-native';
// In a real app we would use `useBuyerNegotiationsQuery` or a specific query for this negotiation
import { useAuthStore } from '../store/authStore';

export default function NegotiationRoom() {
  const { isDark } = useAppTheme();
  const { t } = useTranslation();
  const { carId, negotiationId } = useLocalSearchParams();
  const { user } = useAuthStore();
  
  // NOTE: Mock data for the UI implementation.
  // In production, fetch the negotiation by ID and include Offers, Car, etc.
  const mockNegotiation = {
    car: {
      brand: 'Volkswagen',
      model: 'Golf 7 GTD',
      price: 180000,
    },
    status: 'ACTIVE', // ACTIVE, ACCEPTED, REJECTED, EXPIRED
    latestOfferType: 'SELLER_COUNTER',
    latestOfferStatus: 'PENDING',
    offers: [
      { id: 1, type: 'BUYER_OFFER', amount: 160000, status: 'REJECTED', createdAt: new Date(Date.now() - 1000 * 60 * 60) },
      { id: 2, type: 'BUYER_OFFER', amount: 165000, status: 'COUNTERED', createdAt: new Date(Date.now() - 1000 * 60 * 30) },
      { id: 3, type: 'SELLER_COUNTER', amount: 171000, status: 'PENDING', createdAt: new Date(Date.now() - 1000 * 60 * 2) },
    ]
  };

  const currentStatus = mockNegotiation.status;
  const latestOffer = mockNegotiation.offers[mockNegotiation.offers.length - 1];

  const getStatusDisplay = () => {
    if (currentStatus === 'ACCEPTED') return { label: '✅ Accepted', color: '#10B981', bg: 'rgba(16,185,129,0.1)' };
    if (currentStatus === 'REJECTED') return { label: '❌ Rejected', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' };
    
    if (latestOffer?.type === 'BUYER_OFFER' && latestOffer?.status === 'PENDING') {
      return { label: '⏳ Waiting for seller', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' };
    }
    if (latestOffer?.type === 'SELLER_COUNTER' && latestOffer?.status === 'PENDING') {
      return { label: '🔄 Counter Offer', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' };
    }
    
    return { label: '⏳ Pending', color: '#64748B', bg: 'rgba(100,116,139,0.1)' };
  };

  const statusDisplay = getStatusDisplay();

  const handleAccept = () => {
    // Call counterResponse mutation with ACCEPT
    console.log("Accepting offer", latestOffer.id);
  };

  const handleDecline = () => {
    // Call counterResponse mutation with REJECT
    console.log("Declining offer", latestOffer.id);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#09090B' : '#F8FAFC' }}>
      <View className="flex-row items-center px-5 py-4 border-b" style={{ borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#E2E8F0', backgroundColor: isDark ? '#18181B' : '#FFFFFF' }}>
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft color={isDark ? '#FFFFFF' : '#0F172A'} size={24} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-[16px]" style={{ fontFamily: 'Lexend_700Bold', color: isDark ? '#FFFFFF' : '#0F172A' }}>
            {mockNegotiation.car.brand} {mockNegotiation.car.model}
          </Text>
          <Text className="text-[13px]" style={{ fontFamily: 'Lexend_500Medium', color: isDark ? '#94A3B8' : '#64748B' }}>
            {mockNegotiation.car.price.toLocaleString()} DH
          </Text>
        </View>
        <View className="px-3 py-1.5 rounded-full" style={{ backgroundColor: statusDisplay.bg }}>
          <Text className="text-[12px]" style={{ fontFamily: 'Lexend_600SemiBold', color: statusDisplay.color }}>
            {statusDisplay.label}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-5 pt-6 pb-24">
        {mockNegotiation.offers.map((offer, index) => {
          const isBuyer = offer.type === 'BUYER_OFFER';
          const isLast = index === mockNegotiation.offers.length - 1;
          
          return (
            <View key={offer.id} className="mb-6">
              <View className="flex-row items-start justify-between">
                <View>
                  <Text className="text-[14px] mb-1" style={{ fontFamily: 'Lexend_600SemiBold', color: isDark ? '#E2E8F0' : '#334155' }}>
                    {isBuyer ? 'You offered' : 'Seller counter-offered'}
                  </Text>
                  <Text className="text-[12px]" style={{ fontFamily: 'Lexend_400Regular', color: isDark ? '#64748B' : '#94A3B8' }}>
                    {offer.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <Text className="text-[16px]" style={{ fontFamily: 'Lexend_700Bold', color: isDark ? '#FFFFFF' : '#0F172A' }}>
                  {offer.amount.toLocaleString()} DH
                </Text>
              </View>
              
              {offer.status === 'REJECTED' && (
                <View className="mt-2 flex-row items-center gap-1.5">
                  <XCircle size={14} color="#EF4444" />
                  <Text className="text-[12px] text-red-500" style={{ fontFamily: 'Lexend_500Medium' }}>
                    {isBuyer ? 'Seller rejected' : 'You rejected'}
                  </Text>
                </View>
              )}
              {offer.status === 'ACCEPTED' && (
                <View className="mt-2 flex-row items-center gap-1.5">
                  <CheckCircle size={14} color="#10B981" />
                  <Text className="text-[12px] text-emerald-500" style={{ fontFamily: 'Lexend_500Medium' }}>
                    {isBuyer ? 'Seller accepted' : 'You accepted'}
                  </Text>
                </View>
              )}

              {!isLast && (
                <View className="items-center mt-6">
                  <View className="w-0.5 h-6 bg-slate-200 dark:bg-slate-800" />
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* STICKY BOTTOM ACTION CARD */}
      {latestOffer?.type === 'SELLER_COUNTER' && latestOffer?.status === 'PENDING' && (
        <View className="absolute bottom-0 w-full p-5 pt-4 rounded-t-3xl border-t shadow-2xl" style={{ backgroundColor: isDark ? '#18181B' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 12 }}>
          <Text className="text-[13px] text-center mb-1" style={{ fontFamily: 'Lexend_500Medium', color: isDark ? '#94A3B8' : '#64748B' }}>
            Seller's Counter-Offer
          </Text>
          <Text className="text-[24px] text-center mb-5 text-blue-500" style={{ fontFamily: 'Lexend_800ExtraBold' }}>
            {latestOffer.amount.toLocaleString()} DH
          </Text>
          <View className="flex-row gap-3">
            <TouchableOpacity onPress={handleDecline} className="flex-1 py-4 rounded-2xl items-center border" style={{ borderColor: isDark ? '#27272A' : '#E2E8F0' }}>
              <Text className="text-[15px]" style={{ fontFamily: 'Lexend_700Bold', color: isDark ? '#FFFFFF' : '#0F172A' }}>
                Decline
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleAccept} className="flex-[2] py-4 rounded-2xl items-center bg-blue-500">
              <Text className="text-[15px] text-white" style={{ fontFamily: 'Lexend_700Bold' }}>
                Accept {latestOffer.amount.toLocaleString()} DH
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {currentStatus === 'ACCEPTED' && (
        <View className="absolute bottom-0 w-full p-5 pt-4 rounded-t-3xl border-t shadow-2xl" style={{ backgroundColor: isDark ? '#18181B' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 12 }}>
          <Text className="text-[16px] text-center mb-1" style={{ fontFamily: 'Lexend_700Bold', color: '#10B981' }}>
            🎉 Deal agreed
          </Text>
          <Text className="text-[24px] text-center mb-5 text-blue-500" style={{ fontFamily: 'Lexend_800ExtraBold' }}>
            {latestOffer.amount.toLocaleString()} DH
          </Text>
          <TouchableOpacity className="w-full py-4 rounded-2xl items-center bg-blue-500">
            <Text className="text-[15px] text-white" style={{ fontFamily: 'Lexend_700Bold' }}>
              Open Chat
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {currentStatus === 'REJECTED' && (
        <View className="absolute bottom-0 w-full p-5 pt-4 rounded-t-3xl border-t shadow-2xl" style={{ backgroundColor: isDark ? '#18181B' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 12 }}>
          <Text className="text-[16px] text-center mb-1" style={{ fontFamily: 'Lexend_700Bold', color: isDark ? '#FFFFFF' : '#0F172A' }}>
            Counter declined.
          </Text>
          <Text className="text-[13px] text-center mb-5" style={{ fontFamily: 'Lexend_400Regular', color: isDark ? '#94A3B8' : '#64748B' }}>
            You can submit another offer for this vehicle.
          </Text>
          <TouchableOpacity className="w-full py-4 rounded-2xl items-center bg-blue-500">
            <Text className="text-[15px] text-white" style={{ fontFamily: 'Lexend_700Bold' }}>
              Make Another Offer
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
