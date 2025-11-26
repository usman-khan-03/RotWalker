/**
 * CrewCard - Displays a crew with journey progress
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../theme/theme';
import type { Crew } from '../types';

interface CrewCardProps {
  crew: Crew;
  memberCount?: number;
  journeyProgress?: number;
  journeyName?: string;
  onPress?: () => void;
}

export function CrewCard({ crew, memberCount, journeyProgress, journeyName, onPress }: CrewCardProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>{crew.emoji}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{crew.name}</Text>
          {memberCount !== undefined && (
            <Text style={styles.memberCount}>{memberCount} members</Text>
          )}
        </View>
      </View>

      {journeyProgress !== undefined && journeyName && (
        <View style={styles.journeyInfo}>
          <Text style={styles.journeyName}>{journeyName}</Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${journeyProgress}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{journeyProgress}%</Text>
        </View>
      )}
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
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  emojiContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.divider,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  emoji: {
    fontSize: 24,
  },
  info: {
    flex: 1,
  },
  name: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.xs,
  },
  memberCount: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  journeyInfo: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  journeyName: {
    ...theme.typography.bodySecondary,
    marginBottom: theme.spacing.xs,
  },
  progressBar: {
    height: 6,
    backgroundColor: theme.colors.divider,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
    marginBottom: theme.spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.crew.primary,
    borderRadius: theme.borderRadius.sm,
  },
  progressText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
});

