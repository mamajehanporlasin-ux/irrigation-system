import React, { useState, useEffect, useCallback } from "react";
import { useIsFocused } from '@react-navigation/native';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  BackHandler,
} from "react-native";

import { MaterialIcons, AntDesign } from '@expo/vector-icons';
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import loadingOverlay from "../components/LoadingOverlay";
import axiosInstance from "@/axiosConfig";
import Toast from "react-native-toast-message";
import DeviceCard from "../components/DeviceCard";
import HeaderComponent from "../components/Header";
import { useNotification } from "@/context/NotificationContext";

const DevicesTab = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [devices, setDevices] = useState([]);
  const [showNewDeviceModal, setShowNewDeviceModal] = useState(false);
  const [newDeviceID, setNewDeviceID] = useState("");
  const isFocused = useIsFocused();
  const { expoPushToken, error } = useNotification();

  // 1. Automatic Refresh Logic (1 Second)
  useEffect(() => {
    let interval;
    if (isFocused) {
      interval = setInterval(() => {
        // We call reloadData without setting setIsLoading(true) 
        // to prevent the screen from flickering every second.
        reloadData(false); 
      }, 1500);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isFocused]);

  useEffect(() => {
    const checkNotificationToken = async () => {
      if (expoPushToken) {
        try {
          const data = { expoPushNotificationToken: expoPushToken };
          await axiosInstance.put("/user/set-notification-token", data, { withCredentials: true });
        } catch (e) {
          console.log("Notification token update failed", e);
        }
      }
    };
    checkNotificationToken();
  }, [expoPushToken]);

  // Initial load when screen is focused
  useEffect(() => {
    if (isFocused) {
      setIsLoading(true);
      reloadData().finally(() => setIsLoading(false));
    }
  }, [isFocused]);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => true
      );
      return () => subscription.remove();
    }, [])
  );

  const pressEventHandler = async (device) => {
    router.push({
      pathname: "/device/[deviceID]",
      params: { deviceID: device.deviceID },
    });
    // Removed setDevices([]) here to keep the list ready for when user comes back
  };

  const reloadData = async (isSilent = false) => {
    try {
      const response = await axiosInstance.get("/device/get-my-devices", { withCredentials: true });
      if (response.data.success) {
        setDevices(response.data.data);
      } else if (!isSilent) {
        // Only show toast errors if it's not a background "silent" refresh
        Toast.show({
          type: 'error',
          text1: '❌ Error retrieving Devices',
          text2: response.data.message
        });
      }
    } catch (error) {
      if (!isSilent) {
        console.log("Error retrieving Devices: " + error.message);
        Toast.show({
          type: 'error',
          text1: '❌ Connection Error',
          text2: error.message
        });
      }
    }
  };

  const handleAddDeviceEvent = () => setShowNewDeviceModal(true);

  const confirmAddNewDevice = async () => {
    setShowNewDeviceModal(false);
    setIsLoading(true);
    try {
      const data = { "deviceID": newDeviceID };
      const response = await axiosInstance.post("/device/register", data, { withCredentials: true });
      if (!response.data.success) {
        Toast.show({
          type: 'error',
          text1: '❌ Registration Failed',
          text2: response.data.message
        });
        setShowNewDeviceModal(true);
      } else {
        setNewDeviceID("");
        await reloadData();
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: '❌ Error',
        text2: error.message
      });
      setNewDeviceID("");
    }
    setIsLoading(false);
  };

  const cancelAddNewDevice = () => {
    setNewDeviceID("");
    setShowNewDeviceModal(false);
  };

  if (error) {
    return <View className="flex-1 justify-center items-center"><Text>Error: {error.message}</Text></View>;
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {isLoading && loadingOverlay()}
      <HeaderComponent />
      
      <View className="flex w-fit self-end my-3">
        <TouchableOpacity
          onPress={handleAddDeviceEvent}
          className="flex flex-row gap-2 bg-blue-600 py-3 px-4 rounded-lg mx-6"
        >
          <MaterialIcons name={"add-circle"} size={15} color="white" />
          <Text className="text-white text-center font-semibold text-sm">Device</Text>
        </TouchableOpacity>
      </View>

      {devices.length > 0 && (
        <FlatList
          className="mb-20"
          data={devices}
          keyExtractor={(item) => item.deviceID}
          renderItem={({ item }) => (
            <DeviceCard device={item} pressEventHandler={pressEventHandler} />
          )}
          contentContainerStyle={{ paddingBottom: 16 }}
        />
      )}

      {/* Modal remains the same */}
      <Modal visible={showNewDeviceModal} transparent animationType="fade" onRequestClose={cancelAddNewDevice}>
        <View className="flex-1 justify-center items-center bg-black/40">
          <View className="bg-white rounded-lg p-6 w-80">
            <Text className="text-lg font-bold text-center mb-4">Add New Device</Text>
            <View className="flex-row mb-10">
              <View className="border border-gray-300 rounded-tl-lg rounded-bl-lg justify-center items-center px-2">
                <AntDesign name={"barcode"} size={28} color="green" />
              </View>
              <View className="flex-1 border border-gray-300 border-l-0 rounded-lg px-4 py-1">
                <TextInput
                  value={newDeviceID}
                  onChangeText={setNewDeviceID}
                  placeholder="Device ID"
                  autoCapitalize="none"
                />
              </View>
            </View>
            <View className="flex-row justify-between">
              <TouchableOpacity onPress={cancelAddNewDevice} className="bg-gray-300 py-2 px-4 rounded-lg">
                <Text className="font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmAddNewDevice} className="bg-blue-600 py-2 px-4 rounded-lg">
                <Text className="text-white font-semibold">Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default DevicesTab;