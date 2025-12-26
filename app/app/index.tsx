import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    console.log("Email:", email);
    console.log("Password:", password);
    
  };

  return (
    <SafeAreaView className="flex-1 w-full min-w-full bg-white">
      <KeyboardAvoidingView
        className="flex-1 justify-center px-6"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="mb-10">
            <Text className="text-3xl font-bold text-center text-gray-800 mb-2">
                Arduino based Smart Irrigation System
            </Text>
            
          <Text className="text-center text-gray-500 mt-2">
            Welcome Back, Login to your account
          </Text>
        </View>

        <View className="relative w-full h-auto flex flex-row mb-4">
            <View className="border border-gray-300 border-l-1 mr-[-3] rounded-tl-lg rounded-bl-lg justify-center items-center px-2">
                <MaterialIcons name="email" size={30} color="green" />
            </View>
          
          <View className="flex-1 border border-gray-300 border-l-0 rounded-lg px-4 py-1">
            <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                className="w-full mx-auto text-gray-800"
            />
          </View>
          
        </View>

        <View className="relative w-full h-auto flex flex-row mb-4">
            <View className="border border-gray-300 border-l-1 mr-[-3] rounded-tl-lg rounded-bl-lg justify-center items-center px-2">
                <MaterialIcons name="lock" size={30} color="green" />
            </View>
          <View className="flex-1 border border-gray-300 border-l-0 rounded-lg px-4 py-1">
            <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry
                className="w-full mx-auto text-gray-800"
            />
          </View>
        </View>

        <TouchableOpacity className="self-end mb-6">
          <Text className="text-blue-600 font-medium">
            Forgot Password?
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleLogin}
          className="bg-blue-600 py-4 rounded-lg mb-6"
        >
          <Text className="text-white text-center font-semibold text-lg">
            Login
          </Text>
        </TouchableOpacity>

        <View className="flex-row justify-center">
          <Text className="text-gray-600">Don’t have an account? </Text>
          <Link href="/SignupScreen" asChild>
            <TouchableOpacity>
              <Text className="text-blue-600 font-semibold">
                Sign Up
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}