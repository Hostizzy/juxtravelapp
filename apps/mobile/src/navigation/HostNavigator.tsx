import React from 'react';
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
import { useConversations } from '../hooks/useConversations';

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

export default function HostNavigator() {
  const rootNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { data: conversations = [] } = useConversations('host');
  const unreadCount = conversations.reduce(
    (sum, c) => sum + (c.unreadCount ?? 0),
    0
  );

  return (
    <Tab.Navigator
      tabBar={(props) => (
        <FloatingNavBar
          {...props}
          isHost={true}
          tabs={[
            { name: 'HostDashboard', icon: 'home', label: 'Home' },
            { name: 'HostBookings', icon: 'calendar', label: 'Bookings' },
            { name: 'HostListProperty', icon: 'plus', isCenter: true },
            { name: 'HostMessages', icon: 'message-circle', badge: unreadCount, label: 'Messages' },
            { name: 'HostProfile', icon: 'user', label: 'Profile' },
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
