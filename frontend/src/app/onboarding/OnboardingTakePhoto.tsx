import { View ,Text,StyleSheet, ImageBackground} from "react-native";

export default function OnboardingTakePhoto(){
    return (
     <View style={{ flex: 1 }}>
      <ImageBackground
        source={require("../../assets/image/03_Onboarding_Take_Photos.png")}
        style={styles.background}
        resizeMode="cover"
      >
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
})