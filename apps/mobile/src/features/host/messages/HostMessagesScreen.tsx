import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../../../stores/authStore';
import {
  conversationService,
  ConversationSummary,
} from '../../../services/conversationService';
import { RootStackParamList } from '../../../navigation/RootNavigator';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function HostMessagesScreen() {
  const navigation = useNavigation<NavProp>();
  const { getAccessToken } = useAuthStore();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const token = await getAccessToken();
      if (!token) return;
      const data = await conversationService.getMyConversations(token, 'host');
      setConversations(data);
    } catch (err) {
      console.error('Failed to load host conversations', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getAccessToken]);

  useFocusEffect(
    useCallback(() => {
      void load(conversations.length > 0);
      const interval = setInterval(() => {
        void load(true);
      }, 8000);
      return () => clearInterval(interval);
    }, [load, conversations.length])
  );

  const onRefresh = () => {
    setRefreshing(true);
    void load(true);
  };

  const openChat = (conv: ConversationSummary) => {
    const otherParty = conv.guest?.name ?? 'Guest';
    navigation.navigate('ChatDetail', {
      conversationId: conv.id,
      otherPartyName: otherParty,
      propertyName: conv.property?.name ?? '',
    });
  };

  const renderItem = ({ item }: { item: ConversationSummary }) => {
    const otherName = item.guest?.name ?? 'Guest';
    const propertyName = item.property?.name ?? '';
    const initials = otherName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    return (
      <TouchableOpacity
        style={styles.convRow}
        onPress={() => openChat(item)}
        activeOpacity={0.7}
      >
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.convBody}>
          <View style={styles.convTopRow}>
            <Text style={styles.convName} numberOfLines={1}>{otherName}</Text>
            {item.unreadCount && item.unreadCount > 0 ? (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{item.unreadCount}</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.convSub} numberOfLines={1}>{propertyName}</Text>
          <Text style={styles.convPreview} numberOfLines={1}>
            {item.last_message ? item.last_message : 'Tap to open conversation'}
          </Text>
        </View>
        <Feather name="chevron-right" size={16} color="#C5CCC9" />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerWrapper}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800' }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['#021412', 'rgba(2, 20, 18, 0.9)', 'rgba(2, 20, 18, 0.4)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            locations={[0, 0.35, 0.7, 1]}
            style={StyleSheet.absoluteFillObject}
          />
          <LinearGradient
            colors={['transparent', 'rgba(2, 20, 18, 0.25)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.headerTopRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Feather name="arrow-left" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Guest Messages</Text>
            <View style={{ width: 40 }} />
          </View>
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#D4704A" />
          </View>
        ) : conversations.length === 0 ? (
          <View style={styles.center}>
            <View style={styles.emptyCircle}>
              <Feather name="message-square" size={32} color="#D4704A" />
            </View>
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptySub}>
              When guests book your property, you can chat with them here.
            </Text>
          </View>
        ) : (
          <FlatList
            data={conversations}
            keyExtractor={(c) => c.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#D4704A"
              />
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#021412',
  },
  container: {
    flex: 1,
    backgroundColor: '#FAF8F4',
  },
  headerWrapper: {
    height: Platform.OS === 'ios' ? 110 : 95,
    overflow: 'hidden',
    backgroundColor: '#021412',
  },
  headerTopRow: {
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: 'serif',
    letterSpacing: 0.5,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 100,
  },
  emptyCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FDF2E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1F1E',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 14,
    color: '#6B7370',
    textAlign: 'center',
    lineHeight: 20,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 120,
  },
  convRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FDE8DF',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#D4704A',
  },
  convBody: {
    flex: 1,
    gap: 2,
  },
  convTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  convName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1F1E',
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: '#D4704A',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  convSub: {
    fontSize: 12,
    color: '#6B7370',
    fontWeight: '500',
  },
  convPreview: {
    fontSize: 13,
    color: '#9BA5A1',
    marginTop: 1,
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0EE',
    marginLeft: 80,
  },
});
