import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GuestNavigator from './GuestNavigator';
import SplashScreen from '../features/auth/splash/SplashScreen';
import LoginScreen from '../features/auth/login/LoginScreen';
import OtpScreen from '../features/auth/otp/OtpScreen';
import PlanStep1Screen from '../features/plan/PlanStep1Screen';
import PlanStep2Screen from '../features/plan/PlanStep2Screen';
import PlanStep3Screen from '../features/plan/PlanStep3Screen';
import PlanStep4Screen from '../features/plan/PlanStep4Screen';

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Otp: { 
    sessionInfo: string; 
    phoneNumber: string; 
    fullName?: string;
  };
  Guest: undefined;
  PlanStep1: undefined;
  PlanStep2: {
    destination: string;
    checkIn: string;
    checkOut: string;
  };
  PlanStep3: {
    destination: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    groupType: string;
  };
  PlanStep4: {
    destination: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    groupType: string;
    moods: string[];
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Auth" component={LoginScreen} />
      <Stack.Screen name="Otp" component={OtpScreen} />
      <Stack.Screen name="Guest" component={GuestNavigator} />
      <Stack.Screen name="PlanStep1" component={PlanStep1Screen} />
      <Stack.Screen name="PlanStep2" component={PlanStep2Screen} />
      <Stack.Screen name="PlanStep3" component={PlanStep3Screen} />
      <Stack.Screen name="PlanStep4" component={PlanStep4Screen} />
    </Stack.Navigator>
  );
}

