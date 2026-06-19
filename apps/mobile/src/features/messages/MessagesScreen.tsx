import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import i18n from '../../locales/i18n';

export default function MessagesScreen() {
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Feather name="message-square" size={32} color="#1A6B5A" />
        </View>
        <Text style={styles.title}>Inbox Coming Soon</Text>
        <Text style={styles.subtitle}>
          Chatting with hosts and real-time support will be available here in a future update.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FAF8F4', // Premium cream background
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E2D9',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1F1E',
    fontFamily: 'serif',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 120,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E6F2EF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1F1E',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7370',
    textAlign: 'center',
    lineHeight: 20,
  },
});
