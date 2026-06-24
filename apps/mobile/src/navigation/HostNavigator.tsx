import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import HostDashboardScreen from '../features/host/dashboard/HostDashboardScreen';
import HostBookingsScreen from '../features/host/bookings/HostBookingsScreen';
import HostMessagesScreen from '../features/host/messages/HostMessagesScreen';
import HostProfileScreen from '../features/host/profile/HostProfileScreen';
import FloatingNavBar from '../components/FloatingNavBar/FloatingNavBar';
import { RootStackParamList } from './RootNavigator';
import * as SecureStore from 'expo-secure-store';
import { apiService } from '../services/api';

export type HostTabParamList = {
  HostDashboard: undefined;
  HostBookings: undefined;
  HostListProperty: undefined;
  HostMessages: undefined;
  HostProfile: undefined;
};

const Tab = createBottomTabNavigator<HostTabParamList>();

const ListPlaceholder = () => (
  <View style={localStyles.container}>
    <Text>Listing flow trigger</Text>
  </View>
);

function useUnreadCount(role: 'guest' | 'host') {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const token = await SecureStore.getItemAsync('access_token');
        if (!token) return;
        const conversations = await apiService.get<{ unreadCount: number }[]>(
          `/conversations?role=${role}`,
          token
        );
        const total = (conversations ?? []).reduce(
          (sum, c) => sum + (c.unreadCount ?? 0),
          0
        );
        setCount(total);
      } catch {
        // silent fail, keep previous count
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 10000);
    return () => clearInterval(interval);
  }, [role]);

  return count;
}

export default function HostNavigator() {
  const rootNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const unreadCount = useUnreadCount('host');

  return (
    <Tab.Navigator
      tabBar={(props) => (
        <FloatingNavBar
          {...props}
          tabs={[
            { name: 'HostDashboard', icon: 'home' },
            { name: 'HostBookings', icon: 'calendar' },
            { name: 'HostListProperty', icon: 'plus', isCenter: true },
            { name: 'HostMessages', icon: 'message-circle', badge: unreadCount },
            { name: 'HostProfile', icon: 'user' },
          ]}
        />
      )}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="HostDashboard" component={HostDashboardScreen} />
      <Tab.Screen name="HostBookings" component={HostBookingsScreen} />
      <Tab.Screen
        name="HostListProperty"
        component={ListPlaceholder}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            rootNavigation.navigate('HostList1');
          },
        }}
      />
      <Tab.Screen name="HostMessages" component={HostMessagesScreen} />
      <Tab.Screen name="HostProfile" component={HostProfileScreen} />
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
});
