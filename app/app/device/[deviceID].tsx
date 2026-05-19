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
import { useLocalSearchParams } from "expo-router";
import { convertDateToJsonString, convertDateToDisplayString } from "../../functions";
import loadingOverlay from "../components/LoadingOverlay";
import axiosInstance from "@/axiosConfig";
import Toast from "react-native-toast-message";
import DateTimePicker from '@react-native-community/datetimepicker';

// Consistent data mapping from your updated DeviceCard
const getWaterLevelData = (val) => {
  switch (val) {
    case 2: return { label: 'FULL', bg: 'bg-blue-50', color: '#2563eb', icon: 'water-plus' };
    case 1: return { label: 'OK', bg: 'bg-green-50', color: '#16a34a', icon: 'water' };
    case 0:
    default: return { label: 'LOW', bg: 'bg-red-50', color: '#dc2626', icon: 'water-outline' };
  }
};

const StatusMetric = ({ title, isActive, label, icon, activeColor, activeBg }) => (
  <View className="w-1/3 p-1">
    <View className={`items-center p-2 rounded-xl border ${isActive ? `border-${activeBg}-100 ${activeBg}` : 'border-gray-100 bg-gray-50'}`}>
      <MaterialCommunityIcons 
        name={icon} 
        size={20} 
        color={isActive ? activeColor : '#9ca3af'} 
      />
      <Text className={`text-[10px] font-bold mt-1 ${isActive ? 'text-gray-700' : 'text-gray-500'}`}>
        {title}
      </Text>
      <Text className={`text-[9px] font-extrabold ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
        {label}
      </Text>
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

  // 1-Second Automatic Refresh Logic
  useEffect(() => {
    // Initial fetch
    reloadData(false); 

    const interval = setInterval(() => {
      reloadData(true); // Silent refresh every 1 second
    }, 1000);

    return () => clearInterval(interval);
  }, [deviceID]);

  const reloadData = async (isSilent = false) => {
    try {
      const response = await axiosInstance.get(`/device/get-a-device/${deviceID}`, { withCredentials: true });
      if (response.data.success) {
        setDevice(response.data.data[0]);
      }
    } catch (error) {
      if (!isSilent) console.error("Data reload failed", error);
    }
  };

  const confirmRenamePress = async () => {
    setShowRenameModal(false);
    setIsLoading(true);
    try {
      const response = await axiosInstance.put(`/device/update/${device._id}`, { deviceID: newDeviceID }, { withCredentials: true });
      if (response.data.success) {
        Toast.show({ type: 'success', text1: '✅ Updated!', text2: 'Device ID changed.' });
        setDevice(response.data.data[0]);
        setNewDeviceID("");
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: '❌ Update Error', text2: error.message });
    }
    setIsLoading(false);
  };

  const handleSetAlert = async (fieldNum, days) => {
    setIsLoading(true);
    try {
      let inputDate = -1;
      if (days !== -1) {
        const date = new Date(Date.now() + (1000 * 60 * 60 * 24 * days));
        inputDate = convertDateToJsonString(date);
      }
      const data = { deviceDBID: device._id, inputDate, fieldNumber: fieldNum };
      const response = await axiosInstance.put(`/device/set-alert-date`, data, { withCredentials: true });
      if (response.data.success) {
        Toast.show({ type: 'success', text1: '✅ Alert Updated' });
        setDevice(response.data.data[0]);
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: '❌ Error', text2: error.message });
    }
    setIsLoading(false);
  };

  const onDateChange = async (event, selectedDate, fieldNum) => {
    if (event.type === "dismissed") {
      fieldNum === 1 ? setShowDateSelection1(false) : setShowDateSelection2(false);
      return;
    }
    fieldNum === 1 ? setShowDateSelection1(false) : setShowDateSelection2(false);
    setIsLoading(true);
    try {
      const jsonDate = convertDateToJsonString(new Date(selectedDate));
      const response = await axiosInstance.put(`/device/set-alert-date`, { deviceDBID: device._id, inputDate: jsonDate, fieldNumber: fieldNum }, { withCredentials: true });
      if (response.data.success) setDevice(response.data.data[0]);
    } catch (error) {
      Toast.show({ type: 'error', text1: '❌ Error', text2: error.message });
    }
    setIsLoading(false);
  };

  const renderHardwareGrid = () => {
    const grid = [];
    for (let i = 1; i <= 4; i++) {
      // ALIGNED LOGIC: Soil 0 = Moist, Pump 1 = On
      const isMoist = device[`soilMoist${i}`] === 0;
      const isPumpOn = device[`pump${i}`] === 1;
      grid.push(
        <View key={`zone-${i}`} className="w-full flex-row mb-2 px-2">
          <View className="w-1/6 justify-center">
            <Text className="text-[10px] font-black text-gray-400">ZONE {i}</Text>
          </View>
          <StatusMetric title="Soil" isActive={isMoist} label={isMoist ? "MOIST" : "DRY"} icon={isMoist ? "water" : "water-outline"} activeColor="#f97316" activeBg="bg-orange-50" />
          <StatusMetric title="Pump" isActive={isPumpOn} label={isPumpOn ? "ON" : "OFF"} icon={isPumpOn ? "sprinkler-variant" : "pipe-disconnected"} activeColor="#2563eb" activeBg="bg-blue-50" />
        </View>
      );
    }
    return grid;
  };

  if (!device || Object.keys(device).length === 0) return <SafeAreaView className="flex-1 bg-gray-100">{isLoading && loadingOverlay()}</SafeAreaView>;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {isLoading && loadingOverlay()}
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Header Section */}
        <View className="bg-white px-6 pt-12 pb-6 border-b border-gray-100 shadow-sm">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-3xl font-black text-gray-900 tracking-tighter">{device.deviceID}</Text>
              <View className="flex-row items-center mt-1">
                <Octicons name="dot-fill" size={14} color={device.isOnline ? '#22c55e' : '#ef4444'} />
                <Text className="ml-1.5 text-sm font-bold text-gray-400">
                  {device.isOnline ? 'System Online' : 'Offline'}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setShowRenameModal(true)} className="bg-gray-100 p-3 rounded-2xl">
              <MaterialIcons name="edit-square" size={20} color="#374151" />
            </TouchableOpacity>
          </View>
          
          {device.isRaining === 1 && (
            <View className="mt-4 bg-indigo-100 px-4 py-2 rounded-xl flex-row items-center self-start border border-indigo-200">
              <MaterialCommunityIcons name="weather-pouring" size={18} color="#4338ca" />
              <Text className="ml-2 text-xs font-black text-indigo-700 uppercase tracking-widest">Raining Now</Text>
            </View>
          )}
        </View>

        {/* Env Stats */}
        <View className="flex-row mx-4 mt-6 bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
          <View className="flex-1 items-center border-r border-gray-100">
            <Text className="text-2xl font-black text-gray-900">{device.humidity}%</Text>
            <Text className="text-[10px] uppercase text-gray-400 font-bold tracking-widest">Humidity</Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-2xl font-black text-gray-900">{device.temperature}°C</Text>
            <Text className="text-[10px] uppercase text-gray-400 font-bold tracking-widest">Temp</Text>
          </View>
        </View>

        {/* Field Sections with Date Pickers */}
        {[1, 2].map((num) => {
          const levelData = getWaterLevelData(device[`waterLevel${num}`]);
          const alertDate = device[`field${num}CropAlertDate`];
          const isOverdue = alertDate > 0 && alertDate <= Date.now();

          return (
            <View key={`field-ui-${num}`} className="bg-white mx-4 mt-4 p-5 rounded-3xl shadow-sm border border-gray-100">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-black text-gray-900 uppercase tracking-tight">Field {num}</Text>
                <View className={`${levelData.bg} px-3 py-1 rounded-lg border border-gray-50`}>
                  <Text className="text-[10px] font-black" style={{ color: levelData.color }}>{levelData.label} LEVEL</Text>
                </View>
              </View>

              <View className="flex-row items-center bg-gray-50 p-4 rounded-2xl mb-4">
                <MaterialCommunityIcons name={levelData.icon} size={32} color={levelData.color} />
                <View className="ml-4">
                  <Text className="text-xs font-bold text-gray-400 uppercase">Alert Date</Text>
                  <Text className="text-base font-black text-gray-800">
                    {alertDate > 0 ? convertDateToDisplayString(alertDate) : "Not Set"}
                  </Text>
                </View>
              </View>

              {isOverdue ? (
                <TouchableOpacity 
                  onPress={() => handleSetAlert(num, -1)}
                  className="bg-green-600 flex-row items-center justify-center py-4 rounded-2xl shadow-sm"
                >
                  <MaterialCommunityIcons name="check-decagram" size={20} color="white" />
                  <Text className="ml-2 text-white font-black uppercase text-xs tracking-widest">Mark as Harvested</Text>
                </TouchableOpacity>
              ) : (
                <View>
                  <Text className="text-[10px] text-gray-400 font-bold mb-3 px-1 italic">Set notification for crop maturity:</Text>
                  <View className="flex-row gap-2">
                    <TouchableOpacity onPress={() => handleSetAlert(num, 21)} className="flex-1 bg-blue-50 py-3 rounded-xl border border-blue-100">
                      <Text className="text-center text-blue-700 font-black text-[10px] uppercase">+21 Days</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleSetAlert(num, 90)} className="flex-1 bg-blue-50 py-3 rounded-xl border border-blue-100">
                      <Text className="text-center text-blue-700 font-black text-[10px] uppercase">+90 Days</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => num === 1 ? setShowDateSelection1(true) : setShowDateSelection2(true)}
                      className="flex-1 bg-blue-600 py-3 rounded-xl shadow-sm"
                    >
                      <Text className="text-center text-white font-black text-[10px] uppercase">Custom</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {(num === 1 ? showDateSelection1 : showDateSelection2) && (
                <DateTimePicker
                  value={alertDate < 0 ? new Date() : new Date(alertDate)}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(e, d) => onDateChange(e, d, num)}
                  minimumDate={new Date()}
                />
              )}
            </View>
          );
        })}

        {/* Diagnostics Grid */}
        <View className="bg-white mx-4 mt-4 mb-10 p-5 rounded-3xl shadow-sm border border-gray-100">
          <Text className="text-[11px] font-black text-gray-900 uppercase mb-4 tracking-widest text-center">Zone Diagnostics</Text>
          {renderHardwareGrid()}
        </View>

      </ScrollView>

      {/* Rename Modal */}
      <Modal visible={showRenameModal} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/60 px-6">
          <View className="bg-white rounded-3xl p-8 w-full">
            <Text className="text-2xl font-black text-gray-900 text-center mb-2">Rename Device</Text>
            <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 py-1 mt-8 mb-8">
              <AntDesign name="barcode" size={24} color="#16a34a" />
              <TextInput
                value={newDeviceID}
                onChangeText={setNewDeviceID}
                placeholder="Ex: PADDY_FIELD_01"
                className="flex-1 ml-3 h-12 text-gray-800 font-bold"
                autoCapitalize="characters"
              />
            </View>
            <View className="flex-row gap-3">
              <TouchableOpacity onPress={() => setShowRenameModal(false)} className="flex-1 bg-gray-100 py-4 rounded-2xl">
                <Text className="text-center text-gray-600 font-black uppercase text-xs">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmRenamePress} className="flex-1 bg-blue-600 py-4 rounded-2xl shadow-md">
                <Text className="text-center text-white font-black uppercase text-xs">Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default DeviceDetails;