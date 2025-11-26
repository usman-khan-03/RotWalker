/**
 * Crews Screen - Manage crews and group journeys
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { getUserCrews } from '../../api/database';
import { useQuery } from '@tanstack/react-query';
import { CrewCard } from '../../components/CrewCard';
import { theme } from '../../theme/theme';

export function CrewsScreen() {
  const { user } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data: crews, isLoading } = useQuery({
    queryKey: ['userCrews', user?.id],
    queryFn: () => getUserCrews(user!.id),
    enabled: !!user,
  });

  const handleCreateCrew = () => {
    // TODO: Navigate to create crew screen or show modal
    Alert.alert('Create Crew', 'Crew creation coming soon');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Crews</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateCrew}
        >
          <Text style={styles.createButtonText}>+ Create</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : crews && crews.length > 0 ? (
          crews.map((crew) => (
            <CrewCard
              key={crew.id}
              crew={crew}
              onPress={() => {
                // TODO: Navigate to crew detail screen
                Alert.alert('Crew Detail', `Viewing ${crew.name}`);
              }}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No crews yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Create or join a crew to start group journeys
            </Text>
            <TouchableOpacity
              style={styles.createButtonLarge}
              onPress={handleCreateCrew}
            >
              <Text style={styles.createButtonText}>Create Your First Crew</Text>
            </TouchableOpacity>
          </View>
        )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  title: {
    ...theme.typography.h1,
  },
  createButton: {
    backgroundColor: theme.colors.crew.primary,
    borderRadius: theme.borderRadius.pill,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    ...theme.shadows.button,
  },
  createButtonText: {
    ...theme.typography.body,
    color: theme.colors.white,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
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
    marginBottom: theme.spacing.xl,
  },
  createButtonLarge: {
    backgroundColor: theme.colors.crew.primary,
    borderRadius: theme.borderRadius.pill,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    ...theme.shadows.button,
  },
});

