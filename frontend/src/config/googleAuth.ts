import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { firebaseConfig } from "../constant/firebaseConfig";

export const configureGoogle = () => {
  GoogleSignin.configure({
    webClientId: firebaseConfig.idWebClient,
    offlineAccess: true,
    forceCodeForRefreshToken: true,
  });
};
