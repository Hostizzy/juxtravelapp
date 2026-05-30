import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/RootNavigator';
import i18n from '../../../locales/i18n';
import styles from './ListStep4Screen.styles';

type ActivityType = 'Cooking Class' | 'Surfing' | 'Farm Visit' | 'Yoga Retreat';

export default function ListStep4Screen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

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
    navigation.navigate('HostList5' as any);
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Progress Header */}
      <View style={styles.topBar}>
        <View style={styles.topBarRow}>
          <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.7}>
            <Feather name="arrow-left" size={20} color="#1A1F1E" />
          </TouchableOpacity>
          <Text style={styles.stepIndicator}>STEP 4 OF 5</Text>
          <Text style={styles.percentText}>80% COMPLETE</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarFilled, { width: '80%' }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{i18n.t('host.listProperty.experiencesTitle')}</Text>
        <Text style={styles.subtitle}>{i18n.t('host.listProperty.experiencesSub')}</Text>

        {/* ACTIVITIES */}
        <Text style={styles.sectionLabel}>{i18n.t('host.listProperty.activities')}</Text>
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
        <Text style={styles.sectionLabel}>{i18n.t('host.listProperty.dayHere')}</Text>
        
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
              <View style={[styles.timelineVerticalLine, { opacity: 0 }]} /> {/* hidden line for last item */}
            </View>
            <View style={styles.descCol}>
              <Text style={styles.descText}>Guided forest walk to the hidden waterfall viewpoint</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.addTimeSlotBtn} onPress={handleUpdateTimeSlot} activeOpacity={0.8}>
            <Text style={styles.addTimeSlotText}>+ {i18n.t('host.listProperty.addTimeSlot')}</Text>
          </TouchableOpacity>
        </View>

        {/* HOST STORY WITH AI */}
        <View style={styles.aiStoryHeader}>
          <Text style={styles.aiLabel}>{i18n.t('host.listProperty.aiStory')}</Text>
          <MaterialCommunityIcons name="creation" size={14} color="#D4704A" />
        </View>

        <View style={styles.storyTextArea}>
          <Text style={styles.storyText}>"{generatedStory}"</Text>
        </View>

        <TouchableOpacity style={styles.updateStoryBtn} onPress={handleGenerateStory} activeOpacity={0.8}>
          <Text style={styles.updateStoryText}>{i18n.t('host.listProperty.updateStory')}</Text>
        </TouchableOpacity>

        {/* VOICE STORYTELLER */}
        <Text style={styles.voiceLabel}>{i18n.t('host.listProperty.voiceStoryteller')}</Text>
        <Text style={styles.voiceSub}>{i18n.t('host.listProperty.voiceStorySubtitle')}</Text>

        <TouchableOpacity style={styles.startWritingBtn} onPress={handleVoiceRecord} activeOpacity={0.8}>
          <Text style={styles.startWritingText}>🎙️ {i18n.t('host.listProperty.startWriting')}</Text>
        </TouchableOpacity>

        <View style={styles.previewPlaceholder}>
          <Feather name="image" size={32} color="#84C9BA" />
        </View>

        {/* BOTTOM NAV ROWS */}
        <View style={styles.bottomRow}>
          <TouchableOpacity style={styles.outlineBtn} onPress={handleBack} activeOpacity={0.8}>
            <Text style={styles.outlineBtnText}>{i18n.t('host.listProperty.back')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.continueBtn} onPress={handleContinue} activeOpacity={0.8}>
            <Text style={styles.continueBtnText}>{i18n.t('host.listProperty.continue')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
