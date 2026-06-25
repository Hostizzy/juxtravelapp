import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/RootNavigator';
import i18n from '../../../locales/i18n';
import styles from './ListStep4Screen.styles';

type ActivityType = 'Cooking Class' | 'Surfing' | 'Farm Visit' | 'Yoga Retreat';

type ListStep4RouteProp = RouteProp<RootStackParamList, 'HostList4'>;

export default function ListStep4Screen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<ListStep4RouteProp>();
  const step3Data = route.params;

  // States
  const [selectedActivities, setSelectedActivities] = useState<ActivityType[]>(['Cooking Class', 'Farm Visit']);
  const [generatedStory, setGeneratedStory] = useState<string>(
    'Wake up to the sounds of nature. As your host, I will curate an organic farm breakfast for you, followed by a quiet forest walk through our private woods. Spend your afternoon reading by the stone fireplace...'
  );

  const activities: ActivityType[] = ['Cooking Class', 'Surfing', 'Farm Visit', 'Yoga Retreat'];

  const handleBack = () => {
    navigation.goBack();
  };

  const handleContinue = () => {
    navigation.navigate('HostList5', {
      ...step3Data,
      activities: selectedActivities,
      hostStory: generatedStory,
    });
  };

  const toggleActivity = (act: ActivityType) => {
    setSelectedActivities((prev) =>
      prev.includes(act) ? prev.filter((a) => a !== act) : [...prev, act]
    );
  };

  const handleUpdateTimeSlot = () => {
    Alert.alert('Timeline Scheduler', 'Time slot editor coming soon!');
  };

  const handleGenerateStory = () => {
    Alert.alert('AI Storyteller', 'Re-generating listing story with AI...');
    setGeneratedStory(
      'A beautiful heritage escape. Enjoy freshly cooked native delicacies, learn organic farming, and discover hidden valley viewpoints led by locals. Perfect for families looking to reconnect.'
    );
  };

  const handleVoiceRecord = () => {
    Alert.alert('Voice Storyteller', 'Voice recording module initialized! Speak into your microphone...');
  };

  const stepNumber = 4;
  const totalSteps = 5;
  const percentComplete = Math.round((stepNumber / totalSteps) * 100);

  return (
    <View style={styles.root}>
      {/* Dark Image Background Header */}
      <View style={styles.headerWrapper}>
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800' }}
          style={styles.headerBgImage}
          resizeMode="cover"
        >
          <View style={styles.headerOverlay} />
          <SafeAreaView style={styles.headerContent} edges={['top']}>
            <View style={styles.headerTopRow}>
              <TouchableOpacity style={styles.backBtnCircle} onPress={handleBack} activeOpacity={0.7}>
                <Feather name="arrow-left" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.stepText}>STEP {stepNumber} OF {totalSteps}</Text>
              <Text style={styles.percentText}>{percentComplete}% COMPLETE</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBarFilled, { width: `${percentComplete}%` }]} />
            </View>
          </SafeAreaView>
        </ImageBackground>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{i18n.t('host.listProperty.experiencesTitle') || 'Highlight the guest experience'}</Text>
        <Text style={styles.subtitle}>{i18n.t('host.listProperty.experiencesSub') || 'Add local activities and details to welcome your guests.'}</Text>

        {/* ACTIVITIES */}
        <Text style={styles.sectionLabel}>{i18n.t('host.listProperty.activities') || 'ACTIVITIES'}</Text>
        <View style={styles.chipsWrap}>
          {activities.map((act) => (
            <TouchableOpacity
              key={act}
              style={[
                styles.chip,
                selectedActivities.includes(act) ? styles.chipSelected : styles.chipUnselected,
              ]}
              onPress={() => toggleActivity(act)}
              activeOpacity={0.8}
            >
              <Text
                style={
                  selectedActivities.includes(act)
                    ? styles.chipTextSelected
                    : styles.chipTextUnselected
                }
              >
                {act}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* A DAY HERE */}
        <Text style={styles.sectionLabel}>{i18n.t('host.listProperty.dayHere') || 'A DAY HERE'}</Text>
        
        <View style={styles.timelineContainer}>
          {/* Timeline Item 1 */}
          <View style={styles.timelineRow}>
            <View style={styles.timeCol}>
              <Text style={styles.timeText}>08:30 AM</Text>
            </View>
            <View style={styles.timelineLineCol}>
              <View style={styles.timelineDot} />
              <View style={styles.timelineVerticalLine} />
            </View>
            <View style={styles.descCol}>
              <Text style={styles.descText}>Artisan farm-to-table breakfast served on the porch</Text>
            </View>
          </View>

          {/* Timeline Item 2 */}
          <View style={styles.timelineRow}>
            <View style={styles.timeCol}>
              <Text style={styles.timeText}>11:30 AM</Text>
            </View>
            <View style={styles.timelineLineCol}>
              <View style={styles.timelineDot} />
              <View style={[styles.timelineVerticalLine, { opacity: 0 }]} />
            </View>
            <View style={styles.descCol}>
              <Text style={styles.descText}>Guided forest walk to the hidden waterfall viewpoint</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.addTimeSlotBtn} onPress={handleUpdateTimeSlot} activeOpacity={0.8}>
            <Text style={styles.addTimeSlotText}>+ {i18n.t('host.listProperty.addTimeSlot') || 'Add Time Slot'}</Text>
          </TouchableOpacity>
        </View>

        {/* HOST STORY WITH AI */}
        <View style={styles.aiStoryHeader}>
          <Text style={styles.aiLabel}>{i18n.t('host.listProperty.aiStory') || 'HOST STORY'}</Text>
          <MaterialCommunityIcons name="creation" size={14} color="#D4704A" />
        </View>

        <View style={styles.storyTextArea}>
          <Text style={styles.storyText}>"{generatedStory}"</Text>
        </View>

        <TouchableOpacity style={styles.updateStoryBtn} onPress={handleGenerateStory} activeOpacity={0.8}>
          <Text style={styles.updateStoryText}>{i18n.t('host.listProperty.updateStory') || 'Update Story'}</Text>
        </TouchableOpacity>

        {/* VOICE STORYTELLER */}
        <Text style={styles.voiceLabel}>{i18n.t('host.listProperty.voiceStoryteller') || 'Voice Storyteller'}</Text>
        <Text style={styles.voiceSub}>{i18n.t('host.listProperty.voiceStorySubtitle') || 'Tell your story and let AI write a beautiful description for your home.'}</Text>

        <TouchableOpacity style={styles.startWritingBtn} onPress={handleVoiceRecord} activeOpacity={0.8}>
          <Text style={styles.startWritingText}>🎙️ {i18n.t('host.listProperty.startWriting') || 'Record voice'}</Text>
        </TouchableOpacity>

        <View style={styles.previewPlaceholder}>
          <Feather name="image" size={32} color="#84C9BA" />
        </View>

        {/* BOTTOM NAV ROWS */}
        <View style={styles.bottomRow}>
          <TouchableOpacity style={styles.outlineBtn} onPress={handleBack} activeOpacity={0.8}>
            <Text style={styles.outlineBtnText}>{i18n.t('host.listProperty.back') || 'Back'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.continueBtn} onPress={handleContinue} activeOpacity={0.8}>
            <Text style={styles.continueBtnText}>{i18n.t('host.listProperty.continue') || 'Continue'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
