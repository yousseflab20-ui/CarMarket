import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Animated, Easing } from "react-native";
import {
  ArrowLeft,
  Car,
  Settings2,
  DollarSign,
  FileText,
  ShieldCheck,
  Plus,
  MapPin,
  Check,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Controller } from "react-hook-form";
import { useRef, useState } from "react";

import { useCarForm } from "../../hooks/useCarForm";
import {
  FEATURES,
  TRANSMISSIONS,
  FUEL_TYPES,
  MOROCCAN_CITIES,
  AnimatedAddButtonProps,
  SectionHeaderProps,
} from "../../types/screens/carForm";

import { FormInput } from "../../components/forms/FormInput";
import { ImageUploader } from "../../components/forms/ImageUploader";
import { FeatureSelector } from "../../components/forms/FeatureSelector";
import { OptionSwitch } from "../../components/forms/OptionSwitch";
import { SelectField } from "../../components/forms/SelectField";
import { router } from "expo-router";
import { useLocation } from "../../hooks/useLocation";
import { Map, Camera, Marker } from "@maplibre/maplibre-react-native";
import MapPickerModal from "../../components/MapPickerModal";
import { useStackedToastStore } from "@/src/store/stackedToastStore";

function AnimatedAddButton({ onPress, isLoading }: AnimatedAddButtonProps) {
  const { t } = useTranslation();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const rippleOpacity = useRef(new Animated.Value(0)).current;
  const textSlide = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(-1)).current;
  const bgColorAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  
  const triggerAnimation = () => {
    if (isLoading) return;

    bgColorAnim.setValue(0);
    Animated.sequence([
      Animated.timing(bgColorAnim, {
        toValue: 1,
        duration: 80,
        useNativeDriver: false,
      }),
      Animated.timing(bgColorAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: false,
      }),
    ]).start();

    glowAnim.setValue(0);
    Animated.sequence([
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: false,
      }),
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: false,
      }),
    ]).start();

    shimmerAnim.setValue(-1);
    Animated.timing(shimmerAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 0.93,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1.05,
        tension: 180,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 200,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.sequence([
      Animated.timing(textSlide, {
        toValue: -5,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(textSlide, {
        toValue: 0,
        tension: 200,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    rippleAnim.setValue(0);
    rippleOpacity.setValue(0.7);
    Animated.parallel([
      Animated.timing(rippleAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(rippleOpacity, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    onPress();
  };

  const rippleScale = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1.15],
  });
  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-200, 300],
  });
  const animatedBg = bgColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#18181B", "#3B82F6"],
  });
  const borderColor = bgColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(59,130,246,0.25)", "rgba(59,130,246,0.8)"],
  });

  return (
    <Animated.View
      className="flex-1 h-[52px] rounded-2xl overflow-hidden items-center justify-center"
      style={{ transform: [{ scale: scaleAnim }] }}
    >
      <Animated.View
        className="absolute w-full h-full rounded-2xl border-2 border-blue-500"
        style={{ opacity: rippleOpacity, transform: [{ scale: rippleScale }] }}
      />

      <TouchableOpacity
        onPress={triggerAnimation}
        disabled={isLoading}
        activeOpacity={1}
        className="flex-1 w-full"
      >
        <Animated.View
          className="flex-1 w-full items-center justify-center rounded-2xl overflow-hidden border"
          style={{ backgroundColor: animatedBg, borderColor }}
        >
          <Animated.View
            className="absolute top-0 left-0 w-[80px] h-full bg-white/20"
            style={{
              transform: [
                { translateX: shimmerTranslate },
                { skewX: "-20deg" },
              ],
            }}
          />

          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Animated.View
              className="flex-row items-center gap-2"
              style={{ transform: [{ translateY: textSlide }] }}
            >
              <Plus size={18} color="#fff" strokeWidth={2.5} />
              <Text
                className="text-white text-[15px]"
                style={{ fontFamily: "Lexend_700Bold" }}
              >
                {t("addCar.addCar")}
              </Text>
            </Animated.View>
          )}
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function SectionHeader({ icon, title }: SectionHeaderProps) {
  return (
    <View className="flex-row items-center gap-2.5 mt-6 mb-3">
      <View className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 items-center justify-center">
        {icon}
      </View>
      <Text
        className="text-[13px] text-slate-400 tracking-[1px] uppercase"
        style={{ fontFamily: "Lexend_700Bold" }}
      >
        {title}
      </Text>
      <View className="flex-1 h-px bg-white/5" />
    </View>
  );
}

export default function AddCarScreen() {
  const { t } = useTranslation();
  const { form, images, setImages, handleSubmit, isLoading } = useCarForm({
    onSuccess: () => router.back(),
  });
  const [isMapPickerVisible, setIsMapPickerVisible] = useState(false);
  const [locationSource, setLocationSource] = useState<'gps' | 'map' | null>(null);

  const { control, setValue, watch } = form;
  const location: any = {
    coords: { latitude: watch("latitude"), longitude: watch("longitude") },
  };

  const addToast = useStackedToastStore((state) => state.addToast);

  const {
    getLocation,
    isLoading: isLocationLoading,
    error: locationError,
  } = useLocation();

  const handlePress = async () => {
    const coords = await getLocation();
    if (coords) {
      console.log("GPS jabou mzian!", coords);
      setValue("latitude", coords.latitude);
      setValue("longitude", coords.longitude);
      setLocationSource('gps');
       addToast({
        title: "Success",
        description: "Location fetched successfully",
        type: "success",
      });
    } else if (locationError) {
      addToast({
        title: "Error",
        description: locationError,
        type: "error",
      });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#09090B" }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-row justify-between items-center px-5 py-3.5 mb-1">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-[42px] h-[42px] rounded-[14px] bg-white/5 border border-white/8 items-center justify-center"
          >
            <ArrowLeft size={20} color="#fff" />
          </TouchableOpacity>
          <Text
            className="text-xl text-white tracking-[0.3px]"
            style={{ fontFamily: "Lexend_700Bold" }}
          >
            {t("addCar.title")}
          </Text>
          <View className="w-[42px]" />
        </View>

        <View className="px-4 pb-5">
          <ImageUploader images={images} onImagesChange={setImages} />

          <SectionHeader
            icon={<Car size={14} color="#3B82F6" />}
            title={t("addCar.basicInfo")}
          />

          <View className="bg-[#18181B] rounded-[20px] p-4 border border-white/5">
            <FormInput
              control={control}
              name="title"
              label={t("addCar.carTitle")}
              required
              placeholder={t("addCar.titlePlaceholder")}
            />

            <View className="flex-row mt-0">
              <FormInput
                control={control}
                name="brand"
                label={t("addCar.brand")}
                required
                placeholder={t("addCar.brandPlaceholder")}
                containerStyle={{ flex: 1 }}
              />
              <View className="w-3" />
              <FormInput
                control={control}
                name="model"
                label={t("addCar.model")}
                required
                placeholder={t("addCar.modelPlaceholder")}
                containerStyle={{ flex: 1 }}
              />
            </View>

            <View className="flex-row mt-0">
              <FormInput
                control={control}
                name="year"
                label={t("addCar.year")}
                required
                placeholder={t("addCar.yearPlaceholder")}
                keyboardType="number-pad"
                containerStyle={{ flex: 1 }}
              />
              <View className="w-3" />
              <FormInput
                control={control}
                name="mileage"
                label={t("addCar.mileage")}
                placeholder={t("addCar.mileagePlaceholder")}
                keyboardType="number-pad"
                containerStyle={{ flex: 1 }}
              />
            </View>

            <Controller
              control={control}
              name="city"
              render={({ field: { value, onChange } }) => (
                <SelectField
                  label={t("filter.city")}
                  options={[...MOROCCAN_CITIES]}
                  value={value}
                  onValueChange={onChange}
                  containerStyle={{ marginTop: 12 }}
                />
              )}
            />
          </View>

          <SectionHeader
            icon={<MapPin size={14} color="#3B82F6" />}
            title={t("addCar.locationSection")}
          />

          <View className="bg-[#18181B] rounded-[20px] border border-white/5 overflow-hidden mb-6">
            {/* Two Action Buttons */}
            <View className="flex-row p-3 gap-3">
              {/* Use Current Location */}
              <TouchableOpacity
                activeOpacity={0.75}
                className={`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-[12px] border ${
                  locationSource === 'gps'
                    ? 'bg-blue-500/15 border-blue-500/30'
                    : 'bg-white/5 border-white/5'
                }`}
                onPress={handlePress}
                disabled={isLocationLoading}
              >
                {isLocationLoading ? (
                  <ActivityIndicator size="small" color="#3B82F6" />
                ) : (
                  <>
                    <MapPin size={14} color={locationSource === 'gps' ? "#60A5FA" : "#94A3B8"} />
                    <Text
                      className={`text-[12px] ${
                        locationSource === 'gps' ? 'text-blue-400' : 'text-slate-400'
                      }`}
                      style={{ fontFamily: "Lexend_500Medium" }}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                    >
                      {t("addCar.useMyLocation")}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Pick on Map */}
              <TouchableOpacity
                onPress={() => setIsMapPickerVisible(true)}
                activeOpacity={0.75}
                className={`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-[12px] border ${
                  locationSource === 'map'
                    ? 'bg-blue-500/15 border-blue-500/30'
                    : 'bg-white/5 border-white/5'
                }`}
              >
                <MapPin size={14} color={locationSource === 'map' ? "#60A5FA" : "#94A3B8"} />
                <Text
                  className={`text-[12px] ${
                    locationSource === 'map' ? 'text-blue-400' : 'text-slate-400'
                  }`}
                  style={{ fontFamily: "Lexend_500Medium" }}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {t("addCar.pickOnMap")}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View className="h-px bg-white/5 mx-4" />

            {/* Location Map Preview */}
            <View
              style={{
                margin: 12,
                height: 160,
                borderRadius: 16,
                overflow: "hidden",
                borderWidth: 1,
                borderColor: location.coords.latitude
                  ? "rgba(34,197,94,0.4)"
                  : "rgba(255,255,255,0.08)",
              }}
            >
              <Map
                style={{ flex: 1 }}
                androidView="texture"
                mapStyle={`https://api.maptiler.com/maps/outdoor-v4/style.json?key=${process.env.EXPO_PUBLIC_MAPTILER_KEY}`}
              >
                <Camera
                  center={[
                    location.coords.longitude ?? -7.5898,
                    location.coords.latitude ?? 33.5731,
                  ]}
                  zoom={location.coords.latitude ? 14 : 4}
                />

                {!!location.coords.longitude && !!location.coords.latitude && (
                  <Marker
                    id="user-location"
                    lngLat={[
                      location.coords.longitude,
                      location.coords.latitude,
                    ]}
                  >
                    <View
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: 7,
                        backgroundColor: "#3B82F6",
                        borderWidth: 2,
                        borderColor: "#FFF",
                      }}
                    />
                  </Marker>
                )}
              </Map>

              {/* Overlay when no location yet */}
              {/* {!location.coords.latitude && (
                <View
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(9,9,11,0.6)",
                  }}
                  pointerEvents="none"
                >
                  <MapPin size={22} color="#475569" />
                  <Text
                    style={{
                      color: "#64748b",
                      fontSize: 12,
                      marginTop: 8,
                      fontFamily: "Lexend_400Regular",
                    }}
                  >
                    {t("addCar.noLocationYet")}
                  </Text>
                </View>
              )} */}

              {/* Zone Set badge */}
              {location.coords.latitude && (
                <View
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    backgroundColor: "#22c55e",
                    borderRadius: 20,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Check size={10} color="#fff" />
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 10,
                      fontFamily: "Lexend_600SemiBold",
                    }}
                  >
                    Zone Set
                  </Text>
                </View>
              )}
            </View>
          </View>

          <SectionHeader
            icon={<Settings2 size={14} color="#3B82F6" />}
            title={t("addCar.specs")}
          />

          <View className="bg-[#18181B] rounded-[20px] p-4 border border-white/5">
            <View className="flex-row mt-0">
              <FormInput
                control={control}
                name="speed"
                label={t("addCar.speed")}
                placeholder={t("addCar.speedPlaceholder")}
                keyboardType="number-pad"
                containerStyle={{ flex: 1 }}
              />
              <View className="w-3" />
              <FormInput
                control={control}
                name="seats"
                label={t("addCar.seats")}
                placeholder={t("addCar.seatsPlaceholder")}
                keyboardType="number-pad"
                containerStyle={{ flex: 1 }}
              />
            </View>

            <View className="flex-row mt-0">
              <Controller
                control={control}
                name="transmission"
                render={({ field: { value, onChange } }) => (
                  <SelectField
                    label={t("addCar.transmission")}
                    options={TRANSMISSIONS}
                    value={value}
                    onValueChange={onChange}
                    containerStyle={{ flex: 1 }}
                    translationKey="form.transmissions"
                  />
                )}
              />
              <View className="w-3" />
              <Controller
                control={control}
                name="fuelType"
                render={({ field: { value, onChange } }) => (
                  <SelectField
                    label={t("addCar.fuelType")}
                    options={FUEL_TYPES}
                    value={value}
                    onValueChange={onChange}
                    containerStyle={{ flex: 1 }}
                    translationKey="form.fuelTypes"
                  />
                )}
              />
            </View>
          </View>

          <SectionHeader
            icon={<DollarSign size={14} color="#3B82F6" />}
            title={t("addCar.pricing")}
          />

          <View className="bg-[#18181B] rounded-[20px] p-4 border border-white/5">
            <View className="flex-row mt-0">
              <FormInput
                control={control}
                name="price"
                label={t("addCar.totalPrice")}
                required
                placeholder={t("addCar.pricePlaceholder")}
                keyboardType="number-pad"
                containerStyle={{ flex: 1 }}
              />
              <View className="w-3" />
              <FormInput
                control={control}
                name="pricePerDay"
                label={t("addCar.priceDay")}
                required
                placeholder={t("addCar.priceDayPlaceholder")}
                keyboardType="number-pad"
                containerStyle={{ flex: 1 }}
              />
            </View>
          </View>

          <Controller
            control={control}
            name="features"
            render={({ field: { value, onChange } }) => (
              <FeatureSelector
                features={FEATURES}
                selectedFeatures={value}
                onFeaturesChange={onChange}
                translationKey="form.features"
              />
            )}
          />

          <SectionHeader
            icon={<FileText size={14} color="#3B82F6" />}
            title={t("addCar.description")}
          />

          <View className="bg-[#18181B] rounded-[20px] p-4 border border-white/5">
            <FormInput
              control={control}
              name="description"
              label=""
              placeholder={t("addCar.descPlaceholder")}
              multiline
              numberOfLines={4}
              style={{
                minHeight: 100,
                textAlignVertical: "top",
                color: "#fff",
                fontFamily: "Lexend_400Regular",
                paddingTop: 4,
              }}
            />
          </View>

          <SectionHeader
            icon={<ShieldCheck size={14} color="#3B82F6" />}
            title={t("addCar.options")}
          />

          <View className="bg-[#18181B] rounded-[20px] p-4 border border-white/5">
            <Controller
              control={control}
              name="insuranceIncluded"
              render={({ field: { value, onChange } }) => (
                <OptionSwitch
                  label={t("addCar.insurance")}
                  subtitle={t("addCar.insuranceSub")}
                  value={value}
                  onValueChange={onChange}
                />
              )}
            />
            <View className="h-px bg-white/5 my-1" />
            <Controller
              control={control}
              name="deliveryAvailable"
              render={({ field: { value, onChange } }) => (
                <OptionSwitch
                  label={t("addCar.delivery")}
                  subtitle={t("addCar.deliverySub")}
                  value={value}
                  onValueChange={onChange}
                />
              )}
            />
          </View>

          <View className="flex-row gap-3 mt-[50px] mb-5">
            <TouchableOpacity
              className="flex-1 border-[1.5px] border-blue-500 py-[15px] rounded-2xl items-center bg-blue-500/6"
              onPress={() => router.back()}
              disabled={isLoading}
              activeOpacity={0.75}
            >
              <Text
                className="text-blue-500 text-[15px]"
                style={{ fontFamily: "Lexend_700Bold" }}
              >
                {t("addCar.cancel")}
              </Text>
            </TouchableOpacity>

            <AnimatedAddButton onPress={handleSubmit} isLoading={isLoading} />
          </View>


          <View style={{ height: 40 }} />
        </View>
      </ScrollView>

      <MapPickerModal
        visible={isMapPickerVisible}
        onClose={() => setIsMapPickerVisible(false)}
        onSelectLocation={(lat, lng) => {
          setValue('latitude', lat);
          setValue('longitude', lng);
          setLocationSource('map');
        }}
        initialLocation={
          location.coords.latitude && location.coords.longitude
            ? { latitude: location.coords.latitude, longitude: location.coords.longitude }
            : undefined
        }
      />
    </SafeAreaView>
  );
}
