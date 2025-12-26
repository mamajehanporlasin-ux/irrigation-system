import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from "react-native";
import loadingOverlay from "./components/LoadingOverlay.jsx";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { Link } from "expo-router";
import axiosInstance from "../axiosConfig.js";
import Toast from "react-native-toast-message";


const InputWithIcon = ({ icon, placeholder, value, setValue, secure = false, keyboardType = "default" }) => (
  <View className="flex-row mb-4">
    <View className="border border-gray-300 rounded-tl-lg rounded-bl-lg justify-center items-center px-2">
      <MaterialIcons name={icon} size={28} color="green" />
    </View>
    <View className="flex-1 border border-gray-300 border-l-0 rounded-lg px-4 py-1">
      <TextInput
        value={value}
        onChangeText={setValue}
        placeholder={placeholder}
        secureTextEntry={secure}
        keyboardType={keyboardType}
        autoCapitalize="none"
        className="text-gray-800"
      />
    </View>
  </View>
);

export default function SignupScreen() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");

  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [regionSelections, setRegionSelections] = useState([]);
  const [provinceSelections, setProvinceSelections] = useState([]);
  const [municipalitySelections, setMunicipalitySelections] = useState([]);
  const [barangaySelections, setBarangaySelections] = useState([]);

  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = () => {
    console.log({
      email,
      firstName,
      middleName,
      lastName,
      contact,
      address,
      password,
      confirmPassword,
    });


    if(!address || address.length<1){
      Toast.show({
        type: 'error',
        text1: '❌ Invalid Address!',
        text2: 'Please Input your Address!'
      });
    }

    if(!confirmPassword || confirmPassword.length<1){
      Toast.show({
        type: 'error',
        text1: '❌ Invalid Password Confirmation!',
        text2: 'Please Confirm your Password'
      });
    }
    if(password !== confirmPassword ){
      Toast.show({
        type: 'error',
        text1: '❌ Invalid Password!',
        text2: 'Password mismatched! please confirm your password again'
      });
    }
    if(!password || password.length<1){
      Toast.show({
        type: 'error',
        text1: '❌ Invalid Password!',
        text2: 'Please input your Password'
      });
    }else if(password.length<8){
      Toast.show({
        type: 'error',
        text1: '❌ Invalid Password!',
        text2: 'Password should be atleast 8 characters long'
      });
    }
    if(!contact || contact.length<1){
      Toast.show({
        type: 'error',
        text1: '❌ Invalid Contact Number!',
        text2: 'Please input your Contact Number'
      });
    }
    if(!lastName || lastName.length<1){
      Toast.show({
        type: 'error',
        text1: '❌ Invalid Last Name!',
        text2: 'Please input your Last Name'
      });
    }
    if(!middleName || middleName.length<1){
      Toast.show({
        type: 'error',
        text1: '❌ Invalid Middle Name!',
        text2: 'Please input your Middle Name'
      });
    }
    if(!firstName || firstName.length<1){
      Toast.show({
        type: 'error',
        text1: '❌ Invalid First Name!',
        text2: 'Please input your First Name'
      });
    }
    if(!email || email.length<1){
      Toast.show({
        type: 'error',
        text1: '❌ Invalid Email!',
        text2: 'Please input your email address'
      });
    }
  };

  return (
    
    <SafeAreaView className="flex-1 bg-white">
      {isLoading && loadingOverlay()}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="px-6"
        >
          
          <View className="my-8">
            <Text className="text-3xl font-bold text-center text-gray-800">
              Create Account
            </Text>
            <Text className="text-center text-gray-500 mt-2">
              Arduino based Smart Irrigation System
            </Text>
          </View>
          <View className="my-8 gap-3">
            <Text className="border border-gray-300 px-5 py-3">Your email address will be used as your User name for logging in</Text>
            <InputWithIcon icon="email" placeholder="Email Address" value={email} setValue={setEmail} keyboardType="email-address" />
          </View>
            <Text className="text-xl font-bold text-center text-gray-800 mb-5">
              Your Personal Info
            </Text>
          <InputWithIcon icon="person" placeholder="First Name" value={firstName} setValue={setFirstName} />
          <InputWithIcon icon="person-outline" placeholder="Middle Name" value={middleName} setValue={setMiddleName} />
          <InputWithIcon icon="person" placeholder="Last Name" value={lastName} setValue={setLastName} />
          <InputWithIcon icon="phone" placeholder="Contact Number" value={contact} setValue={setContact} keyboardType="phone-pad" />
          
          <View className="my-8">
            <Text className="text-xl font-bold text-center text-gray-800 mb-5">
              Your Address
            </Text>
            <View className="flex-row mb-4">
              <View className="border border-gray-300 rounded-tl-lg rounded-bl-lg justify-center items-center px-2">
                <MaterialIcons name="home" size={28} color="green" />
              </View>
              <View className="flex-1 border border-gray-300 border-l-0 rounded-lg px-4 py-1">
                <TextInput
                  multiline
                  numberOfLines={4}
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Street / Block / House No. , Barangay, Municipality, Province"
                  autoCapitalize="none"
                  className="text-gray-800"
                  textAlignVertical="top"
                />
              </View>
            </View>
          </View>

          <View className="border border-gray-300 px-5 py-3 mb-5">
            <Text className="text-xl font-bold text-center text-gray-800 mb-5">
              Your Password
            </Text>
            <Text className="px-5 py-3 text-center mb-5">Password should be atleast 8 characters in length</Text>
            <InputWithIcon icon="lock" placeholder="Password" value={password} setValue={setPassword} secure />
            <InputWithIcon icon="lock-outline" placeholder="Confirm Password" value={confirmPassword} setValue={setConfirmPassword} secure />
          </View>
          
          <TouchableOpacity
            onPress={handleSignup}
            className="bg-blue-600 py-4 rounded-lg mt-4 mb-6"
          >
            <Text className="text-white text-center font-semibold text-lg">
              Sign Up
            </Text>
          </TouchableOpacity>

          {/* Login link */}
          <View className="flex-row justify-center mb-10">
            <Text className="text-gray-600">Already have an account? </Text>
              <Link href="/" asChild>
                <TouchableOpacity>
                  <Text className="text-blue-600 font-semibold">
                    Login
                  </Text>
                </TouchableOpacity>
              </Link>

          </View>
          
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
    
    
  );
}
