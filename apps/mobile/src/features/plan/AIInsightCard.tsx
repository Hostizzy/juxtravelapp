import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { apiPost } from '../../lib/api';

interface AIInsightCardProps {
  step: number;
  destination?: string;
  groupType?: string;
  moods?: string[];
  budget?: number;
  guests?: number;
  bedrooms?: number;
  fallbackText: string;
  debounceMs?: number;
}

// Simple in-memory cache
const insightCache = new Map<string, string>();

const buildCacheKey = (props: Omit<AIInsightCardProps, 'fallbackText' | 'debounceMs'>): string => {
  return JSON.stringify({
    step: props.step,
    destination: props.destination?.toLowerCase().trim(),
    groupType: props.groupType,
    moods: props.moods?.slice().sort(),
    budget: props.budget ? Math.floor(props.budget / 10000) * 10000 : undefined,
    guests: props.guests,
    bedrooms: props.bedrooms,
  });
};

export const AIInsightCard: React.FC<AIInsightCardProps> = (props) => {
  const [insight, setInsight] = useState<string>(props.fallbackText);
  const [loading, setLoading] = useState<boolean>(false);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    // Cancel previous
    if (abortRef.current) abortRef.current.abort();
    if (timerRef.current) clearTimeout(timerRef.current);

    const cacheKey = buildCacheKey({
      step: props.step,
      destination: props.destination,
      groupType: props.groupType,
      moods: props.moods,
      budget: props.budget,
      guests: props.guests,
      bedrooms: props.bedrooms,
    });

    // Check cache first (instant)
    const cachedInsight = insightCache.get(cacheKey);
    if (cachedInsight) {
      setInsight(cachedInsight);
      setLoading(false);
      return;
    }

    // Show fallback while loading (no visible loading indicator)
    setInsight(props.fallbackText);
    setLoading(true);

    // Debounce API call
    timerRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await apiPost<{ text: string; cached: boolean }>(
          '/ai/insight',
          {
            step: props.step,
            destination: props.destination,
            groupType: props.groupType,
            moods: props.moods,
            budget: props.budget,
            guests: props.guests,
            bedrooms: props.bedrooms,
          }
        );

        if (!controller.signal.aborted && response?.text) {
          insightCache.set(cacheKey, response.text);
          setInsight(response.text);
        }
      } catch (error) {
        // Silent fail - keep fallback text
        console.log('[AI Insight] Using fallback');
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, props.debounceMs ?? 500);

    return () => {
      if (abortRef.current) abortRef.current.abort();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [
    props.step,
    props.destination,
    props.groupType,
    JSON.stringify(props.moods),
    props.budget,
    props.guests,
    props.bedrooms,
  ]);

  return (
    <View style={styles.card}>
      <View style={styles.iconCircle}>
        <Feather name="info" size={14} color="#1A6B5A" />
      </View>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>✨ AI Insight</Text>
          {loading && <ActivityIndicator size="small" color="#84C9BA" style={{ marginLeft: 8 }} />}
        </View>
        <Text style={styles.description}>{insight}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E6F2EF',
    borderRadius: 12,
    padding: 12,
    gap: 10,
    marginVertical: 12,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 12,
    fontWeight: '800',
    color: '#84C9BA',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 13,
    color: '#1A1F1E',
    lineHeight: 18,
  },
});
