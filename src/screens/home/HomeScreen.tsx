/**
 * Home Screen - Main dashboard
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useHomeSummary } from '../../hooks/useHomeSummary';
import { useSteps } from '../../hooks/useSteps';
import { StatCard } from '../../components/StatCard';
import { SegmentedControl } from '../../components/SegmentedControl';
import { HeroMap } from '../../components/HeroMap';
import { JourneyCard } from '../../components/JourneyCard';
import { CrewCard } from '../../components/CrewCard';
import { SeasonMatchupCard } from '../../components/SeasonMatchupCard';
import { theme } from '../../theme/theme';

type ViewMode = 'solo' | 'crew' | 'season';

export function HomeScreen() {
  const { profile } = useAuth();
  const { data: homeSummary, isLoading } = useHomeSummary();
  const { steps, isTracking, startTracking, isAvailable, permissionStatus } = useSteps();
  const [viewMode, setViewMode] = useState<ViewMode>('solo');

  const firstName = profile?.display_name?.split(' ')[0] || 'there';

  // Automatically start step tracking when screen loads (if permissions granted)
  useEffect(() => {
    if (profile?.is_onboarding_complete && !isTracking && isAvailable && permissionStatus === 'granted') {
      startTracking().catch((err) => {
        console.error('Failed to auto-start step tracking:', err);
      });
    }
  }, [profile?.is_onboarding_complete, isTracking, isAvailable, permissionStatus, startTracking]);

  // Determine which journey to show on hero map
  const heroJourney = 
    viewMode === 'solo' ? homeSummary?.primary_solo_journey :
    viewMode === 'crew' ? homeSummary?.primary_crew_journey :
    null;

  const renderHeroMap = () => {
    if (!heroJourney) {
      return (
        <View style={styles.heroMapPlaceholder}>
          <Text style={styles.placeholderText}>No active journey</Text>
        </View>
      );
    }

    return (
      <HeroMap
        origin={{ lat: heroJourney.origin_lat, lng: heroJourney.origin_lng }}
        destination={{ lat: heroJourney.dest_lat, lng: heroJourney.dest_lng }}
        progressRatio={heroJourney.progress_ratio}
        mode={viewMode}
      />
    );
  };

  const renderSoloView = () => {
    // TODO: Fetch solo journeys
    const soloJourneys = homeSummary?.primary_solo_journey ? [homeSummary.primary_solo_journey] : [];

    if (soloJourneys.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No solo journeys yet</Text>
          <Text style={styles.emptyStateSubtext}>Create your first journey to get started</Text>
        </View>
      );
    }

    return (
      <View>
        {soloJourneys.map((journey) => (
          <JourneyCard
            key={journey.id}
            journey={journey}
            mode="solo"
            isPrimary={journey.is_primary}
          />
        ))}
      </View>
    );
  };

  const renderCrewView = () => {
    // TODO: Fetch crew journeys
    const crewJourney = homeSummary?.primary_crew_journey;

    if (!crewJourney) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No crew journeys yet</Text>
          <Text style={styles.emptyStateSubtext}>Join or create a crew to start a group journey</Text>
        </View>
      );
    }

    return (
      <View>
        <JourneyCard
          journey={crewJourney}
          mode="crew"
          isPrimary={crewJourney.is_primary}
        />
      </View>
    );
  };

  const renderSeasonView = () => {
    const season = homeSummary?.current_season;

    if (!season) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No active season</Text>
          <Text style={styles.emptyStateSubtext}>Check back on Monday for the next season</Text>
        </View>
      );
    }

    return (
      <View>
        {season.user_crew && season.opponent_crew && (
          <SeasonMatchupCard
            myCrew={season.user_crew}
            opponentCrew={season.opponent_crew}
            targetDistance={season.season.target_distance_km}
          />
        )}
        
        <View style={styles.seasonInfo}>
          <Text style={styles.seasonTitle}>Global Leaderboard</Text>
          <Text style={styles.seasonRoute}>
            {`${season.season.origin_city} → ${season.season.dest_city}`}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.greeting}>
          {profile?.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{firstName.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <Text style={styles.greetingText}>Hey, {firstName}</Text>
          {(homeSummary?.streak ?? 0) > 0 && (
            <View style={styles.streakBadge}>
              <Text style={styles.streakText}>🔥 {String(homeSummary?.streak ?? 0)}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Text style={styles.notificationIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Hero Map Card */}
        <View style={styles.heroMapCard}>
          {renderHeroMap()}
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <StatCard
            label="Today"
            value={homeSummary?.today_steps ? homeSummary.today_steps.toLocaleString() : '0'}
          />
          <StatCard
            label="This Week"
            value={homeSummary?.week_steps ? homeSummary.week_steps.toLocaleString() : '0'}
          />
          <StatCard
            label="Streak"
            value={String(homeSummary?.streak || 0)}
          />
        </View>

        {/* Mode Toggle */}
        <View style={styles.modeToggle}>
          <SegmentedControl
            options={['Solo', 'Crew', 'Season']}
            selectedIndex={viewMode === 'solo' ? 0 : viewMode === 'crew' ? 1 : 2}
            onSelect={(index) => {
              const modes: ViewMode[] = ['solo', 'crew', 'season'];
              setViewMode(modes[index]);
            }}
          />
        </View>

        {/* Content Area */}
        <View style={styles.contentArea}>
          {viewMode === 'solo' && renderSoloView()}
          {viewMode === 'crew' && renderCrewView()}
          {viewMode === 'season' && renderSeasonView()}
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingTop: 60,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  greeting: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: theme.spacing.sm,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.divider,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  avatarText: {
    ...theme.typography.body,
    fontWeight: '600',
  },
  greetingText: {
    ...theme.typography.h3,
    marginRight: theme.spacing.sm,
  },
  streakBadge: {
    backgroundColor: theme.colors.cardBackground,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.pill,
  },
  streakText: {
    ...theme.typography.caption,
    fontWeight: '600',
  },
  notificationButton: {
    padding: theme.spacing.sm,
  },
  notificationIcon: {
    fontSize: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  heroMapCard: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
    ...theme.shadows.card,
  },
  heroMapPlaceholder: {
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    ...theme.typography.bodySecondary,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  modeToggle: {
    marginBottom: theme.spacing.md,
  },
  contentArea: {
    marginTop: theme.spacing.sm,
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
  },
  seasonInfo: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  seasonTitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.sm,
    color: theme.colors.season.primary,
  },
  seasonRoute: {
    ...theme.typography.bodySecondary,
  },
});

