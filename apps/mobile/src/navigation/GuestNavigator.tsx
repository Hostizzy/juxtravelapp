import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../features/home/HomeScreen';
import DiscoverScreen from '../features/discover/DiscoverScreen';
import MessagesScreen from '../features/messages/MessagesScreen';
import ProfileScreen from '../features/profile/ProfileScreen';
import FloatingNavBar from '../components/FloatingNavBar/FloatingNavBar';

export type GuestTabParamList = {
  Home: undefined;
  Discover: undefined;
  Messages: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<GuestTabParamList>();

export default function GuestNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => (
        <FloatingNavBar
          {...props}
          tabs={[
            { name: 'Home', icon: 'home' },
            { name: 'Discover', icon: 'compass' },
            { name: 'PlanStep1', icon: 'plus', isCenter: true },
            { name: 'Messages', icon: 'message-circle', badge: 3 },
            { name: 'Profile', icon: 'user' },
          ]}
        />
      )}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
