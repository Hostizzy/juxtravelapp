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
import PlanProcessingScreen from '../features/plan/PlanProcessingScreen';
import MatchResultsScreen from '../features/matches/MatchResultsScreen';
import { MatchResult } from '../services/matchService';

// Host screens
import HostOnboardingScreen from '../features/host/onboarding/HostOnboardingScreen';
import HostVerificationScreen from '../features/host/verification/HostVerificationScreen';
import HostWelcomeScreen from '../features/host/welcome/HostWelcomeScreen';
import HostNavigator from './HostNavigator';
import ListStep1Screen from '../features/host/listProperty/ListStep1Screen';
import ListStep2Screen from '../features/host/listProperty/ListStep2Screen';
import ListStep3Screen from '../features/host/listProperty/ListStep3Screen';
import ListStep4Screen from '../features/host/listProperty/ListStep4Screen';
import ListStep5Screen from '../features/host/listProperty/ListStep5Screen';
import ReviewPendingScreen from '../features/host/reviewPending/ReviewPendingScreen';
import HostPropertyDetailScreen from '../features/host/property/HostPropertyDetailScreen';
import GuestVerificationScreen from '../features/verification/GuestVerificationScreen';
import PaymentScreen from '../features/payment/PaymentScreen';
import InstagramConnectScreen from '../features/host/instagram/InstagramConnectScreen';
import BookingSuccessScreen from '../features/booking/BookingSuccessScreen';
import BookingDetailScreen from '../features/booking/BookingDetailScreen';
import ChatDetailScreen from '../features/messages/ChatDetailScreen';

export type RootStackParamList = {
  Splash: undefined;
  BookingSuccess: {
    bookingId: string;
    propertyName: string;
    checkIn: string;
    checkOut: string;
  };
  BookingDetail: {
    bookingId: string;
  };
  ChatDetail: {
    conversationId: string;
    otherPartyName: string;
    propertyName: string;
  };
  HostPropertyDetail: {
    propertyId: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
  };
  GuestVerification: {
    propertyId: string;
    propertyName: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    totalAmount: number;
  };
  Payment: {
    propertyId: string;
    propertyName: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    totalAmount: number;
    verificationId?: string;
  };
  InstagramConnect: {
    propertyId: string;
    propertyName: string;
  };
  Auth: undefined;
  Otp: { 
    phone: string; 
    name: string; 
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
    bedrooms: number;
  };
  PlanStep4: {
    destination: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    groupType: string;
    moods: string[];
    bedrooms: number;
  };
  PlanProcessing: {
    destination: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    groupType: string;
    moods: string[];
    budget: number;
    freeText?: string;
    bedrooms: number;
  };
  HostOnboarding: undefined;
  HostVerification: undefined;
  HostWelcome: undefined;
  HostList1: undefined;
  HostList2: {
    name: string;
    tagline: string;
    type: string;
    city: string;
    state: string;
    coverPhoto?: string;
  };
  HostList3: {
    name: string;
    tagline: string;
    type: string;
    city: string;
    state: string;
    coverPhoto?: string;
    address: string;
    rooms: number;
    maxGuests: number;
    comfortableGuests: number;
    pricePerNight: number;
    amenities: string[];
    honestNotes: string;
  };
  HostList4: {
    name: string;
    tagline: string;
    type: string;
    city: string;
    state: string;
    coverPhoto?: string;
    address: string;
    rooms: number;
    maxGuests: number;
    comfortableGuests: number;
    pricePerNight: number;
    amenities: string[];
    honestNotes: string;
    photos: string[];
    reels: string[];
  };
  HostList5: {
    name: string;
    tagline: string;
    type: string;
    city: string;
    state: string;
    coverPhoto?: string;
    address: string;
    rooms: number;
    maxGuests: number;
    comfortableGuests: number;
    pricePerNight: number;
    amenities: string[];
    honestNotes: string;
    photos: string[];
    reels: string[];
    activities: string[];
    hostStory: string;
  };
  HostReviewPending: undefined;
  HostApp: undefined;
  MatchResults: {
    destination: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    groupType: string;
    moods: string[];
    budget: number;
    freeText?: string;
    bedrooms: number;
    matches: MatchResult[];
    savedIds: string[];
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
      <Stack.Screen name="PlanProcessing" component={PlanProcessingScreen} />

      {/* Host Flow */}
      <Stack.Screen name="HostOnboarding" component={HostOnboardingScreen} />
      <Stack.Screen name="HostVerification" component={HostVerificationScreen} />
      <Stack.Screen name="HostWelcome" component={HostWelcomeScreen} />
      <Stack.Screen name="HostApp" component={HostNavigator} />
      <Stack.Screen name="HostList1" component={ListStep1Screen} />
      <Stack.Screen name="HostList2" component={ListStep2Screen} />
      <Stack.Screen name="HostList3" component={ListStep3Screen} />
      <Stack.Screen name="HostList4" component={ListStep4Screen} />
      <Stack.Screen name="HostList5" component={ListStep5Screen} />
      <Stack.Screen name="HostReviewPending" component={ReviewPendingScreen} />
      <Stack.Screen name="HostPropertyDetail" component={HostPropertyDetailScreen} />
      <Stack.Screen name="MatchResults" component={MatchResultsScreen} />
      <Stack.Screen name="GuestVerification" component={GuestVerificationScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="InstagramConnect" component={InstagramConnectScreen} />
      <Stack.Screen name="BookingSuccess" component={BookingSuccessScreen} />
      <Stack.Screen name="BookingDetail" component={BookingDetailScreen} />
      <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
    </Stack.Navigator>
  );
}

