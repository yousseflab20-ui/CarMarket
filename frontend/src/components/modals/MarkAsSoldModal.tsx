import React from 'react';
import { Modal, View, Text, TouchableOpacity, ActivityIndicator, useColorScheme } from 'react-native';
import { ShoppingBag, CheckCircle2 } from 'lucide-react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { MarkAsSoldModalProps } from '../../types/components/modals';

export const MarkAsSoldModal: React.FC<MarkAsSoldModalProps> = ({
  visible,
  onClose,
  onConfirm,
  isPending,
}) => {
  const { isDark } = useAppTheme();

  const colors = {
    textMuted: isDark ? '#94A3B8' : '#64748B',
    textPrimary: isDark ? '#F8FAFC' : '#0F172A',
    border: isDark ? '#334155' : '#E2E8F0',
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <View style={{ 
          backgroundColor: isDark ? '#1E293B' : '#FFFFFF', 
          borderRadius: 24, 
          padding: 20, 
          width: '100%', 
          maxWidth: 400,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.1,
          shadowRadius: 20,
          elevation: 10
        }}>
          {/* Icon */}
          <View style={{ 
            width: 48, 
            height: 48, 
            borderRadius: 24, 
            backgroundColor: isDark ? 'rgba(16,185,129,0.1)' : '#ECFDF5', 
            justifyContent: 'center', 
            alignItems: 'center', 
            alignSelf: 'center',
            marginBottom: 12
          }}>
            <ShoppingBag size={24} color="#10B981" />
          </View>

          {/* Texts */}
          <Text style={{ 
            fontFamily: 'Lexend_700Bold', 
            fontSize: 18, 
            color: isDark ? '#F8FAFC' : '#0F172A', 
            textAlign: 'center', 
            marginBottom: 8 
          }}>
            Mark Car as Sold?
          </Text>
          <Text style={{ 
            fontFamily: 'Lexend_400Regular', 
            fontSize: 14, 
            color: colors.textMuted, 
            textAlign: 'center', 
            lineHeight: 20,
            marginBottom: 20 
          }}>
            This will close all open negotiations on this car and notify other buyers. Are you sure you want to proceed?
          </Text>

          {/* Buttons */}
          <View style={{ gap: 10 }}>
            <TouchableOpacity
              onPress={onConfirm}
              disabled={isPending}
              style={{
                backgroundColor: '#10B981',
                paddingVertical: 12,
                borderRadius: 12,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {isPending ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <CheckCircle2 size={18} color="#FFF" />
                  <Text style={{ fontFamily: 'Lexend_600SemiBold', fontSize: 15, color: '#FFF' }}>
                    Yes, Mark as Sold
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClose}
              disabled={isPending}
              style={{
                paddingVertical: 12,
                borderRadius: 12,
                alignItems: 'center',
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ fontFamily: 'Lexend_600SemiBold', fontSize: 15, color: colors.textPrimary }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
