import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAppTheme } from '../hooks/useAppTheme';
import { ArrowLeft, XCircle, CheckCircle } from 'lucide-react-native';
import { useNegotiationByIdQuery } from '../service/negotiation/queries';
import { useRespondToCounterOfferMutation } from '../service/negotiation/mutations';
import { useAuthStore } from '../store/authStore';

export default function NegotiationRoom() {
  const { isDark } = useAppTheme();
  const { negotiationId } = useLocalSearchParams<{ negotiationId: string }>();
  const { user } = useAuthStore();
  const [actionLoading, setActionLoading] = useState(false);

  const { data, isLoading, isError, refetch } = useNegotiationByIdQuery(negotiationId ?? null);
  const negotiation = data?.negotiation;

  const respondMutation = useRespondToCounterOfferMutation();

  const handleRespond = async (action: 'ACCEPT' | 'REJECT') => {
    const latestOffer = negotiation?.Offers?.[negotiation.Offers.length - 1];
    if (!latestOffer) return;
    setActionLoading(true);
    try {
      await respondMutation.mutateAsync({ offerId: latestOffer.id, action });
      refetch();
    } catch (e) {
      console.log('Respond error', e);
    } finally {
      setActionLoading(false);
    }
  };

  // ---- STATUS LOGIC ----
  const getStatusDisplay = () => {
    if (!negotiation) return { label: '...', color: '#64748B', bg: 'rgba(100,116,139,0.1)' };
    const status = negotiation.status;
    const offers: any[] = negotiation.Offers ?? [];
    const latest = offers[offers.length - 1];

    if (status === 'ACCEPTED') return { label: '✅ Accepted', color: '#10B981', bg: 'rgba(16,185,129,0.1)' };
    if (status === 'REJECTED' || status === 'EXPIRED') return { label: '❌ Rejected', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' };

    if (latest?.type === 'SELLER_COUNTER' && latest?.status === 'PENDING') {
      return { label: '🔄 Counter Offer', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' };
    }
    return { label: '⏳ Waiting for seller', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' };
  };

  const statusDisplay = getStatusDisplay();
  const offers: any[] = negotiation?.Offers ?? [];
  const latestOffer = offers[offers.length - 1];
  const isBuyer = negotiation?.buyerId === user?.id;
  const isCounterPending = latestOffer?.type === 'SELLER_COUNTER' && latestOffer?.status === 'PENDING';

  const car = negotiation?.Car ?? negotiation?.car;

  // ---- LOADING / ERROR ----
  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? '#09090B' : '#F8FAFC' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </SafeAreaView>
    );
  }

  if (isError || !negotiation) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? '#09090B' : '#F8FAFC' }}>
        <Text style={{ color: '#EF4444', fontFamily: 'Lexend_500Medium', fontSize: 15 }}>Failed to load negotiation.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: '#3B82F6', fontFamily: 'Lexend_600SemiBold' }}>Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#09090B' : '#F8FAFC' }}>
      {/* HEADER */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#E2E8F0', backgroundColor: isDark ? '#18181B' : '#FFFFFF' }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
          <ArrowLeft color={isDark ? '#FFFFFF' : '#0F172A'} size={24} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: 'Lexend_700Bold', fontSize: 16, color: isDark ? '#FFFFFF' : '#0F172A' }}>
            {car?.brand} {car?.model}
          </Text>
          <Text style={{ fontFamily: 'Lexend_500Medium', fontSize: 13, color: isDark ? '#94A3B8' : '#64748B' }}>
            {Number(car?.price ?? 0).toLocaleString()} DH
          </Text>
        </View>
        <View style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: statusDisplay.bg }}>
          <Text style={{ fontFamily: 'Lexend_600SemiBold', fontSize: 12, color: statusDisplay.color }}>
            {statusDisplay.label}
          </Text>
        </View>
      </View>

      {/* FINANCIAL TIMELINE */}
      <ScrollView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 24 }} contentContainerStyle={{ paddingBottom: 140 }}>
        {offers.length === 0 && (
          <Text style={{ color: isDark ? '#64748B' : '#94A3B8', fontFamily: 'Lexend_400Regular', textAlign: 'center', marginTop: 40 }}>
            No offers yet.
          </Text>
        )}
        {offers.map((offer: any, index: number) => {
          const isFromBuyer = offer.type === 'BUYER_OFFER';
          const isLast = index === offers.length - 1;

          return (
            <View key={offer.id} style={{ marginBottom: 24 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <View>
                  <Text style={{ fontFamily: 'Lexend_600SemiBold', fontSize: 14, color: isDark ? '#E2E8F0' : '#334155', marginBottom: 4 }}>
                    {isFromBuyer ? 'You offered' : 'Seller counter-offered'}
                  </Text>
                  <Text style={{ fontFamily: 'Lexend_400Regular', fontSize: 12, color: isDark ? '#64748B' : '#94A3B8' }}>
                    {new Date(offer.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <Text style={{ fontFamily: 'Lexend_700Bold', fontSize: 16, color: isDark ? '#FFFFFF' : '#0F172A' }}>
                  {Number(offer.amount).toLocaleString()} DH
                </Text>
              </View>

              {offer.status === 'REJECTED' && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
                  <XCircle size={14} color="#EF4444" />
                  <Text style={{ fontFamily: 'Lexend_500Medium', fontSize: 12, color: '#EF4444' }}>
                    {isFromBuyer ? 'Seller rejected' : 'You rejected'}
                  </Text>
                </View>
              )}
              {offer.status === 'AUTO_REJECTED' && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
                  <XCircle size={14} color="#EF4444" />
                  <Text style={{ fontFamily: 'Lexend_500Medium', fontSize: 12, color: '#EF4444' }}>
                    Automatically rejected
                  </Text>
                </View>
              )}
              {offer.status === 'ACCEPTED' && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
                  <CheckCircle size={14} color="#10B981" />
                  <Text style={{ fontFamily: 'Lexend_500Medium', fontSize: 12, color: '#10B981' }}>
                    {isFromBuyer ? 'Seller accepted' : 'You accepted'}
                  </Text>
                </View>
              )}

              {!isLast && (
                <View style={{ alignItems: 'center', marginTop: 20 }}>
                  <View style={{ width: 1, height: 24, backgroundColor: isDark ? '#27272A' : '#E2E8F0' }} />
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* STICKY BOTTOM ACTION CARD */}
      {isBuyer && isCounterPending && (
        <View style={{ position: 'absolute', bottom: 0, width: '100%', padding: 20, paddingTop: 16, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderTopWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#E2E8F0', backgroundColor: isDark ? '#18181B' : '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 12 }}>
          <Text style={{ fontFamily: 'Lexend_500Medium', fontSize: 13, color: isDark ? '#94A3B8' : '#64748B', textAlign: 'center', marginBottom: 4 }}>
            Seller's Counter-Offer
          </Text>
          <Text style={{ fontFamily: 'Lexend_800ExtraBold', fontSize: 24, color: '#3B82F6', textAlign: 'center', marginBottom: 20 }}>
            {Number(latestOffer.amount).toLocaleString()} DH
          </Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              onPress={() => handleRespond('REJECT')}
              disabled={actionLoading}
              style={{ flex: 1, paddingVertical: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: isDark ? '#27272A' : '#E2E8F0' }}
            >
              <Text style={{ fontFamily: 'Lexend_700Bold', fontSize: 15, color: isDark ? '#FFFFFF' : '#0F172A' }}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleRespond('ACCEPT')}
              disabled={actionLoading}
              style={{ flex: 2, paddingVertical: 16, borderRadius: 16, alignItems: 'center', backgroundColor: '#3B82F6' }}
            >
              {actionLoading
                ? <ActivityIndicator color="#fff" />
                : <Text style={{ fontFamily: 'Lexend_700Bold', fontSize: 15, color: '#FFFFFF' }}>Accept {Number(latestOffer.amount).toLocaleString()} DH</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      )}

      {negotiation.status === 'ACCEPTED' && (
        <View style={{ position: 'absolute', bottom: 0, width: '100%', padding: 20, paddingTop: 16, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderTopWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#E2E8F0', backgroundColor: isDark ? '#18181B' : '#FFFFFF' }}>
          <Text style={{ fontFamily: 'Lexend_700Bold', fontSize: 16, color: '#10B981', textAlign: 'center', marginBottom: 4 }}>🎉 Deal agreed</Text>
          <Text style={{ fontFamily: 'Lexend_800ExtraBold', fontSize: 24, color: '#3B82F6', textAlign: 'center', marginBottom: 20 }}>
            {Number(latestOffer?.amount ?? 0).toLocaleString()} DH
          </Text>
          <TouchableOpacity style={{ paddingVertical: 16, borderRadius: 16, alignItems: 'center', backgroundColor: '#3B82F6' }}>
            <Text style={{ fontFamily: 'Lexend_700Bold', fontSize: 15, color: '#FFFFFF' }}>Open Chat</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
