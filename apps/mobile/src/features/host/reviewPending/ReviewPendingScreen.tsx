import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/RootNavigator';
import i18n from '../../../locales/i18n';
import styles from './ReviewPendingScreen.styles';

export default function ReviewPendingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleGoDashboard = () => {
    navigation.replace('HostApp' as any);
  };

  const handleEditProperty = () => {
    Alert.alert('Edit Listing', 'Loading listing drafts to edit...');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        {/* Top Header Label */}
        <Text style={styles.topBrand}>JuxTravel Host</Text>

        {/* Celebration Box */}
        <View style={styles.celebrationBox}>
          <MaterialCommunityIcons name="party-popper" size={64} color="#D4704A" />
        </View>

        <Text style={styles.title}>{i18n.t('host.reviewPending.title')}</Text>
        <Text style={styles.subtitle}>{i18n.t('host.reviewPending.sub')}</Text>

        {/* Horizontal Progress steps */}
        <View style={styles.stepsWrapper}>
          {/* Step 1: Submitted */}
          <View style={styles.stepContainer}>
            <View style={styles.stepCircleFilled}>
              <Feather name="check" size={12} color="#FFFFFF" />
            </View>
            <Text style={[styles.stepLabel, styles.stepLabelCompleted]}>
              {i18n.t('host.reviewPending.submitted')}
            </Text>
          </View>

          {/* Line 1 */}
          <View style={[styles.stepLine, styles.stepLineActive]} />

          {/* Step 2: In Review */}
          <View style={styles.stepContainer}>
            <View style={styles.stepCircleActive}>
              <Feather name="loader" size={12} color="#FFFFFF" />
            </View>
            <Text style={[styles.stepLabel, styles.stepLabelActive]}>
              {i18n.t('host.reviewPending.inReview')}
            </Text>
          </View>

          {/* Line 2 */}
          <View style={styles.stepLine} />

          {/* Step 3: Active */}
          <View style={styles.stepContainer}>
            <View style={styles.stepCircleInactive} />
            <Text style={styles.stepLabel}>
              {i18n.t('host.reviewPending.active')}
            </Text>
          </View>
        </View>

        {/* Property Preview Card */}
        <View style={styles.previewCard}>
          <View style={styles.previewImgPlaceholder}>
            <Feather name="image" size={24} color="#84C9BA" />
          </View>
          <View style={styles.previewDetails}>
            <Text style={styles.previewName}>Whispering Oaks Cabin</Text>
            <View style={styles.reviewChip}>
              <Text style={styles.reviewChipText}>{i18n.t('host.reviewPending.underReview')}</Text>
            </View>
          </View>
        </View>

        {/* Go to Dashboard button */}
        <TouchableOpacity style={styles.button} onPress={handleGoDashboard} activeOpacity={0.8}>
          <Text style={styles.buttonText}>{i18n.t('host.reviewPending.goDashboard')}</Text>
        </TouchableOpacity>

        {/* Edit Property */}
        <TouchableOpacity onPress={handleEditProperty}>
          <Text style={styles.editBtnText}>{i18n.t('host.reviewPending.editProperty')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
