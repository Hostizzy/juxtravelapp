import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { onAuthStateChanged } from 'firebase/auth';
import RootNavigator from './src/navigation/RootNavigator';
import { auth } from './src/services/firebase';

export default function App() {
  useEffect(() => {
    const subscriber = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User logged in
        console.log('User:', user.email);
      }
    });
    return subscriber; // unsubscribe on unmount
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}