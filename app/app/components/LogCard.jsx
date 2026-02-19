import { View, Text } from 'react-native';
import { MaterialCommunityIcons, Octicons } from '@expo/vector-icons';

const StatItem = ({ icon, label, value, color }) => (
  <View className="flex-row gap-3">
    <View className="items-center flex-col">
        <MaterialCommunityIcons name={icon} size={15} color={color} />
        <Text className="text-gray-400 text-[7px] mt-1 uppercase font-bold tracking-tighter">{label}</Text>
    </View>
    <Text className="text-gray-900 font-semibold text-lg">{value}</Text>
  </View>
);

const LogCard = ({ data }) => {
  return (
    <View className="bg-white mb-4 rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <View className="flex-row justify-between items-center px-4 py-3 bg-gray-50/50 border-b border-gray-100">
        <View className="flex-row items-center">
          <Octicons name="calendar" size={14} color="#6b7280" />
          <Text className="text-gray-500 text-[11px] font-semibold ml-2">
            {new Date(data.eventDate).toLocaleDateString()} • {new Date(data.eventDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </Text>
        </View>
        <Text className="text-[10px] font-medium">
          ID: {data.device.deviceID || "N/A"}
        </Text>
      </View>

      <View className="flex-row justify-center gap-10 px-4 py-2">
        <StatItem 
          icon="thermometer" 
          label="Temp" 
          value={`${data.temperature}°C`} 
          color="#ef4444" 
        />
        <StatItem 
          icon="water-percent" 
          label="Humidity" 
          value={`${data.humidity}%`} 
          color="#0ea5e9" 
        />
        {/*
        <StatItem 
          icon="database" 
          label="Res. Lvl" 
          value={data.reservoirLevel} 
          color="#8b5cf6" 
        />*/}
      </View>

      <View className="flex-row border-t border-gray-50 bg-gray-50/30 px-4 py-3 justify-around">
        <View className="flex-row items-center">
          <MaterialCommunityIcons name="waves" size={16} color="#3b82f6" />
          <Text className="text-gray-600 text-xs ml-2">Field 1: <Text className="font-bold">{data.waterLevel1}</Text></Text>
        </View>
        <View className="flex-row items-center">
          <MaterialCommunityIcons name="waves" size={16} color="#3b82f6" />
          <Text className="text-gray-600 text-xs ml-2">Field 2: <Text className="font-bold">{data.waterLevel2}</Text></Text>
        </View>
      </View>
    </View>
  );
};


export default LogCard;