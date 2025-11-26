/**
 * Friends Screen - Leaderboard and friend management
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useFriendsLeaderboard } from '../../hooks/useFriendsLeaderboard';
import { SegmentedControl } from '../../components/SegmentedControl';
import { LeaderboardList } from '../../components/LeaderboardList';
import { theme } from '../../theme/theme';
import type { LeaderboardPeriod } from '../../types';

export function FriendsScreen() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<LeaderboardPeriod>('week');
  const { data: leaderboard, isLoading } = useFriendsLeaderboard(period);

  const rank = leaderboard?.findIndex(entry => entry.friend.id === user?.id) ?? -1;
  const totalFriends = leaderboard?.length || 0;
  const displayRank = rank >= 0 ? rank + 1 : totalFriends + 1;

  const renderHeader = () => (
    <>
      {/* Rank Summary */}
      <View style={styles.rankSummary}>
        <Text style={styles.rankText}>
          You are #{String(displayRank)} out of {String(totalFriends)} friends this {period === 'today' ? 'today' : period === 'week' ? 'week' : 'month'}
        </Text>
      </View>

      {/* Period Filter */}
      <View style={styles.filterContainer}>
        <SegmentedControl
          options={['Today', 'This Week', 'This Month']}
          selectedIndex={period === 'today' ? 0 : period === 'week' ? 1 : 2}
          onSelect={(index) => {
            const periods: LeaderboardPeriod[] = ['today', 'week', 'month'];
            setPeriod(periods[index]);
          }}
        />
      </View>
    </>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      );
    }

    if (!leaderboard || leaderboard.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No friends yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Add friends to compare your progress
          </Text>
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>Add Friends</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return <LeaderboardList entries={leaderboard} currentUserId={user?.id} />;
  };

  const renderFooter = () => (
    <View style={styles.friendManagement}>
      <TouchableOpacity style={styles.manageButton}>
        <Text style={styles.manageButtonText}>Add Friends</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.manageButton}>
        <Text style={styles.manageButtonText}>Friend Requests</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Friends</Text>
      </View>

      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  title: {
    ...theme.typography.h1,
  },
  rankSummary: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
    alignItems: 'center',
    ...theme.shadows.card,
  },
  rankText: {
    ...theme.typography.body,
    textAlign: 'center',
  },
  filterContainer: {
    marginBottom: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
  },
  loadingContainer: {
    paddingVertical: theme.spacing.xxl,
    alignItems: 'center',
  },
  loadingText: {
    ...theme.typography.bodySecondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyStateText: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    ...theme.typography.bodySecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  addButton: {
    backgroundColor: theme.colors.solo.primary,
    borderRadius: theme.borderRadius.pill,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    ...theme.shadows.button,
  },
  addButtonText: {
    ...theme.typography.body,
    color: theme.colors.white,
    fontWeight: '600',
  },
  friendManagement: {
    marginTop: theme.spacing.xl,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.xxl,
    gap: theme.spacing.sm,
  },
  manageButton: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    ...theme.shadows.card,
  },
  manageButtonText: {
    ...theme.typography.body,
    fontWeight: '600',
  },
});

