import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Octicons } from '@expo/vector-icons';

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

const DeviceCard = ({ device, pressEventHandler }) => {
  // Helpful for debugging in the console
  console.log("Device Data Update:", device.deviceID, "Soil1:", device.pump1, "Soil2:", device.pump2, "Soil3:", device.pump3, "Soil4:", device.pump4, "Soil5:", device.pump5, "Soil6:", device.pump6);

  const renderHardwareGrid = () => {
    const grid = [];
    for (let i = 1; i <= 4; i++) {
      /**
       * BACKEND LOGIC ALIGNMENT:
       * Soil: 0 = MOIST (Active State), 1 = DRY (Inactive State)
       * Pump: 1 = ON (Active State), 0 = OFF (Inactive State)
       */
      const isMoist = device[`soilMoist${i}`] === 0;
      const isPumpOn = device[`pump${i}`] === 1;

      grid.push(
        <View key={`zone-${i}`} className="w-full flex-row mb-2">
          <View className="w-1/6 justify-center">
            <Text className="text-[10px] font-black text-gray-400">ZONE {i}</Text>
          </View>
          
          {/* Soil Status: Highlights Orange when MOIST (0) */}
          <StatusMetric 
            title="Soil" 
            isActive={isMoist} 
            label={isMoist ? "MOIST" : "DRY"} 
            icon={isMoist ? "water" : "water-outline"} 
            activeColor="#f97316" 
            activeBg="bg-orange-50"
          />
          
          {/* Pump Status: Highlights Blue when ON (1) */}
          <StatusMetric 
            title="Pump" 
            isActive={isPumpOn} 
            label={isPumpOn ? "ON" : "OFF"} 
            icon={isPumpOn ? "sprinkler-variant" : "pipe-disconnected"} 
            activeColor="#2563eb" 
            activeBg="bg-blue-50"
          />
        </View>
      );
    }
    return grid;
  };

  return (
    <TouchableOpacity
      className="bg-white mx-4 mt-4 p-4 rounded-2xl shadow-sm border border-gray-100 active:bg-gray-50"
      onPress={() => pressEventHandler(device)}
      activeOpacity={0.8}
    >
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <View>
          <Text className="text-xl font-extrabold text-gray-900 tracking-tight">{device.deviceID}</Text>
          <View className="flex-row items-center">
            <Octicons name="dot-fill" size={12} color={device.isOnline ? '#22c55e' : '#ef4444'} />
            <Text className="ml-1 text-xs font-medium text-gray-400">
              {device.isOnline ? 'System Online' : 'Offline'}
            </Text>
          </View>
        </View>
        {device.isRaining === 1 && (
          <View className="bg-indigo-100 px-3 py-1 rounded-lg flex-row items-center border border-indigo-200">
            <MaterialCommunityIcons name="weather-pouring" size={16} color="#4338ca" />
            <Text className="ml-1 text-[10px] font-black text-indigo-700 uppercase">Raining</Text>
          </View>
        )}
      </View>

      {/* Environment Stats */}
      <View className="flex-row mb-4 bg-gray-50 rounded-2xl p-2 border border-gray-100">
        <View className="flex-1 items-center border-r border-gray-200">
          <Text className="text-lg font-black text-gray-800">{device.humidity}%</Text>
          <Text className="text-[9px] uppercase text-gray-500 font-bold">Humidity</Text>
        </View>
        <View className="flex-1 items-center">
          <Text className="text-lg font-black text-gray-800">{device.temperature}°C</Text>
          <Text className="text-[9px] uppercase text-gray-500 font-bold">Temp</Text>
        </View>
        <View className="flex-1 items-center">
          <Text className="text-lg font-black text-gray-800">{device.isRaining === 1 ? "Raining" : "Sunny"}</Text>
          <Text className="text-[9px] uppercase text-gray-500 font-bold">Weather</Text>
        </View>
      </View>

      {/* Fields Water Levels */}
      <View className="flex-row justify-between mb-4">
        {[1, 2].map((num) => {
          const levelData = getWaterLevelData(device[`waterLevel${num}`]);
          return (
            <View key={`field-${num}`} className={`w-[48%] p-3 rounded-xl border border-gray-100 ${levelData.bg}`}>
              <Text className="text-[10px] font-black text-gray-500 uppercase mb-1">Field {num}</Text>
              <View className="flex-row items-center justify-between">
                <MaterialCommunityIcons name={levelData.icon} size={20} color={levelData.color} />
                <Text className="text-xs font-black" style={{ color: levelData.color }}>
                  {levelData.label}
                </Text>
              </View>
              {(device[`field${num}CropAlertDate`] > 0 && device[`field${num}CropAlertDate`] <= Date.now()) && (
                <View className="mt-2 pt-1 border-t border-orange-200">
                  <Text className="text-[8px] text-orange-700 font-black italic uppercase">Task Due</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
        
      {/* Hardware Diagnostics Section */}
      <View className="border-t border-gray-100 pt-3">
        <Text className="text-[11px] font-black text-gray-900 uppercase mb-3 tracking-widest text-center">Zone Diagnostics</Text>
        {renderHardwareGrid()}
      </View>
      
    </TouchableOpacity>
  );
};

export default DeviceCard;