import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  Image
} from "react-native";
import logo from "../../assets/images/logo.png";

const HeaderComponent =()=>{
    return(
        <View className="flex flex-row h-fit items-start bg-teal-800 shadow-sm border-b border-gray-100 pt-3">
                <View className="flex bg-white rounded-full border-2 border-teal-800 p-5 ml-5 mb-[-15]">
                    <Image source={logo} style={{ width: 50, height: 50 }} />
                </View>
                <View className="flex-1 mx-5">
                    <Text className="mt-4 text-white font-bold text-2xl">
                        Smart Rice Paddies
                    </Text>
                </View>
        </View>
    );
}

export default HeaderComponent;