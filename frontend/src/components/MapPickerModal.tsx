import React, { useRef } from 'react';
import { View, Modal, TouchableOpacity, Text, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { Map, Camera, LogManager } from '@maplibre/maplibre-react-native';
import { X, MapPin, Check, LocateFixed } from 'lucide-react-native';
import { useLocation } from '../hooks/useLocation';

LogManager.setLogLevel('error');
LogManager.onLog(() => true);

const API_KEY = process.env.EXPO_PUBLIC_MAPTILER_KEY ?? '';
const MAP_STYLE = `https://api.maptiler.com/maps/outdoor-v4/style.json?key=${API_KEY}`;

interface MapPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectLocation: (latitude: number, longitude: number) => void;
  initialLocation?: { latitude: number; longitude: number };
}

export default function MapPickerModal({
  visible,
  onClose,
  onSelectLocation,
  initialLocation,
}: MapPickerModalProps) {
  // Use a ref so updating the center doesn't cause a re-render
  // This prevents the Camera from snapping back to default zoom/center
  const centerRef = useRef<[number, number]>(
    initialLocation?.longitude && initialLocation?.latitude
      ? [initialLocation.longitude, initialLocation.latitude]
      : [-7.5898, 33.5731] // Default: Casablanca
  );
  const cameraRef = useRef<any>(null);
  const { getLocation, isLoading: isLocating, error: locationError } = useLocation();

  const handleRegionChange = (e: any) => {
    // Extract center from MapLibre region change event
    const coords = e?.nativeEvent?.center ?? e?.geometry?.coordinates;
    if (coords && Array.isArray(coords) && coords.length === 2) {
      centerRef.current = [coords[0], coords[1]]; // [longitude, latitude]
    }
  };

  const handleConfirm = () => {
    onSelectLocation(centerRef.current[1], centerRef.current[0]); // pass lat, lng
    onClose();
  };

  const handleLocateMe = async () => {
    const coords = await getLocation();
    if (coords) {
      centerRef.current = [coords.longitude, coords.latitude];
      cameraRef.current?.flyTo({
        center: [coords.longitude, coords.latitude],
        zoom: 14,
        duration: 1000,
      });
    } else if (locationError) {
      Alert.alert('Error', locationError);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#09090B' }}>
        {/* Header */}
        <View className="flex-row justify-between items-center px-4 py-3 border-b border-white/5">
          <TouchableOpacity onPress={onClose} className="p-2">
            <X size={24} color="#fff" />
          </TouchableOpacity>
          <Text className="text-white text-lg font-bold" style={{ fontFamily: 'Lexend_700Bold' }}>
            Pick Location on Map
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Map Container */}
        <View style={{ flex: 1 }}>
          <Map
            style={{ flex: 1 }}
            mapStyle={MAP_STYLE}
            onRegionDidChange={handleRegionChange}
            logoEnabled={false}
            attributionEnabled={false}
          >
            <Camera
              ref={cameraRef}
              initialViewState={{
                center: centerRef.current,
                zoom: 14,
              }}
            />
          </Map>

          {/* Absolute Center Pin */}
          <View
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              marginLeft: -20,
              marginTop: -40,
            }}
            pointerEvents="none"
          >
            <MapPin size={40} color="#3B82F6" fill="#1e3a8a" />
          </View>

          {/* Locate Me Button */}
          <TouchableOpacity
            style={{
              position: 'absolute',
              bottom: 24,
              right: 16,
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: '#18181B',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.1)',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 5,
            }}
            onPress={handleLocateMe}
            disabled={isLocating}
            activeOpacity={0.8}
          >
            {isLocating ? (
              <ActivityIndicator size="small" color="#3B82F6" />
            ) : (
              <LocateFixed size={24} color="#3B82F6" />
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="p-4 bg-[#09090B] border-t border-white/5 pb-8">
          <TouchableOpacity
            onPress={handleConfirm}
            className="bg-blue-500 rounded-2xl py-4 items-center justify-center flex-row gap-2"
          >
            <Check size={20} color="#fff" />
            <Text className="text-white text-[16px]" style={{ fontFamily: 'Lexend_600SemiBold' }}>
              Confirm Location
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
