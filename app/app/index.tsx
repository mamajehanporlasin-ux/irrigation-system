import React, {useState, useEffect} from 'react';
import { View, Text, FlatList, SafeAreaView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import axiosInstance from '../axiosConfig.js';


const MetricCard = ({ title, value, unit, iconName, color }) => (
  <View className={`w-1/2 p-2`}>
    <View className={`flex-row items-center p-3 rounded-xl shadow-sm border border-gray-100 ${color}`}>
      <MaterialCommunityIcons name={iconName} size={24} color="#374151" />
      <View className="ml-3">
        <Text className="text-lg font-bold text-gray-800">{value}{unit}</Text>
        <Text className="text-xs text-gray-500">{title}</Text>
      </View>
    </View>
  </View>
);

/**
 * Device Card Component
 */
const DeviceCard = ({ device }) => {
  console.log(JSON.stringify(device));
  const tankLevel = device.tankLevel;
  const humidity=device.humidity;
  const isOnline=device.isOnline;
  const temperature = device.temperature;
  const soilMoisture=device.soilMoisture;
  const deviceID=device.deviceID;
  
  return (
    <TouchableOpacity 
      className="bg-white mx-4 mt-4 p-4 rounded-xl shadow-md border border-gray-100 active:bg-gray-50"
      onPress={() => console.log(`Device ${device.deviceID} tapped`)} // Action when device is tapped
      activeOpacity={0.8}
    >
      <View className="flex-row justify-between items-start pb-3 mb-3 border-b border-gray-100">
        <View className="flex-shrink">
          <Text className="text-xl font-extrabold text-gray-900">{device.deviceID}</Text>
        </View>
      </View>

      <View className="flex-row flex-wrap -m-2">
        <MetricCard 
          title="Humidity" 
          value={device.humidity} 
          unit="%" 
          iconName="water-percent" 
          color="bg-blue-50" 
        />
        <MetricCard 
          title="Temperature" 
          value={device.temperature} 
          unit="°C" 
          iconName="temperature-celsius" 
          color="bg-red-50" 
        />
      </View>
      <View className="flex flex-col w-auto h-auto mx-3 mt-2 hover:bg-blue-200 border border-gray-200">
        <Text className="text-lg font-extrabold text-gray-900 mx-3 my-2">Field 1</Text>
        <View className="flex flex-row">
            <MetricCard
              title="Water Level" 
              value={device.isWaterLevelLow1} 
              unit="" 
              iconName="water-boiler" 
              color="bg-cyan-50" 
            />
            <MetricCard 
              title="Soil Moisture" 
              value={device.soilMoisture1} 
              unit=" " 
              iconName="spa" 
              color="bg-amber-50" 
            />
          </View>
        </View>
        
        <View className="flex flex-col w-auto h-auto mx-3 border border-gray-200 hover:bg-blue-200">
        <Text className="text-lg font-extrabold text-gray-900 mx-3 my-2">Field 2</Text>
        <View className="flex flex-row">
            <MetricCard
              title="Water Level" 
              value={device.isWaterLevelLow2} 
              unit="" 
              iconName="water-boiler" 
              color="bg-cyan-50" 
            />
            <MetricCard 
              title="Soil Moisture" 
              value={device.soilMoisture2} 
              unit=" " 
              iconName="spa" 
              color="bg-amber-50" 
            />
          </View>
        </View>

        <View className="flex flex-col w-auto h-auto mx-3 border border-gray-200 hover:bg-blue-200">
        <Text className="text-lg font-extrabold text-gray-900 mx-3 my-2">Field 3</Text>
        <View className="flex flex-row">
            <MetricCard
              title="Water Level" 
              value={device.isWaterLevelLow3} 
              unit="" 
              iconName="water-boiler" 
              color="bg-cyan-50" 
            />
            <MetricCard 
              title="Soil Moisture" 
              value={device.soilMoisture3} 
              unit=" " 
              iconName="spa" 
              color="bg-amber-50" 
            />
          </View>
        </View>
    </TouchableOpacity>
  );
};

/**
 * Main Dashboard Component (The entire screen)
 */
const IrrigationDashboard = () => {
  const [data, setData] = useState([]);
  
  useEffect(()=>{
    const func=async()=>{
      try{
        const response = await axiosInstance.get("/device/get");
        if(!response.data.success){
            console.log(JSON.stringify(response.data.message));
            setData([]);
        }else{
            setData(response.data.data);
            console.log(JSON.stringify(response.data));
        }
      }catch(error){
        console.error("Data retrieval error:", error.message);
      }
    }

    func();
  },[]);

  const Header = () => (
    <View className="p-4 bg-white shadow-sm border-b border-gray-100">
      <Text className="text-3xl font-extrabold text-green-700">Dashboard</Text>
      <Text className="text-base text-gray-500">Irrigation System Overview</Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      
      {/* Render the simple header */}
      <Header />

      {/* FlatList for efficient, scrollable list of devices */}
      {data !== null && <FlatList
        data={data}
        keyExtractor={(item) => item._id.toString()}
        renderItem={({ item }) => <DeviceCard device={item} />}
        contentContainerStyle={{ paddingBottom: 16 }} // Space at the bottom
      />} 
    </SafeAreaView>
  );
};

export default IrrigationDashboard;