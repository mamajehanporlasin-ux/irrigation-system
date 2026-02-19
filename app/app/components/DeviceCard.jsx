import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Octicons } from '@expo/vector-icons';


const levelStyles = {
  OK: {
    label: 'OK',
    bg: 'bg-green-50',
    iconColor: '#16a34a',
  },
  LOW: {
    label: 'LOW',
    bg: 'bg-red-50',
    iconColor: '#dc2626',
  },
  FULL: {
    label: 'FULL',
    bg: 'bg-blue-50',
    iconColor: '#2563eb',
  },
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

const DeviceCard = ({ device, pressEventHandler }) => {

  const reservoir = levelStyles[device.reservoirLevel];

  return (
    <TouchableOpacity
      className="bg-white mx-4 mt-4 p-4 rounded-xl shadow-md border border-gray-100 active:bg-gray-50"
      onPress={() => pressEventHandler(device)}
      activeOpacity={0.8}
    >
      <View className="flex-row justify-between items-start pb-3 mb-3 border-b border-gray-100">
        <Text className="text-xl font-extrabold text-gray-900">
          {device.deviceID}
        </Text>
        <Octicons
          name="dot-fill"
          size={30}
          color={device.isOnline ? 'green' : 'red'}
        />
      </View>

      <View className="flex-row flex-wrap -m-2">
        <MetricCard
          title="Humidity"
          value={`${device.humidity}%`}
          iconName="water-percent"
          bgColor="bg-blue-50"
          iconColor="#2563eb"
        />
        <MetricCard
          title="Temperature"
          value={`${device.temperature}°C`}
          iconName="temperature-celsius"
          bgColor="bg-red-50"
          iconColor="#dc2626"
        />
      </View>

      {/* ===== Reservoir Status ===== 
      <View className="mx-3 mt-3">
        <Text className="text-lg font-extrabold text-gray-900 mb-2">
          Reservoir
        </Text>
        <View className={`p-3 rounded-xl ${reservoir.bg}`}>
          <View className="flex-row items-center">
            <MaterialCommunityIcons
              name="water"
              size={22}
              color={reservoir.iconColor}
            />
            <Text className="ml-2 text-base font-bold text-gray-800">
              {reservoir.label}
            </Text>
          </View>
        </View>
      </View>
      */}
      {/* ===== Fields ===== */}
      {[
        { label: 'Field 1', level: device.waterLevel1 },
        { label: 'Field 2', level: device.waterLevel2 },
      ].map((field, index) => {
        const style = levelStyles[field.level];

        return (
          <View
            key={index}
            className="flex flex-col mx-3 mt-3 border border-gray-200 rounded-xl"
          >
            <Text className="text-lg font-extrabold text-gray-900 mx-3 my-2">
              {field.label}
            </Text>
            <View className="flex-row">
              <MetricCard
                title="Water Level"
                value={style.label}
                iconName="water"
                bgColor={style.bg}
                iconColor={style.iconColor}
              />
            </View>
          </View>
        );
      })}
    </TouchableOpacity>
  );
};

export default DeviceCard;
