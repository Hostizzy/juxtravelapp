import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import HomeScreen from '../features/home/HomeScreen';
import DiscoverScreen from '../features/discover/DiscoverScreen';
import ProfileScreen from '../features/profile/ProfileScreen';
import { RootStackParamList } from './RootNavigator';

export type GuestTabParamList = {
  Home: undefined;
  Discover: undefined;
  Plan: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<GuestTabParamList>();



const PlanPlaceholder = () => (
  <View style={localStyles.container}>
    <Text style={localStyles.text}>Plan Screen</Text>
  </View>
);



export default function GuestNavigator() {
  const rootNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1A6B5A',
        tabBarInactiveTintColor: '#6B7370',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Feather name="home" size={size} color={color} />
          ),
          tabBarActiveTintColor: '#84C9BA',
          tabBarInactiveTintColor: '#6B7370',
          tabBarStyle: {
            backgroundColor: '#0F1714',
            borderTopColor: '#1E2522',
            borderTopWidth: 1,
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
        }}
      />
      <Tab.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Feather name="compass" size={size} color={color} />
          ),
          tabBarActiveTintColor: '#84C9BA',
          tabBarInactiveTintColor: '#6B7370',
          tabBarStyle: {
            backgroundColor: '#0F1714',
            borderTopColor: '#1E2522',
            borderTopWidth: 1,
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
        }}
      />
      <Tab.Screen
        name="Plan"
        component={PlanPlaceholder}
        options={{
          tabBarIcon: () => (
            <View style={localStyles.planButton}>
              <Feather name="plus" size={24} color="#FFFFFF" />
            </View>
          ),
          tabBarLabel: () => null,
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            rootNavigation.navigate('PlanStep1');
          },
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Feather name="user" size={size} color={color} />
          ),
          tabBarActiveTintColor: '#1A6B5A',
          tabBarInactiveTintColor: '#6B7370',
          tabBarStyle: {
            backgroundColor: '#FAF8F4',
            borderTopColor: '#E8E2D9',
            borderTopWidth: 1,
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
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
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  planButton: {
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

