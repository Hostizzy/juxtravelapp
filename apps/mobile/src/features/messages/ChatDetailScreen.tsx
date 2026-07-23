import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ImageBackground,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useQueryClient } from '@tanstack/react-query';
import { apiPost } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
import {
  useMessages,
  useSendMessage,
  Message,
} from '../../hooks/useConversations';
import { RootStackParamList } from '../../navigation/RootNavigator';

type ChatDetailRouteProp = RouteProp<RootStackParamList, 'ChatDetail'>;

function formatBubbleTime(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<ChatDetailRouteProp>();
  const { conversationId, otherPartyName, propertyName } = route.params;
  const { user } = useAuthStore();
  const role = (user?.role === 'host' || user?.role === 'both') ? 'host' : 'guest';

  const { data: messages = [], isLoading: isInitialLoading } = useMessages(conversationId, role);
  const sendMessageMutation = useSendMessage(conversationId, role);
  const sending = sendMessageMutation.isPending;
  const [draft, setDraft] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const queryClient = useQueryClient();

  // Mark messages as read when chat opens or new messages arrive
  useEffect(() => {
    if (!conversationId) return;
    
    const markAsRead = async () => {
      try {
        await apiPost(`/conversations/${conversationId}/mark-read`, {});
        
        // Invalidate ALL conversation queries (guest + host variants)
        await queryClient.invalidateQueries({ 
          queryKey: ['conversations'],
          refetchType: 'active', // Force immediate refetch of active queries
        });
        
        // Also refetch current messages to update read_by_guest/host flags
        await queryClient.invalidateQueries({
          queryKey: ['conversations', 'messages', conversationId],
          refetchType: 'active',
        });
      } catch (error) {
        console.log('[CHAT] Mark as read failed:', error);
      }
    };
    
    // Initial mark on chat open
    markAsRead();
  }, [conversationId]);

  // Also mark as read when new messages come while chat is open
  useEffect(() => {
    if (!conversationId || messages.length === 0) return;
    
    // Check if any unread messages from other party
    const hasUnread = messages.some(m => {
      const isFromMe = m.sender_id === user?.id;
      if (isFromMe) return false;
      // Check if not yet read
      const readField = role === 'guest' ? m.read_by_guest : m.read_by_host;
      return !readField;
    });
    
    if (!hasUnread) return;
    
    const timer = setTimeout(async () => {
      try {
        await apiPost(`/conversations/${conversationId}/mark-read`, {});
        queryClient.invalidateQueries({ 
          queryKey: ['conversations'],
          refetchType: 'active',
        });
        queryClient.invalidateQueries({
          queryKey: ['conversations', 'messages', conversationId],
          refetchType: 'active',
        });
      } catch (error) {
        // Silent
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [messages.length, conversationId, role, user?.id]);

  const scrollToBottom = () => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: false });
    }
  };

  useEffect(() => {
    if (!isInitialLoading) {
      setTimeout(scrollToBottom, 100);
    }
  }, [isInitialLoading, messages.length]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    setDraft('');
    try {
      await sendMessageMutation.mutateAsync(text);
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error('Failed to send message', err);
      Alert.alert('Error', 'Could not send message. Please try again.');
      setDraft(text);
    }
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isMe = item.sender_id === user?.id;
    const isAdmin = item.sender_type === 'admin';
    const isSystem = item.sender_type === 'system';

    const showSenderName =
      !isMe &&
      (index === 0 || messages[index - 1].sender_id !== item.sender_id || messages[index - 1].sender_type !== item.sender_type);

    const displayName = isAdmin 
      ? 'JuxTravel Support' 
      : (isSystem ? 'System' : (item.sender?.name ?? otherPartyName));

    const initials = (isAdmin ? 'JT' : (isSystem ? 'SYS' : displayName))
      .split(' ')
      .map((w: string) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    return (
      <View style={[
        styles.bubbleRow, 
        isMe ? styles.bubbleRowRight : styles.bubbleRowLeft
      ]}>
        {!isMe && !isAdmin && !isSystem && (
          <View style={styles.avatarSmall}>
            <Text style={styles.avatarSmallText}>{initials}</Text>
          </View>
        )}
        <View style={[
          styles.bubble, 
          isMe 
            ? styles.bubbleMe 
            : (isAdmin 
                ? styles.bubbleAdmin 
                : (isSystem ? styles.bubbleSystem : styles.bubbleThem))
        ]}>
          {isAdmin && (
            <Text style={styles.adminLabel}>
              JuxTravel Support
            </Text>
          )}
          {showSenderName && !isAdmin && (
            <Text style={styles.senderName}>
              {displayName}
            </Text>
          )}
          <Text style={[
            styles.bubbleText, 
            isMe ? styles.bubbleTextMe : styles.bubbleTextThem
          ]}>
            {item.content}
          </Text>
          <Text style={[
            styles.bubbleTime, 
            isMe ? styles.bubbleTimeMe : styles.bubbleTimeThem
          ]}>
            {formatBubbleTime(item.created_at)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <View style={styles.container}>
        {/* Header - stays fixed, NEVER moves */}
        <View style={styles.headerWrapper}>
          <ImageBackground
            source={{ uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800' }}
            style={styles.headerImage}
            resizeMode="cover"
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.35)', 'rgba(0,0,0,0.65)']}
              style={styles.headerOverlay}
            >
              <View style={styles.topBarContent}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => navigation.goBack()}
                  activeOpacity={0.7}
                >
                  <Feather name="arrow-left" size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <View style={styles.topBarInfo}>
                  <Text style={styles.topBarName}>{otherPartyName}</Text>
                  {propertyName ? (
                    <Text style={styles.topBarProperty} numberOfLines={1}>{propertyName}</Text>
                  ) : null}
                </View>
                <View style={{ width: 40 }} />
              </View>
            </LinearGradient>
          </ImageBackground>
        </View>

        {isInitialLoading && messages.length === 0 ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#1A6B5A" />
          </View>
        ) : (
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={0}
          >
            {/* Message list - shrinks naturally as KeyboardAvoidingView resizes this container */}
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(m) => m.id}
              renderItem={renderMessage}
              contentContainerStyle={styles.messagesList}
              onContentSizeChange={scrollToBottom}
              showsVerticalScrollIndicator={false}
              style={{ flex: 1 }}
            />

            {/* Input bar - rises with keyboard */}
            <View style={styles.inputBar}>
              <TextInput
                style={styles.textInput}
                value={draft}
                onChangeText={setDraft}
                placeholder="Type a message…"
                placeholderTextColor="#9BA5A1"
                multiline
                maxLength={2000}
                returnKeyType="default"
              />
              <TouchableOpacity
                style={[styles.sendBtn, (!draft.trim() || sending) && styles.sendBtnDisabled]}
                onPress={handleSend}
                disabled={!draft.trim() || sending}
                activeOpacity={0.8}
              >
                {sending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Feather name="send" size={18} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        )}
      </View>
    </View>
  );
}

const TEAL = '#1A6B5A';
const BG = '#FAF8F4';

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  headerWrapper: {
    height: Platform.OS === 'ios' ? 130 : 115,
    overflow: 'hidden',
    backgroundColor: '#021412',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    flex: 1,
    justifyContent: 'center',
  },
  topBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 52 : 36,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarInfo: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 12,
  },
  topBarName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  topBarProperty: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 2,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 8,
  },
  systemBubble: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: '#EEF0EF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginVertical: 6,
    alignItems: 'center',
    maxWidth: '85%',
  },
  systemText: {
    fontSize: 12,
    color: '#6B7370',
    textAlign: 'center',
    flex: 1,
    lineHeight: 17,
  },
  bubbleRow: {
    flexDirection: 'row',
    marginVertical: 3,
    gap: 8,
    alignItems: 'flex-end',
  },
  bubbleRowRight: {
    justifyContent: 'flex-end',
  },
  bubbleRowLeft: {
    justifyContent: 'flex-start',
  },
  bubbleRowCenter: {
    justifyContent: 'center',
  },
  avatarSmall: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#D1EAE4',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    marginBottom: 2,
  },
  avatarSmallText: {
    fontSize: 11,
    fontWeight: '700',
    color: TEAL,
  },
  bubble: {
    maxWidth: '75%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  bubbleMe: {
    backgroundColor: TEAL,
    borderBottomRightRadius: 4,
  },
  bubbleThem: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  bubbleAdmin: {
    backgroundColor: '#FDF2E9',
    borderWidth: 1,
    borderColor: '#F0D9C5',
    borderBottomLeftRadius: 4,
  },
  bubbleSystem: {
    backgroundColor: '#EEF0EF',
    borderBottomLeftRadius: 4,
  },
  adminLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D4704A',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  senderName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9BA5A1',
    marginBottom: 3,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  bubbleTextMe: {
    color: '#FFFFFF',
  },
  bubbleTextThem: {
    color: '#1A1F1E',
  },
  bubbleTime: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right',
  },
  bubbleTimeMe: {
    color: 'rgba(255,255,255,0.6)',
  },
  bubbleTimeThem: {
    color: '#9BA5A1',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EDECEA',
    gap: 10,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderWidth: 1.5,
    borderColor: '#D8DBD9',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1A1F1E',
    backgroundColor: '#F7F8F7',
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: TEAL,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  sendBtnDisabled: {
    backgroundColor: '#B0C8C2',
  },
});
