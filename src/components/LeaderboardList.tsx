/**
 * LeaderboardList - Displays a leaderboard of users
 */

import React from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import { theme } from '../theme/theme';
import type { FriendsLeaderboardEntry } from '../types';

interface LeaderboardListProps {
  entries: FriendsLeaderboardEntry[];
  currentUserId?: string;
  onEntryPress?: (entry: FriendsLeaderboardEntry) => void;
}

export function LeaderboardList({ entries, currentUserId, onEntryPress }: LeaderboardListProps) {
  const renderEntry = ({ item, index }: { item: FriendsLeaderboardEntry; index: number }) => {
    const isCurrentUser = item.friend.id === currentUserId;
    
    return (
      <View
        style={[
          styles.entry,
          isCurrentUser && styles.entryCurrent,
        ]}
      >
        <View style={styles.rankContainer}>
          <Text style={styles.rank}>#{index + 1}</Text>
        </View>
        
        <View style={styles.avatarContainer}>
          {item.friend.avatar_url ? (
            <Image source={{ uri: item.friend.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {item.friend.display_name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.info}>
          <Text style={styles.name}>
            {item.friend.display_name}
            {isCurrentUser && ' (You)'}
          </Text>
          {item.primary_journey_name && (
            <Text style={styles.journey}>
              {item.primary_journey_name} {item.primary_journey_progress}%
            </Text>
          )}
        </View>

        <View style={styles.stats}>
          <Text style={styles.steps}>{String(item.steps.toLocaleString())}</Text>
          <Text style={styles.label}>steps</Text>
        </View>
      </View>
    );
  };

  return (
    <FlatList
      data={entries}
      renderItem={renderEntry}
      keyExtractor={(item) => item.friend.id}
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
  },
  entry: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.card,
  },
  entryCurrent: {
    borderWidth: 2,
    borderColor: theme.colors.solo.primary,
  },
  rankContainer: {
    width: 32,
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  rank: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  avatarContainer: {
    marginRight: theme.spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.divider,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  info: {
    flex: 1,
  },
  name: {
    ...theme.typography.body,
    marginBottom: theme.spacing.xs,
  },
  journey: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  stats: {
    alignItems: 'flex-end',
  },
  steps: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.xs,
  },
  label: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
});

