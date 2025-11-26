/**
 * SeasonMatchupCard - Displays 1v1 race visualization
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';
import type { SeasonCrewWithCrew } from '../types';

interface SeasonMatchupCardProps {
  myCrew: SeasonCrewWithCrew;
  opponentCrew: SeasonCrewWithCrew | null;
  targetDistance: number;
}

export function SeasonMatchupCard({ myCrew, opponentCrew, targetDistance }: SeasonMatchupCardProps) {
  const myProgress = (myCrew.total_distance_km / targetDistance) * 100;
  const opponentProgress = opponentCrew ? (opponentCrew.total_distance_km / targetDistance) * 100 : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>1v1 Race</Text>
      
      <View style={styles.raceContainer}>
        {/* My Crew */}
        <View style={styles.lane}>
          <View style={styles.crewHeader}>
            <Text style={styles.crewEmoji}>{myCrew.crew.emoji}</Text>
            <Text style={styles.crewName}>{myCrew.crew.name}</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(myProgress, 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.distance}>{String(myCrew.total_distance_km.toFixed(1))} km</Text>
        </View>

        {/* Opponent Crew */}
        {opponentCrew && (
          <View style={styles.lane}>
            <View style={styles.crewHeader}>
              <Text style={styles.crewEmoji}>{opponentCrew.crew.emoji}</Text>
              <Text style={styles.crewName}>{opponentCrew.crew.name}</Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  styles.progressFillOpponent,
                  { width: `${Math.min(opponentProgress, 100)}%` },
                ]}
              />
            </View>
            <Text style={styles.distance}>{String(opponentCrew.total_distance_km.toFixed(1))} km</Text>
          </View>
        )}
      </View>
    </View>
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
  title: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.md,
    color: theme.colors.season.primary,
  },
  raceContainer: {
    gap: theme.spacing.md,
  },
  lane: {
    marginBottom: theme.spacing.sm,
  },
  crewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  crewEmoji: {
    fontSize: 20,
    marginRight: theme.spacing.sm,
  },
  crewName: {
    ...theme.typography.body,
    flex: 1,
  },
  progressBar: {
    height: 12,
    backgroundColor: theme.colors.divider,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
    marginBottom: theme.spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.season.primary,
    borderRadius: theme.borderRadius.sm,
  },
  progressFillOpponent: {
    backgroundColor: theme.colors.textMuted,
  },
  distance: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
});

