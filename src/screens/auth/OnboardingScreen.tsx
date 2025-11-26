/**
 * Onboarding Screen - Multi-step onboarding flow
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useSteps } from '../../hooks/useSteps';
import { updateProfile } from '../../api/database';
import { theme } from '../../theme/theme';
import { supabase } from '@/api/supabase';

type OnboardingStep = 'steps' | 'notifications' | 'journey';

export function OnboardingScreen() {
  const { user, profile, refreshProfile } = useAuth();
  const { requestPermissions, startTracking, isAvailable, error: stepsError } = useSteps();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('steps');
  const [loading, setLoading] = useState(false);
  const [stepsPermissionGranted, setStepsPermissionGranted] = useState(false);

  const handleStepPermission = async (step: OnboardingStep) => {
    if (step === 'steps') {
      try {
        // Request permissions
        const granted = await requestPermissions();
        
        if (granted) {
          // Start tracking
          const started = await startTracking();
          if (started) {
            setStepsPermissionGranted(true);
            setCurrentStep('notifications');
          } else {
            Alert.alert(
              'Permission Required',
              'Step tracking requires motion sensor permissions. Please enable it in Settings.',
              [{ text: 'OK' }]
            );
          }
        } else {
          Alert.alert(
            'Permission Denied',
            'Step tracking requires motion sensor permissions to work. You can enable it later in Settings.',
            [{ text: 'OK', onPress: () => setCurrentStep('notifications') }]
          );
        }
      } catch (error: any) {
        Alert.alert('Error', error.message || 'Failed to request step tracking permissions');
      }
    } else if (step === 'notifications') {
      // TODO: Request notification permission
      // For now, just move to next step
      setCurrentStep('journey');
    }
  };

const handleCompleteOnboarding = async () => {
  console.log("does user exist user:", user?.id);
  if (!user) return;

  try {
    setLoading(true);
    
    // Update profile to mark onboarding complete
    console.log("Completing onboarding for user:", user.id);
    
    // Use updateProfile from database.ts instead
    const updatedProfile = await updateProfile(user.id, { 
      is_onboarding_complete: true 
    });
    
    console.log("reached after updating");
    console.log('Onboarding completed successfully');
    
    // Refresh profile in auth context to update the is_onboarding_complete flag
    // This will trigger RootNavigator to navigate to Main tabs
    await refreshProfile();
    
    console.log('Profile refreshed after onboarding');
    // Navigation will happen automatically via profile state change in RootNavigator
  } catch (error: any) {
    console.error('Error completing onboarding:', error);
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
      
      {stepsError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{stepsError}</Text>
        </View>
      )}
      
      {isAvailable === false && (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>
            Step tracking is not available on this device.
          </Text>
        </View>
      )}
      
      {stepsPermissionGranted && (
        <View style={styles.successContainer}>
          <Text style={styles.successText}>✓ Step tracking enabled</Text>
        </View>
      )}
      
      <TouchableOpacity
        style={[styles.primaryButton, stepsPermissionGranted && styles.primaryButtonDisabled]}
        onPress={() => handleStepPermission('steps')}
        disabled={stepsPermissionGranted}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryButtonText}>
          {stepsPermissionGranted ? 'Step Tracking Enabled' : 'Enable Step Tracking'}
        </Text>
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
  errorContainer: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  errorText: {
    ...theme.typography.bodySecondary,
    color: theme.colors.error,
    textAlign: 'center',
  },
  warningContainer: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  warningText: {
    ...theme.typography.bodySecondary,
    color: theme.colors.warning,
    textAlign: 'center',
  },
  successContainer: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  successText: {
    ...theme.typography.bodySecondary,
    color: theme.colors.success,
    textAlign: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
});

