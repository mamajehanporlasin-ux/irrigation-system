import React, {useState} from "react";
import {
  View
} from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from "react-native-safe-area-context";
import loadingOverlay from "./components/LoadingOverlay";
import Toast from "react-native-toast-message";
import HeaderComponent from "./components/Header";
import {WebView} from "react-native-webview";

const CameraView = () => {
const [isLoading, setIsLoading] = useState(false);

const cameraHTML = `
    <html>
      <body style="margin:0; padding:0; background-color:black; display:flex; justify-content:center; align-items:center;">
        <img src="${process.env.EXPO_PUBLIC_CAM_URL}" style="width:100%; height:auto;" />
      </body>
    </html>
  `;

console.log("cam: "+process.env.EXPO_PUBLIC_CAM_URL);

return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {isLoading && loadingOverlay()}
      
      <HeaderComponent />
      <View className="flex-1 mx-5 my-10 px-3 py-10 overflow-hidden rounded-xl border border-gray-800">
        <WebView
            source={{ html: cameraHTML }}
            className="flex w-full h-fit my-10"
            scrollEnabled={false}
            scalesPageToFit={true}
        />
      </View>
    </SafeAreaView>
  );
}

export default CameraView;