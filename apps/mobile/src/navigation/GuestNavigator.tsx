import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../features/home/HomeScreen';
import DiscoverScreen from '../features/discover/DiscoverScreen';
import MessagesScreen from '../features/messages/MessagesScreen';
import ProfileScreen from '../features/profile/ProfileScreen';
import FloatingNavBar from '../components/FloatingNavBar/FloatingNavBar';
import * as SecureStore from 'expo-secure-store';
import { apiService } from '../services/api';

export type GuestTabParamList = {
  Home: undefined;
  Discover: undefined;
  Messages: undefined;
  Profile: { activeTab?: 'trips' | 'saved' | 'how' | 'settings' } | undefined;
};

const Tab = createBottomTabNavigator<GuestTabParamList>();

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

export default function GuestNavigator() {
  const unreadCount = useUnreadCount('guest');

  return (
    <Tab.Navigator
      tabBar={(props) => (
        <FloatingNavBar
          {...props}
          tabs={[
            { name: 'Home', icon: 'home' },
            { name: 'Discover', icon: 'compass' },
            { name: 'PlanStep1', icon: 'plus', isCenter: true },
            { name: 'Messages', icon: 'message-circle', badge: unreadCount },
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
