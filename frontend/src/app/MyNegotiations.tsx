import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Image } from 'react-native';
import { router } from 'expo-router';
import { useAppTheme } from '../hooks/useAppTheme';
import { ArrowLeft, Handshake, ChevronRight } from 'lucide-react-native';
import { useBuyerNegotiationsQuery, useSellerNegotiationsQuery } from '../service/negotiation/queries';
import { useTranslation } from 'react-i18next';

export default function MyNegotiations() {
  const { isDark } = useAppTheme();
  const { t } = useTranslation();
  
  // Tabs: 'BUYING' or 'SELLING'
  const [activeTab, setActiveTab] = useState<'BUYING' | 'SELLING'>('BUYING');

  const { data: buyerData, isLoading: loadingBuyer } = useBuyerNegotiationsQuery();
  const { data: sellerData, isLoading: loadingSeller } = useSellerNegotiationsQuery();

  const negotiations = activeTab === 'BUYING' ? buyerData?.negotiations || [] : sellerData?.negotiations || [];
  const isLoading = activeTab === 'BUYING' ? loadingBuyer : loadingSeller;

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'ACCEPTED': return '#10B981';
      case 'REJECTED': return '#EF4444';
      default: return '#F59E0B'; // ACTIVE / PENDING
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#09090B' : '#F8FAFC' }}>
      {/* HEADER */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#E2E8F0', backgroundColor: isDark ? '#18181B' : '#FFFFFF' }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
          <ArrowLeft color={isDark ? '#FFFFFF' : '#0F172A'} size={24} />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Lexend_700Bold', fontSize: 18, color: isDark ? '#FFFFFF' : '#0F172A', flex: 1 }}>
          My Negotiations
        </Text>
      </View>

      {/* TABS */}
      <View style={{ flexDirection: 'row', padding: 20, paddingBottom: 10 }}>
        <TouchableOpacity 
          onPress={() => setActiveTab('BUYING')}
          style={{ flex: 1, paddingVertical: 12, borderBottomWidth: 2, borderColor: activeTab === 'BUYING' ? '#3B82F6' : 'transparent', alignItems: 'center' }}
        >
          <Text style={{ fontFamily: 'Lexend_600SemiBold', fontSize: 15, color: activeTab === 'BUYING' ? '#3B82F6' : (isDark ? '#64748B' : '#94A3B8') }}>
            Buying ({buyerData?.negotiations?.length || 0})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setActiveTab('SELLING')}
          style={{ flex: 1, paddingVertical: 12, borderBottomWidth: 2, borderColor: activeTab === 'SELLING' ? '#3B82F6' : 'transparent', alignItems: 'center' }}
        >
          <Text style={{ fontFamily: 'Lexend_600SemiBold', fontSize: 15, color: activeTab === 'SELLING' ? '#3B82F6' : (isDark ? '#64748B' : '#94A3B8') }}>
            Selling ({sellerData?.negotiations?.length || 0})
          </Text>
        </TouchableOpacity>
      </View>

      {/* LIST */}
      <ScrollView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 10 }} contentContainerStyle={{ paddingBottom: 40 }}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 40 }} />
        ) : negotiations.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 80 }}>
            <Handshake size={48} color={isDark ? '#27272A' : '#E2E8F0'} style={{ marginBottom: 16 }} />
            <Text style={{ fontFamily: 'Lexend_500Medium', fontSize: 16, color: isDark ? '#94A3B8' : '#64748B' }}>
              No negotiations yet
            </Text>
          </View>
        ) : (
          negotiations.map((neg: any) => {
            const car = neg.Car;
            const otherUser = activeTab === 'BUYING' ? neg.seller : neg.buyer;
            const latestOffer = neg.Offers?.[0]; // Assuming sorted DESC
            const carImage = car?.images?.[0] || 'https://via.placeholder.com/150';

            return (
              <TouchableOpacity
                key={neg.id}
                onPress={() => router.push({ pathname: '/NegotiationRoom', params: { negotiationId: neg.id } })}
                style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  padding: 16, 
                  backgroundColor: isDark ? '#18181B' : '#FFFFFF', 
                  borderRadius: 16, 
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#E2E8F0'
                }}
              >
                <Image source={{ uri: carImage }} style={{ width: 60, height: 60, borderRadius: 12, marginRight: 12 }} />
                
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: 'Lexend_600SemiBold', fontSize: 15, color: isDark ? '#FFFFFF' : '#0F172A', marginBottom: 4 }} numberOfLines={1}>
                    {car?.title}
                  </Text>
                  
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Image source={{ uri: otherUser?.photo || 'https://via.placeholder.com/50' }} style={{ width: 16, height: 16, borderRadius: 8 }} />
                    <Text style={{ fontFamily: 'Lexend_400Regular', fontSize: 12, color: isDark ? '#94A3B8' : '#64748B' }}>
                      {otherUser?.name}
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                    <Text style={{ fontFamily: 'Lexend_700Bold', fontSize: 14, color: isDark ? '#FFFFFF' : '#0F172A' }}>
                      {latestOffer ? `${Number(latestOffer.amount).toLocaleString()} DH` : 'No offers'}
                    </Text>
                    <Text style={{ fontFamily: 'Lexend_600SemiBold', fontSize: 11, color: getStatusColor(neg.status) }}>
                      {neg.status}
                    </Text>
                  </View>
                </View>
                
                <ChevronRight color={isDark ? '#3F3F46' : '#CBD5E1'} size={20} style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
