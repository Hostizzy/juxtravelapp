import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/RootNavigator';
import i18n from '../../../locales/i18n';
import styles from './HostWelcomeScreen.styles';

export default function HostWelcomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleGoToDashboard = () => {
    // Navigate and replace with the Host Navigator stack
    navigation.replace('HostApp' as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        {/* Top Brand Tagline */}
        <View style={styles.topBrand}>
          <MaterialCommunityIcons name="leaf" size={18} color="#84C9BA" />
          <Text style={styles.topBrandText}>{i18n.t('host.welcome.tagline')}</Text>
        </View>

        {/* Big Checkmark Circle */}
        <View style={styles.checkmarkCircle}>
          <Feather name="check" size={40} color="#FFFFFF" />
        </View>

        <Text style={styles.title}>{i18n.t('host.welcome.successTitle')}</Text>
        <Text style={styles.subtitle}>{i18n.t('host.welcome.successSub')}</Text>

        {/* Checklist */}
        <View style={styles.checklist}>
          <View style={styles.checkrow}>
            <View style={styles.checkCircle}>
              <Feather name="check" size={12} color="#FFFFFF" />
            </View>
            <Text style={styles.checkText}>{i18n.t('host.welcome.step1')}</Text>
          </View>

          <View style={styles.checkrow}>
            <View style={styles.checkCircle}>
              <Feather name="check" size={12} color="#FFFFFF" />
            </View>
            <Text style={styles.checkText}>{i18n.t('host.welcome.step2')}</Text>
          </View>

          <View style={styles.checkrow}>
            <View style={styles.checkCircle}>
              <Feather name="check" size={12} color="#FFFFFF" />
            </View>
            <Text style={styles.checkText}>{i18n.t('host.welcome.step3')}</Text>
          </View>
        </View>

        {/* Dashboard Button */}
        <TouchableOpacity style={styles.button} onPress={handleGoToDashboard} activeOpacity={0.8}>
          <Text style={styles.buttonText}>{i18n.t('host.welcome.cta')}</Text>
        </TouchableOpacity>

        {/* "I'll do this later" */}
        <TouchableOpacity onPress={handleGoToDashboard}>
          <Text style={styles.laterText}>{i18n.t('host.welcome.later')}</Text>
        </TouchableOpacity>

        {/* Footer info note */}
        <Text style={styles.footerNote}>{i18n.t('host.welcome.footerNote')}</Text>
      </View>
    </SafeAreaView>
  );
}
