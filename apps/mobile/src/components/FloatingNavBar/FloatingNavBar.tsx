import React from 'react';
import {
  View,
  TouchableOpacity,
  Animated,
  Text,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import styles from './FloatingNavBar.styles';

interface TabConfig {
  name: string;
  icon: keyof typeof Feather.glyphMap;
  isCenter?: boolean;
  badge?: number;
  label?: string;
}

interface FloatingNavBarProps extends BottomTabBarProps {
  tabs: TabConfig[];
  isHost?: boolean;
}

function TabIcon({
  name,
  isActive,
}: {
  name: keyof typeof Feather.glyphMap;
  isActive: boolean;
}) {
  const scaleAnim = React.useRef(
    new Animated.Value(1)
  ).current;

  React.useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isActive ? 1.08 : 1,
      useNativeDriver: true,
      damping: 12,
      stiffness: 180,
    }).start();
  }, [isActive]);

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        alignItems: 'center',
      }}
    >
      <View style={[
        styles.iconWrapper,
        isActive && styles.activeCircle,
      ]}>
        <Feather
          name={name}
          size={20}
          color={isActive ? '#6FCF97' : 'rgba(255,255,255,0.5)'}
        />
      </View>
      {isActive && <View style={styles.dot} />}
    </Animated.View>
  );
}

export default function FloatingNavBar({
  state,
  navigation,
  tabs,
  isHost,
}: FloatingNavBarProps) {

  const handlePress = (
    routeName: string,
    isCenter?: boolean
  ) => {
    if (isCenter) {
      Haptics.impactAsync(
        Haptics.ImpactFeedbackStyle.Medium
      );
    } else {
      Haptics.selectionAsync();
    }

    // Check if the route is defined in the current tab navigator
    const route = state.routes.find(r => r.name === routeName);

    if (route) {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });

      if (event.defaultPrevented) {
        return;
      }
    }

    // Navigate to the target route. If it's a parent stack screen (e.g. PlanStep1),
    // we use the parent stack navigator to push it full screen.
    if (isCenter) {
      const parentNav = navigation.getParent() || navigation;
      parentNav.navigate(routeName);
    } else {
      navigation.navigate(routeName);
    }
  };

  // Split tabs: everything before the
  // center item goes left, everything 
  // after goes right
  const centerIndex = tabs.findIndex(
    t => t.isCenter
  );
  const leftTabs = tabs.slice(0, centerIndex);
  const rightTabs = tabs.slice(centerIndex + 1);
  const centerTab = tabs[centerIndex];

  const renderTab = (tab: TabConfig) => {
    // Find the matching route in the active tab navigator state
    const route = state.routes.find(r => r.name === tab.name);
    const isActive = route ? state.index === state.routes.indexOf(route) : false;

    return (
      <TouchableOpacity
        key={tab.name}
        style={styles.tabItem}
        onPress={() => handlePress(tab.name, false)}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <TabIcon
            name={tab.icon}
            isActive={isActive}
          />
          {tab.badge && tab.badge > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {tab.badge > 9 ? '9+' : tab.badge}
              </Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  const renderHostTab = (tab: TabConfig) => {
    const route = state.routes.find((r) => r.name === tab.name);
    const isActive = route ? state.index === state.routes.indexOf(route) : false;
    const activeColor = '#1A6B5A';
    const inactiveColor = '#6B7370';

    return (
      <TouchableOpacity
        key={tab.name}
        style={styles.hostTabItem}
        onPress={() => handlePress(tab.name, false)}
        activeOpacity={0.7}
      >
        <View style={styles.hostIconContainer}>
          <Feather
            name={tab.icon}
            size={22}
            color={isActive ? activeColor : inactiveColor}
          />
          {tab.badge && tab.badge > 0 ? (
            <View style={styles.hostBadge}>
              <Text style={styles.hostBadgeText}>
                {tab.badge > 9 ? '9+' : tab.badge}
              </Text>
            </View>
          ) : null}
        </View>
        <Text style={[styles.hostTabLabel, { color: isActive ? activeColor : inactiveColor }]}>
          {tab.label || tab.name.replace('Host', '')}
        </Text>
        {isActive && <View style={styles.hostDot} />}
      </TouchableOpacity>
    );
  };

  if (isHost) {
    return (
      <View style={styles.hostContainer}>
        <View style={styles.hostSideGroup}>
          {leftTabs.map((tab) => renderHostTab(tab))}
        </View>
        
        {/* Center Floating Button */}
        {centerTab && (
          <TouchableOpacity
            style={styles.hostCenterWrapper}
            onPress={() => handlePress(centerTab.name, true)}
            activeOpacity={0.85}
          >
            <View style={styles.hostCenterButton}>
              <Feather name={centerTab.icon} size={24} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.hostSideGroup}>
          {rightTabs.map((tab) => renderHostTab(tab))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#05201B', '#0A3A31']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.sideGroup}>
          {leftTabs.map((tab) => 
            renderTab(tab)
          )}
        </View>

        <View style={styles.sideGroup}>
          {rightTabs.map((tab) => 
            renderTab(tab)
          )}
        </View>
      </LinearGradient>

      {/* Center button rendered OUTSIDE 
          gradient flow, absolutely 
          positioned over container */}
      {centerTab && (
        <TouchableOpacity
          style={styles.centerWrapper}
          onPress={() => handlePress(
            centerTab.name, 
            true
          )}
          activeOpacity={0.85}
        >
          <View style={styles.centerButton}>
            <Feather
              name={centerTab.icon}
              size={26}
              color="#FFFFFF"
            />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}
