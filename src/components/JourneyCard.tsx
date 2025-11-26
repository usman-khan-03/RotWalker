/**
 * JourneyCard - Displays a journey with progress
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../theme/theme';
import type { JourneyWithProgress } from '../types';

interface JourneyCardProps {
  journey: JourneyWithProgress;
  mode: 'solo' | 'crew' | 'season';
  isPrimary?: boolean;
  onPress?: () => void;
}

export function JourneyCard({ journey, mode, isPrimary, onPress }: JourneyCardProps) {
  const primaryColor = 
    mode === 'solo' ? theme.colors.solo.primary :
    mode === 'crew' ? theme.colors.crew.primary :
    theme.colors.season.primary;

  const progressPercent = Math.round(journey.progress_ratio * 100);
  const remainingKm = Math.max(0, journey.target_distance_km - journey.distance_travelled_km);

  return (
    <TouchableOpacity
      style={[styles.container, isPrimary && { borderColor: primaryColor, borderWidth: 2 }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.name}>{journey.name}</Text>
        {isPrimary && (
          <View style={[styles.badge, { backgroundColor: primaryColor }]}>
            <Text style={styles.badgeText}>Primary</Text>
          </View>
        )}
      </View>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${progressPercent}%`, backgroundColor: primaryColor },
            ]}
          />
        </View>
        <Text style={styles.progressText}>{progressPercent}%</Text>
      </View>

      <View style={styles.stats}>
        <Text style={styles.statText}>
          {remainingKm.toFixed(1)} km remaining
        </Text>
        {mode === 'solo' && (
          <Text style={styles.statText}>
            {journey.steps_contributed.toLocaleString()} steps
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  name: {
    ...theme.typography.h3,
    flex: 1,
  },
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  badgeText: {
    ...theme.typography.caption,
    color: theme.colors.white,
    fontWeight: '600',
  },
  progressContainer: {
    marginBottom: theme.spacing.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.divider,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
    marginBottom: theme.spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: theme.borderRadius.sm,
  },
  progressText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
});

