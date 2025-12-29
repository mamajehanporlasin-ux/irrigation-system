import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Octicons } from '@expo/vector-icons'; 

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

const DeviceCard = ({ device, pressEventHandler }) => {
  
  return (
    <TouchableOpacity 
      className="bg-white mx-4 mt-4 p-4 rounded-xl shadow-md border border-gray-100 active:bg-gray-50"
      onPress={() =>pressEventHandler(device)} // Action when device is tapped
      activeOpacity={0.8}
    >
      <View className="flex-row justify-between items-start pb-3 mb-3 border-b border-gray-100">
        <View className="flex-1">
          <Text className="text-xl font-extrabold text-gray-900">{device.deviceID}</Text>
        </View>
        <Octicons name="dot-fill" size={30} color={device.isOnline ? ("green"):("red")}/>
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

export default DeviceCard;