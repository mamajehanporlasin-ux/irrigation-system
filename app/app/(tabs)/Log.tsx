import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Platform,
  Image
} from "react-native";
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from "react-native-safe-area-context";
import loadingOverlay from "../components/LoadingOverlay";
import axiosInstance from "@/axiosConfig";
import Toast from "react-native-toast-message";
import DateTimePicker from '@react-native-community/datetimepicker';
import HeaderComponent from "../components/Header";
import LogCard from "../components/LogCard";

const ProfileTab = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [deviceIDs, setDeviceIDs] = useState([]);
  const [selectedDeviceID, setSelectedDeviceID] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showStartDateSelection, setShowStartDateSelection] = useState(false);
  const [showEndDateSelection, setShowEndDateSelection] = useState(false);
  const [data, setData] = useState([]);

  // Load user's devices
  const reloadData = async () => {
    try {
      const response = await axiosInstance.get("/device/get-my-devices", { withCredentials: true });
      if (!response.data.success) {
        Toast.show({
          type: 'error',
          text1: '❌ Error while retrieving your Devices!',
          text2: response.data.message
        });
        setDeviceIDs([]);
      } else {
        const ids = response.data.data.map(d => d.deviceID);
        setDeviceIDs(ids);
      }
    } catch (error) {
      console.log("Error retrieving devices: " + error.message);
      Toast.show({
        type: 'error',
        text1: '❌ Error while retrieving your Devices!',
        text2: error.message
      });
      setDeviceIDs([]);
    }
  }

  useEffect(() => {
    setIsLoading(true);
    reloadData().finally(() => setIsLoading(false));
  }, []);

  const changeStartDate = (event) => {
    setStartDate(new Date(event.nativeEvent.timestamp));
    setShowStartDateSelection(false);
  }

  const changeEndDate = (event) => {
    setEndDate(new Date(event.nativeEvent.timestamp));
    setShowEndDateSelection(false);
  }

  const searchEvents = async () => {
    setData([]);
    setIsLoading(true);
    try {
      const payload = {
        startDate,
        endDate
      };
      if (selectedDeviceID) payload.deviceID = selectedDeviceID;

      const response = await axiosInstance.post("/event/sensor-records", payload, { withCredentials: true });

      if (!response.data.success) {
        Toast.show({
          type: 'error',
          text1: '❌ Error while retrieving Device Records!',
          text2: response.data.message
        });
        setData([]);
      } else {
        setData(response.data.data);
      }
    } catch (error) {
      console.log("Error retrieving events: " + error.message);
      Toast.show({
        type: 'error',
        text1: '❌ Error while retrieving Device Records!',
        text2: error.message
      });
      setData([]);
    }
    setIsLoading(false);
  }

  const renderTableHeading = () => (
    <View className="flex-1 flex-row gap-2 w-full h-auto py-2 items-center bg-rose-500 rounded-t-lg">
      <Text className="w-15 text-center text-white text-xs mx-1 pl-3 font-bold">Date</Text>
      <Text className="w-15 text-center text-white text-xs mx-1 font-bold">Device</Text>
      <Text className="flex-1 text-center text-white text-xs mx-1 font-bold">Temp</Text>
      <Text className="flex-1 text-center text-white text-xs mx-1 font-bold">Hum</Text>
      <Text className="flex-1 text-center text-white text-xs mx-1 font-bold">Reservoir</Text>
      <Text className="flex-1 text-center text-white text-xs mx-1 font-bold">Water 1</Text>
      <Text className="flex-1 text-center text-white text-xs mx-1 font-bold">Water 2</Text>
      <Text className="flex-1 text-center text-white text-xs mx-1 font-bold">Water 3</Text>
    </View>
  );

  const renderTableData = ({ item }) => {
    if (!item) return null;

    return (
      <View className="flex-1 flex-row gap-2 w-full h-auto py-2 items-center border-b border-gray-200">
        <Text className="w-12 text-left text-xs mx-1 pl-2">{new Date(item.eventDate).toLocaleString()}</Text>
        <Text className="w-15 text-left text-xs mx-1">{item.device.deviceID || "N/A"}</Text>
        <Text className="flex-1 text-left text-xs mx-1">{item.temperature}</Text>
        <Text className="flex-1 text-left text-xs mx-1">{item.humidity}</Text>
        <Text className="flex-1 text-left text-xs mx-1">{item.reservoirLevel}</Text>
        <Text className="flex-1 text-left text-xs mx-1">{item.waterLevel1}</Text>
        <Text className="flex-1 text-left text-xs mx-1">{item.waterLevel2}</Text>
        <Text className="flex-1 text-left text-xs mx-1">{item.waterLevel3}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {isLoading && loadingOverlay()}
      <HeaderComponent />

      <View className="flex h-fit px-7 py-1 mx-5 my-5 bg-white shadow-sm border-b border-gray-100 rounded-lg">
        <View className="flex flex-row w-full h-20 gap-4 my-2 items-center">
          <Text className="text-gray-500 text-md">Devices: </Text>
          <View className="flex-1 border border-gray-300 rounded-xl h-fit p-0 text-sm">
            <Picker
              selectedValue={selectedDeviceID}
              onValueChange={(itemValue) => setSelectedDeviceID(itemValue)}
              style={{
                flex: 1,
                width: "auto",
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 8,
                overflow: 'hidden',
                marginRight: 5,
                fontSize: 8
              }}
            >
              <Picker.Item label="All" value="" />
              {deviceIDs.map((item) => (
                <Picker.Item key={item} label={item} value={item} />
              ))}
            </Picker>
          </View>
        </View>

        <View className="flex flex-row w-full h-fit gap-4 my-2 items-center">
          <View className="flex-1 flex-col justify-center w-fit">
            <Text className="text-slate-600 text-sm">Start Date</Text>
            <TouchableOpacity
              onPress={() => setShowStartDateSelection(true)}
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 flex-row justify-between items-center active:bg-slate-100"
            >
              <Text className="text-slate-600 text-sm">{startDate.toLocaleDateString()}</Text>
              <MaterialIcons name='arrow-drop-down' size={25} />
            </TouchableOpacity>

            {showStartDateSelection && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={changeStartDate}
              />
            )}
          </View>

          <View className="flex-1 flex-col justify-center w-fit">
            <Text className="text-slate-600 text-sm">End Date</Text>
            <TouchableOpacity
              onPress={() => setShowEndDateSelection(true)}
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 flex-row justify-between items-center active:bg-slate-100"
            >
              <Text className="text-slate-600 text-sm">{endDate.toLocaleDateString()}</Text>
              <MaterialIcons name='arrow-drop-down' size={25} />
            </TouchableOpacity>

            {showEndDateSelection && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                minimumDate={startDate}
                onChange={changeEndDate}
              />
            )}
          </View>
        </View>

        <View className="flex h-10 mx-10 mt-2 mb-5">
          <TouchableOpacity
            onPress={searchEvents}
            className="flex-row bg-blue-600 py-2 px-4 rounded-lg justify-center gap-3"
          >
            <MaterialIcons name='search' size={25} color={"white"} />
            <Text className="text-center text-white font-semibold">Search</Text>
          </TouchableOpacity>
        </View>
      </View>

      {data.length > 0 && (
        <View className="flex flex-col mx-5 text-md">
          <FlatList
            data={data}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => <LogCard data={item} />}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

export default ProfileTab;
