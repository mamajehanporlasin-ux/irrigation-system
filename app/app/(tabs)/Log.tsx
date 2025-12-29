import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput
} from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, router, Redirect } from "expo-router";
import loadingOverlay from "../components/LoadingOverlay";
import axiosInstance from "@/axiosConfig";
import Toast from "react-native-toast-message";

const ProfileTab =()=>{
    const [isLoading, setIsLoading] = useState(false);
    

    useEffect(()=>{
        setIsLoading(true);
        const reloadData = async()=>{
           
        }
        
        reloadData();
        setIsLoading(false);
    }, []);

    

    return(
        <SafeAreaView className="flex-1 bg-gray-100">
            {isLoading && loadingOverlay()}
            <ScrollView
                      showsVerticalScrollIndicator={false}
                      className="w-full flex flex-col"
            >
                
                <View className="p-4 bg-white shadow-sm border-b border-gray-100 pt-10">
                    <Text className="text-3xl font-extrabold text-green-700">Logs</Text>
                    <Text className="text-base text-gray-500">view Sensor data Reading history of your Devices</Text>
                </View>

                <View className="px-7 py-10 mx-5 my-5 bg-white shadow-sm border-b border-gray-100 rounded-lg">
                    <View className="flex flex-row w-full h-auto gap-4 my-2">
                        <Text className="text-black font-bold text-xl">Device Sensor Reading Cards in here</Text>
                    </View>
                    
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

export default ProfileTab;
