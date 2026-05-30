import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import HostDashboardScreen from '../features/host/dashboard/HostDashboardScreen';
import HostBookingsScreen from '../features/host/bookings/HostBookingsScreen';
import HostProfileScreen from '../features/host/profile/HostProfileScreen';
import { RootStackParamList } from './RootNavigator';
import i18n from '../locales/i18n';

export type HostTabParamList = {
  Home: undefined;
  Bookings: undefined;
  AddListing: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<HostTabParamList>();

const ListPlaceholder = () => (
  <View style={localStyles.container}>
    <Text>Listing flow trigger</Text>
  </View>
);

export default function HostNavigator() {
  const rootNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#D4704A',
        tabBarInactiveTintColor: '#6B7370',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
        tabBarStyle: {
          backgroundColor: '#0F1714',
          borderTopColor: '#1E2B25',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HostDashboardScreen}
        options={{
          tabBarLabel: i18n.t('home.myTrips'), // fallback or custom label like 'Home'
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />
      
      <Tab.Screen
        name="Bookings"
        component={HostBookingsScreen}
        options={{
          tabBarLabel: i18n.t('host.bookings.title'),
          tabBarIcon: ({ color, size }) => (
            <Feather name="calendar" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="AddListing"
        component={ListPlaceholder}
        options={{
          tabBarIcon: () => (
            <View style={localStyles.plusButton}>
              <Feather name="plus" size={24} color="#FFFFFF" />
            </View>
          ),
          tabBarLabel: () => null,
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            rootNavigation.navigate('HostList1' as any);
          },
        }}
      />

      <Tab.Screen
        name="Profile"
        component={HostProfileScreen}
        options={{
          tabBarLabel: i18n.t('host.profile.tabProfile'),
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF8F4',
  },
  plusButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D4704A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#D4704A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});
