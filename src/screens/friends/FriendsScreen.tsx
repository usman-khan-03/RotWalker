/**
 * Friends Screen - Leaderboard and friend management
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Friends</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Rank Summary */}
        <View style={styles.rankSummary}>
          <Text style={styles.rankText}>
            You are #{displayRank} out of {totalFriends} friends this {period}
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

        {/* Leaderboard */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : leaderboard && leaderboard.length > 0 ? (
          <LeaderboardList
            entries={leaderboard}
            currentUserId={user?.id}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No friends yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Add friends to compare your progress
            </Text>
            <TouchableOpacity style={styles.addButton}>
              <Text style={styles.addButtonText}>Add Friends</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Friend Management */}
        <View style={styles.friendManagement}>
          <TouchableOpacity style={styles.manageButton}>
            <Text style={styles.manageButtonText}>Add Friends</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.manageButton}>
            <Text style={styles.manageButtonText}>Friend Requests</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  rankSummary: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
    ...theme.shadows.card,
  },
  rankText: {
    ...theme.typography.body,
    textAlign: 'center',
  },
  filterContainer: {
    marginBottom: theme.spacing.md,
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

