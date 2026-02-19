import { Tabs } from "expo-router";
import { MaterialIcons, FontAwesome, Entypo } from "@expo/vector-icons";

export default function _Layout() {
  return (
    <Tabs 
        screenOptions={{
            tabBarShowLabel: false,
            tabBarItemStyle: { 
                width: '100%', 
                height: '100%', 
                justifyContent: 'center', 
                alignItems: 'center',
                paddingTop: 5
            },
            tabBarStyle: {
                backgroundColor: '#285e61',
                borderRadius: 50,
                marginHorizontal: 20,
                marginBottom: 36,
                height: 50,
                position: "absolute",
                overflow: "hidden",
                borderWidth: 1,
                borderColor: '#0F0D23'
            },
            tabBarLabelStyle: {
                fontSize: 1,
            },
            tabBarActiveTintColor: '#22c55e',
            tabBarInactiveTintColor: '#9ca3af',
        }}
        
    >
        <Tabs.Screen 
            name="Devices"
            options={{
                title: 'Devices',
                headerShown: false,
                tabBarIcon: ({focused})=>(
                    <FontAwesome name={"leaf"} size={30} color={focused ? ("#ffa500"): ("white")} />
                )
            }}
        />
        <Tabs.Screen 
            name="Log"
            options={{
                title: 'Log',
                headerShown: false,
                tabBarIcon: ({focused})=>(
                    <Entypo name={"folder"} size={30} color={focused ? ("#ffa500"): ("white")} />
                )
            }}
        />
        <Tabs.Screen 
            name="Profile"
            options={{
                title: 'Profile',
                headerShown: false,
                tabBarIcon: ({focused})=>(
                    <MaterialIcons name={"manage-accounts"} size={30} color={focused ? ("#ffa500"): ("white")} />
                )
            }}
        />
        
    </Tabs>
  );
}
