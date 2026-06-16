import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native";
import { Camera, Image as ImageIcon, X } from "lucide-react-native";
import { useTranslation } from "react-i18next";

interface ImagePickerSheetProps {
  visible: boolean;
  onClose: () => void;
  onPickImage: () => void;
  onTakePhoto: () => void;
}

const { height } = Dimensions.get("window");

export default function ImagePickerSheet({
  visible,
  onClose,
  onPickImage,
  onTakePhoto,
}: ImagePickerSheetProps) {
  const { t } = useTranslation();
  const slideAnim = useRef(new Animated.Value(height)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleOption = (action: () => void) => {
    onClose();
    // small delay so sheet closes first
    setTimeout(action, 250);
  };

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={onClose}>
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.6)",
            opacity: backdropAnim,
          }}
        />
      </TouchableWithoutFeedback>

      {/* Sheet */}
      <Animated.View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          transform: [{ translateY: slideAnim }],
          backgroundColor: "#111827",
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          paddingBottom: 34,
          paddingTop: 12,
          borderTopWidth: 1,
          borderColor: "rgba(110,231,183,0.1)",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -8 },
          shadowOpacity: 0.5,
          shadowRadius: 24,
          elevation: 30,
        }}
      >
        {/* Handle */}
        <View
          style={{
            width: 40,
            height: 4,
            backgroundColor: "rgba(255,255,255,0.15)",
            borderRadius: 99,
            alignSelf: "center",
            marginBottom: 24,
          }}
        />

        {/* Title */}
        <Text
          style={{
            color: "#94A3B8",
            fontSize: 12,
            fontFamily: "Lexend_500Medium",
            textTransform: "uppercase",
            letterSpacing: 1.2,
            paddingHorizontal: 24,
            marginBottom: 14,
          }}
        >
          {t("verification.actions.selectOption")}
        </Text>

        {/* Option: Camera */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => handleOption(onTakePhoto)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 20,
            paddingVertical: 16,
            marginHorizontal: 12,
            borderRadius: 18,
            marginBottom: 8,
            backgroundColor: "rgba(110,231,183,0.05)",
            borderWidth: 1,
            borderColor: "rgba(110,231,183,0.1)",
          }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              backgroundColor: "rgba(110,231,183,0.12)",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 16,
            }}
          >
            <Camera size={22} color="#6EE7B7" />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: "#E2E8F0",
                fontSize: 15,
                fontFamily: "Lexend_600SemiBold",
                marginBottom: 2,
              }}
            >
              {t("verification.actions.takePhoto")}
            </Text>
            <Text
              style={{
                color: "#475569",
                fontSize: 12,
                fontFamily: "Lexend_400Regular",
              }}
            >
              Open camera to capture now
            </Text>
          </View>
        </TouchableOpacity>

        {/* Option: Gallery */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => handleOption(onPickImage)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 20,
            paddingVertical: 16,
            marginHorizontal: 12,
            borderRadius: 18,
            marginBottom: 20,
            backgroundColor: "rgba(110,231,183,0.05)",
            borderWidth: 1,
            borderColor: "rgba(110,231,183,0.1)",
          }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              backgroundColor: "rgba(110,231,183,0.12)",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 16,
            }}
          >
            <ImageIcon size={22} color="#6EE7B7" />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: "#E2E8F0",
                fontSize: 15,
                fontFamily: "Lexend_600SemiBold",
                marginBottom: 2,
              }}
            >
              {t("verification.actions.chooseGallery")}
            </Text>
            <Text
              style={{
                color: "#475569",
                fontSize: 12,
                fontFamily: "Lexend_400Regular",
              }}
            >
              Pick from your photo library
            </Text>
          </View>
        </TouchableOpacity>

        {/* Cancel */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onClose}
          style={{
            marginHorizontal: 12,
            paddingVertical: 15,
            borderRadius: 18,
            backgroundColor: "rgba(255,255,255,0.04)",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.08)",
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <X size={16} color="#64748B" />
          <Text
            style={{
              color: "#64748B",
              fontSize: 14,
              fontFamily: "Lexend_600SemiBold",
            }}
          >
            {t("verification.actions.cancel")}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}
