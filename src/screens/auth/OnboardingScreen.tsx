/**
 * Onboarding Screen - Multi-step onboarding flow
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { updateProfile } from '../../api/database';
import { theme } from '../../theme/theme';

type OnboardingStep = 'steps' | 'notifications' | 'journey';

export function OnboardingScreen() {
  const { user, profile, refreshProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('steps');
  const [loading, setLoading] = useState(false);

  const handleStepPermission = async (step: OnboardingStep) => {
    // TODO: Request actual permissions
    // For steps: Request pedometer/health permissions
    // For notifications: Request notification permissions
    
    if (step === 'steps') {
      // TODO: Request pedometer permission
      console.log('Requesting step tracking permissions...');
    } else if (step === 'notifications') {
      // TODO: Request notification permission
      console.log('Requesting notification permissions...');
    }

    // Move to next step
    if (step === 'steps') {
      setCurrentStep('notifications');
    } else if (step === 'notifications') {
      setCurrentStep('journey');
    }
  };

  const handleCompleteOnboarding = async () => {
    if (!user) return;

    try {
      setLoading(true);
      await updateProfile(user.id, { is_onboarding_complete: true });
      await refreshProfile();
      // Navigation will happen automatically via auth state change
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to complete onboarding');
      setLoading(false);
    }
  };

  const renderStepsStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Connect Steps Source</Text>
      <Text style={styles.stepDescription}>
        RotWalker needs access to your step data to track your journeys. We'll use your device's pedometer and optionally sync with Apple Health or Health Connect.
      </Text>
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => handleStepPermission('steps')}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryButtonText}>Enable Step Tracking</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => setCurrentStep('notifications')}
      >
        <Text style={styles.secondaryButtonText}>Skip for now</Text>
      </TouchableOpacity>
    </View>
  );

  const renderNotificationsStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Enable Notifications</Text>
      <Text style={styles.stepDescription}>
        Get notified when friends overtake you, when your crew reaches milestones, or when seasons start.
      </Text>
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => handleStepPermission('notifications')}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryButtonText}>Enable Notifications</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => setCurrentStep('journey')}
      >
        <Text style={styles.secondaryButtonText}>Skip for now</Text>
      </TouchableOpacity>
    </View>
  );

  const renderJourneyStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Choose Your First Journey</Text>
      <Text style={styles.stepDescription}>
        Select your origin and destination cities to start your first solo journey. You can change this later.
      </Text>
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleCompleteOnboarding}
        disabled={loading}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryButtonText}>
          {loading ? 'Setting up...' : 'Create Journey'}
        </Text>
      </TouchableOpacity>
      <Text style={styles.note}>
        Note: Journey creation will be available after onboarding. For now, you can explore the app.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${((currentStep === 'steps' ? 1 : currentStep === 'notifications' ? 2 : 3) / 3) * 100}%`,
                },
              ]}
            />
          </View>
        </View>

        {currentStep === 'steps' && renderStepsStep()}
        {currentStep === 'notifications' && renderNotificationsStep()}
        {currentStep === 'journey' && renderJourneyStep()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.xl,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  progressBar: {
    height: 4,
    backgroundColor: theme.colors.divider,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.solo.primary,
    borderRadius: theme.borderRadius.sm,
  },
  stepContent: {
    flex: 1,
    justifyContent: 'center',
  },
  stepTitle: {
    ...theme.typography.h1,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  stepDescription: {
    ...theme.typography.bodySecondary,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
    lineHeight: 24,
  },
  primaryButton: {
    backgroundColor: theme.colors.solo.primary,
    borderRadius: theme.borderRadius.pill,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    ...theme.shadows.button,
  },
  primaryButtonText: {
    ...theme.typography.body,
    color: theme.colors.white,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  secondaryButtonText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  note: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
});

