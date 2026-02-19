import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  ScrollView
} from "react-native";
import { MaterialCommunityIcons, MaterialIcons, AntDesign, Octicons, Foundation } from '@expo/vector-icons'; 
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { convertDateToJsonString, convertDateToDisplayString } from "../../functions";
import loadingOverlay from "../components/LoadingOverlay";
import axiosInstance from "@/axiosConfig";
import Toast from "react-native-toast-message";
import DateTimePicker from '@react-native-community/datetimepicker';

const levelStyles = {
  OK: { label: 'OK', bg: 'bg-green-50', iconColor: '#16a34a' },
  LOW: { label: 'LOW', bg: 'bg-red-50', iconColor: '#dc2626' },
  FULL: { label: 'FULL', bg: 'bg-blue-50', iconColor: '#2563eb' },
};

const MetricCard = ({ title, value, iconName, bgColor, iconColor }) => (
  <View className="w-1/2 p-2">
    <View className={`flex-row items-center p-3 rounded-xl border border-gray-100 ${bgColor}`}>
      <MaterialCommunityIcons name={iconName} size={24} color={iconColor} />
      <View className="ml-3">
        <Text className="text-lg font-bold text-gray-800">{value}</Text>
        <Text className="text-xs text-gray-500">{title}</Text>
      </View>
    </View>
  </View>
);

const DeviceDetails = () => {
  const { deviceID } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [device, setDevice] = useState({});
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [newDeviceID, setNewDeviceID] = useState("");
  const [showDateSelection1, setShowDateSelection1] = useState(false);
  const [showDateSelection2, setShowDateSelection2] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsLoading(true);
      reloadData();
      setIsLoading(false);
    }, 20000);

    reloadData(); // Initial load
    return () => clearInterval(interval);
  }, []);

  const reloadData = async () => {
    try {
      const response = await axiosInstance.get(`/device/get-a-device/${deviceID}`, { withCredentials: true });
      if (!response.data.success) {
        Toast.show({ type: "error", text1: "❌ Failed to load device", text2: response.data.message });
        setDevice({});
      } else {
        setDevice(response.data.data[0]);
      }
    } catch (error) {
      Toast.show({ type: "error", text1: "❌ Error loading device", text2: error.message });
      setDevice({});
    }
  };

  const handleRenamePress = () => setShowRenameModal(true);
  const cancelRenamePress = () => setShowRenameModal(false);

  const confirmRenamePress = async () => {
    setShowRenameModal(false);
    setIsLoading(true);
    try {
      const data = { deviceID: newDeviceID };
      const response = await axiosInstance.put(`/device/update/${device._id}`, data, { withCredentials: true });
      if (!response.data.success) {
        Toast.show({ type: 'error', text1: '❌ Device ID update failed!', text2: response.data.message });
        setShowRenameModal(true);
      } else {
        Toast.show({ type: 'success', text1: '✅ Device ID updated successfully!', text2: response.data.message });
        setNewDeviceID("");
        setDevice(response.data.data[0]);
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: '❌ Error while updating the Device ID!', text2: error.message });
    }
    setIsLoading(false);
  };

  const add21DaysToAlert1 = async()=>{
    setIsLoading(true);
    try{
      const addDays = new Date(Date.now()+(1000*60*60*24*21));
      const jsonDate = convertDateToJsonString(addDays);
      const data = { deviceDBID: device._id, inputDate: jsonDate, fieldNumber: 1 };
      const response = await axiosInstance.put(`/device/set-alert-date`, data, { withCredentials: true });
      if (!response.data.success) {
        Toast.show({ type: 'error', text1: '❌ Alert Date setup failed!', text2: response.data.message });
      } else {
        Toast.show({ type: 'success', text1: '✅ Alert Date updated successfully!', text2: response.data.message });
        setDevice(response.data.data[0]);
      }
    }catch(error){
      Toast.show({ type: 'error', text1: '❌ Error while setting-up Alert Date!', text2: error.message });
    }
    setIsLoading(false);
  }

  const add90DaysToAlert1 = async()=>{
    setIsLoading(true);
    try{
      const addDays = new Date(Date.now()+(1000*60*60*24*90));
      const jsonDate = convertDateToJsonString(addDays);
      const data = { deviceDBID: device._id, inputDate: jsonDate, fieldNumber: 1 };
      const response = await axiosInstance.put(`/device/set-alert-date`, data, { withCredentials: true });
      if (!response.data.success) {
        Toast.show({ type: 'error', text1: '❌ Alert Date setup failed!', text2: response.data.message });
      } else {
        Toast.show({ type: 'success', text1: '✅ Alert Date updated successfully!', text2: response.data.message });
        setDevice(response.data.data[0]);
      }
    }catch(error){
      Toast.show({ type: 'error', text1: '❌ Error while setting-up Alert Date!', text2: error.message });
    }
    setIsLoading(false);
  }

  const changeField1AlertDate = async (event)=>{
    if (event.type === "dismissed") {
      setShowDateSelection1(false);
      return;
    }

    setIsLoading(true);
    setShowDateSelection1(false);
    try{
      const jsonDate = convertDateToJsonString(new Date(event.nativeEvent.timestamp));
      const data = { deviceDBID: device._id, inputDate: jsonDate, fieldNumber: 1 };
      const response = await axiosInstance.put(`/device/set-alert-date`, data, { withCredentials: true });
      if (!response.data.success) {
        Toast.show({ type: 'error', text1: '❌ Alert Date setup failed!', text2: response.data.message });
      } else {
        Toast.show({ type: 'success', text1: '✅ Alert Date updated successfully!', text2: response.data.message });
        setDevice(response.data.data[0]);
      }
    }catch(error){
      Toast.show({ type: 'error', text1: '❌ Error while setting-up Alert Date!', text2: error.message });
    }
    setIsLoading(false);
  }

  const add21DaysToAlert2 = async()=>{
    setIsLoading(true);
    try{
      const addDays = new Date(Date.now()+(1000*60*60*24*21));
      const jsonDate = convertDateToJsonString(addDays);
      const data = { deviceDBID: device._id, inputDate: jsonDate, fieldNumber: 2 };
      const response = await axiosInstance.put(`/device/set-alert-date`, data, { withCredentials: true });
      if (!response.data.success) {
        Toast.show({ type: 'error', text1: '❌ Alert Date setup failed!', text2: response.data.message });
      } else {
        Toast.show({ type: 'success', text1: '✅ Alert Date updated successfully!', text2: response.data.message });
        setDevice(response.data.data[0]);
      }
    }catch(error){
      Toast.show({ type: 'error', text1: '❌ Error while setting-up Alert Date!', text2: error.message });
    }
    setIsLoading(false);
  }

  const add90DaysToAlert2 = async()=>{
    setIsLoading(true);
    try{
      const addDays = new Date(Date.now()+(1000*60*60*24*90));
      const jsonDate = convertDateToJsonString(addDays);
      const data = { deviceDBID: device._id, inputDate: jsonDate, fieldNumber: 2 };
      const response = await axiosInstance.put(`/device/set-alert-date`, data, { withCredentials: true });
      if (!response.data.success) {
        Toast.show({ type: 'error', text1: '❌ Alert Date setup failed!', text2: response.data.message });
      } else {
        Toast.show({ type: 'success', text1: '✅ Alert Date updated successfully!', text2: response.data.message });
        setDevice(response.data.data[0]);
      }
    }catch(error){
      Toast.show({ type: 'error', text1: '❌ Error while setting-up Alert Date!', text2: error.message });
    }
    setIsLoading(false);
  }

  const changeField2AlertDate = async (event)=>{
    if (event.type === "dismissed") {
      setShowDateSelection2(false);
      return;
    }

    setIsLoading(true);
    setShowDateSelection2(false);
    try{
      const jsonDate = convertDateToJsonString(new Date(event.nativeEvent.timestamp));
      const data = { deviceDBID: device._id, inputDate: jsonDate, fieldNumber: 2 };
      const response = await axiosInstance.put(`/device/set-alert-date`, data, { withCredentials: true });
      if (!response.data.success) {
        Toast.show({ type: 'error', text1: '❌ Alert Date setup failed!', text2: response.data.message });
      } else {
        Toast.show({ type: 'success', text1: '✅ Alert Date updated successfully!', text2: response.data.message });
        setDevice(response.data.data[0]);
      }
    }catch(error){
      Toast.show({ type: 'error', text1: '❌ Error while setting-up Alert Date!', text2: error.message });
    }
    setIsLoading(false);
  }

  if (!device || Object.keys(device).length === 0) return <SafeAreaView className="flex-1 bg-gray-100">{isLoading && loadingOverlay()}</SafeAreaView>;

  
  return (
    <SafeAreaView className="flex-1 bg-gray-100 mb-10">
      {isLoading && loadingOverlay()}
      <ScrollView className="flex-1">
      <View className="flex flex-col p-4 bg-white shadow-sm border-b border-gray-100 pt-10">
        <View className="w-full flex flex-row items-center">
          <Text className="flex-1 text-3xl font-extrabold text-green-700">{device.deviceID}</Text>
          <TouchableOpacity onPress={handleRenamePress} className="flex flex-row gap-2 bg-blue-600 py-3 px-4 rounded-lg mx-6">
            <MaterialIcons name={"edit-square"} size={15} color="white" />
            <Text className="text-white text-center font-semibold text-sm">edit</Text>
          </TouchableOpacity>
        </View>
        <View className="w-full flex flex-row items-center mt-2">
          <Text className="text-base text-gray-500">Current status: </Text>
          <Octicons name="dot-fill" size={30} color={device.isOnline ? "green" : "red"} />
        </View>
      </View>

      <View className="bg-white mx-4 mt-4 p-4 rounded-xl shadow-md border border-gray-100 active:bg-gray-50">
        <View className="flex-row flex-wrap -m-2">
          <MetricCard title="Humidity" value={`${device.humidity}%`} iconName="water-percent" bgColor="bg-blue-50" iconColor="#2563eb" />
          <MetricCard title="Temperature" value={`${device.temperature}°C`} iconName="temperature-celsius" bgColor="bg-red-50" iconColor="#dc2626" />
        </View>
        {/*
        <View className="mx-3 mt-3">
          <Text className="text-lg font-extrabold text-gray-900 mb-2">Reservoir</Text>
          <View className={`p-3 rounded-xl ${reservoir.bg}`}>
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="water" size={22} color={reservoir.iconColor} />
              <Text className="ml-2 text-base font-bold text-gray-800">{reservoir.label}</Text>
            </View>
          </View>
        </View>
        */}
        <View className="flex flex-col mx-3 mt-3 border border-gray-200 rounded-xl py-2">
          <Text className="text-lg font-extrabold text-gray-900 mx-3 my-2">Field 1</Text>
          <View className="flex-row">
            <MetricCard title="Water Level" value={levelStyles[device.waterLevel1].label} iconName="water" bgColor={levelStyles[device.waterLevel1].bg} iconColor={levelStyles[device.waterLevel1].iconColor} />
            <View className="flex-1 h-auto mx-2 my-3 px-3 justify-center border border-gray-300 rounded-xl">
              <Text className="text-sm text-gray-900">Alert Date:</Text>
              <Text className="text-sm text-gray-900">{(device.field1CropAlertDate>0) ? (convertDateToDisplayString(device.field1CropAlertDate)):("N/A")}</Text>
            </View>
          </View>
          <View>
          <View className="flex-col w-max h-auto mt-5 mx-2 px-5 py-3 gap-5 border border-gray-300 rounded-xl">
              <Text className="text-sm justify-normal">Set the field's alert date for automatic notification of your crops grown for maturity</Text>
              <View className="flex-row w-full gap-5 justify-center">
                <TouchableOpacity onPress={add21DaysToAlert1} className="flex-row items-center gap-3 bg-blue-600 py-2 px-4 rounded-lg">
                  <Text className="text-center text-white text-sm font-semibold">+ 21 Days</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={add90DaysToAlert1} className="flex-row items-center gap-3 bg-blue-600 py-2 px-4 rounded-lg">
                  <Text className="text-center text-white text-sm font-semibold">+ 90 Days</Text>
                </TouchableOpacity>
              </View>
              <View className="flex w-full items-center">
                <TouchableOpacity onPress={()=>setShowDateSelection1(true)} className="flex-row w-fit items-center gap-3 bg-blue-600 py-2 px-4 rounded-lg">
                  <Foundation name={"calendar"} size={20} color="white" />
                  <Text className="text-center text-white text-sm font-semibold">Select Date</Text>
                </TouchableOpacity>
              </View>
              {showDateSelection1 && (
                <DateTimePicker
                  value={
                    device.field1CropAlertDate < 0
                    ? new Date()
                    : new Date(device.field1CropAlertDate)
                  }
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={changeField1AlertDate}
                  minimumDate={new Date()}
                />
              )}
          </View>
          </View>
        </View>
        
        <View className="flex flex-col mx-3 mt-3 border border-gray-200 rounded-xl py-2">
          <Text className="text-lg font-extrabold text-gray-900 mx-3 my-2">Field 2</Text>
          <View className="flex-row">
            <MetricCard title="Water Level" value={levelStyles[device.waterLevel2].label} iconName="water" bgColor={levelStyles[device.waterLevel2].bg} iconColor={levelStyles[device.waterLevel2].iconColor} />
            <View className="flex-1 h-auto mx-2 my-3 px-3 justify-center border border-gray-300 rounded-xl">
              <Text className="text-sm text-gray-900">Alert Date:</Text>
              <Text className="text-sm text-gray-900">{(device.field2CropAlertDate>0) ? (convertDateToDisplayString(device.field2CropAlertDate)):("N/A")}</Text>
            </View>
          </View>
          <View>
          <View className="flex-col w-max h-auto mt-5 mx-2 px-5 py-3 gap-5 border border-gray-300 rounded-xl">
              <Text className="text-sm justify-normal">Set the field's alert date for automatic notification of your crops grown for maturity</Text>
              <View className="flex-row w-full gap-5 justify-center">
                <TouchableOpacity onPress={add21DaysToAlert2} className="flex-row items-center gap-3 bg-blue-600 py-2 px-4 rounded-lg">
                  <Text className="text-center text-white text-sm font-semibold">+ 21 Days</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={add90DaysToAlert2} className="flex-row items-center gap-3 bg-blue-600 py-2 px-4 rounded-lg">
                  <Text className="text-center text-white text-sm font-semibold">+ 90 Days</Text>
                </TouchableOpacity>
              </View>
              <View className="flex w-full items-center">
                <TouchableOpacity onPress={()=>setShowDateSelection2(true)} className="flex-row w-fit items-center gap-3 bg-blue-600 py-2 px-4 rounded-lg">
                  <Foundation name={"calendar"} size={20} color="white" />
                  <Text className="text-center text-white text-sm font-semibold">Select Date</Text>
                </TouchableOpacity>
              </View>
              {showDateSelection2 && (
                <DateTimePicker
                  value={
                    device.field2CropAlertDate < 0
                    ? new Date()
                    : new Date(device.field2CropAlertDate)
                  }
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={changeField2AlertDate}
                  minimumDate={new Date()}
                />
              )}
          </View>
          </View>
        </View>

        {/*<View className="flex mt-5 mx-auto">
              <TouchableOpacity onPress={()=>router.push("/CameraView")} className="bg-purple-800  py-2 px-4 rounded-lg">
                <Text className="text-center text-white font-semibold">View Camera</Text>
              </TouchableOpacity>
        </View>*/}
      </View>

      <Modal visible={showRenameModal} transparent animationType="fade" onRequestClose={cancelRenamePress}>
        <View className="flex-1 justify-center items-center bg-black/40">
          <View className="bg-white rounded-lg p-6 w-80">
            <Text className="text-lg font-bold text-center mb-4">New Device ID</Text>
            <Text className="text-center mb-6">Please input the new Device ID for this device</Text>

            <View className="flex-row mb-10">
              <View className="border border-gray-300 rounded-tl-lg rounded-bl-lg justify-center items-center px-2">
                <AntDesign name={"barcode"} size={28} color="green" />
              </View>
              <View className="flex-1 border border-gray-300 border-l-0 rounded-lg px-4 py-1">
                <TextInput
                  value={newDeviceID}
                  onChangeText={setNewDeviceID}
                  placeholder="Device ID"
                  keyboardType="default"
                  autoCapitalize="none"
                  className="text-gray-800"
                />
              </View>
            </View>

            <View className="flex-row justify-between">
              <TouchableOpacity onPress={cancelRenamePress} className="bg-gray-300 py-2 px-4 rounded-lg">
                <Text className="text-center text-black font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmRenamePress} className="bg-blue-600 py-2 px-4 rounded-lg">
                <Text className="text-center text-white font-semibold">Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DeviceDetails;