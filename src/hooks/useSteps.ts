/**
 * Hook for step tracking
 * Implements pedometer integration for iOS and Android
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform, AppState, AppStateStatus } from 'react-native';
import {
  isStepCountingSupported,
  startStepCounterUpdate,
  stopStepCounterUpdate,
  type StepCountData,
} from '@uguratakan/react-native-step-counter';
import { syncStepsData } from '../api/edgeFunctions';
import { useAuth } from '../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'rotwalker_daily_steps';
const SYNC_INTERVAL = 60000; // Sync every minute
const STEP_UPDATE_INTERVAL = 30000; // Update step count every 30 seconds

interface DailyStepsData {
  [date: string]: {
    steps: number;
    lastSync: string;
    baseline: number; // Baseline step count at start of day
  };
}

export function useSteps() {
  const { user } = useAuth();
  const [steps, setSteps] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  const [error, setError] = useState<string | null>(null);
  
  const subscriptionRef = useRef<{ remove: () => void } | null>(null);
  const dailyStepsRef = useRef<DailyStepsData>({});
  const lastStepCountRef = useRef(0);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef(AppState.currentState);
  const startDateRef = useRef<Date | null>(null);

  // Get today's date string (YYYY-MM-DD)
  const getTodayDate = useCallback(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  // Load daily steps from storage
  const loadDailySteps = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        dailyStepsRef.current = JSON.parse(stored);
      }
    } catch (err) {
      console.error('Error loading daily steps:', err);
    }
  }, []);

  // Save daily steps to storage
  const saveDailySteps = useCallback(async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dailyStepsRef.current));
    } catch (err) {
      console.error('Error saving daily steps:', err);
    }
  }, []);

  // Get today's step count from storage
  const getTodaySteps = useCallback(() => {
    const today = getTodayDate();
    return dailyStepsRef.current[today]?.steps || 0;
  }, [getTodayDate]);

  // Check if step counting is supported and get permission status
  useEffect(() => {
    const checkAvailability = async () => {
      try {
        const result = await isStepCountingSupported();
        setIsAvailable(result.supported);
        
        if (result.granted) {
          setPermissionStatus('granted');
        } else {
          setPermissionStatus('denied');
        }
        
        if (!result.supported) {
          setError('Step tracking is not supported on this device');
        }
      } catch (err: any) {
        console.error('Error checking step counter availability:', err);
        setIsAvailable(false);
        setError(err.message || 'Failed to check step counter availability');
      }
    };

    checkAvailability();
    loadDailySteps();
  }, [loadDailySteps]);

  // Request permissions (permissions are requested when starting the step counter)
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const result = await isStepCountingSupported();
      
      if (!result.supported) {
        setError('Step counting is not supported on this device');
        return false;
      }
      
      if (result.granted) {
        setPermissionStatus('granted');
        return true;
      }
      
      // Permission will be requested when we start the step counter
      // For now, we'll assume it's granted if supported
      setPermissionStatus('granted');
      return true;
    } catch (err: any) {
      console.error('Error requesting permissions:', err);
      setPermissionStatus('denied');
      setError(err.message || 'Failed to request permissions');
      return false;
    }
  }, []);

  // Sync steps to backend
  const syncToBackend = useCallback(async () => {
    if (!user) return;

    try {
      const today = getTodayDate();
      const todaySteps = dailyStepsRef.current[today]?.steps || 0;

      if (todaySteps > 0) {
        const samples = [
          {
            date: today,
            steps: todaySteps,
          },
        ];

        await syncStepsData(user.id, 'pedometer', samples);
        
        // Update last sync time
        if (dailyStepsRef.current[today]) {
          dailyStepsRef.current[today].lastSync = new Date().toISOString();
          await saveDailySteps();
        }
      }
    } catch (err: any) {
      console.error('Error syncing steps to backend:', err);
      setError(err.message || 'Failed to sync steps');
    }
  }, [user, getTodayDate, saveDailySteps]);

  // Start tracking steps
  const startTracking = useCallback(async () => {
    if (isAvailable === false) {
      setError('Step counting is not available on this device');
      return false;
    }

    // Request permissions if needed
    if (permissionStatus === 'undetermined') {
      const granted = await requestPermissions();
      if (!granted) {
        return false;
      }
    }

    try {
      const today = getTodayDate();
      const now = new Date();
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      
      // Initialize today's entry if it doesn't exist
      if (!dailyStepsRef.current[today]) {
        dailyStepsRef.current[today] = {
          steps: 0,
          lastSync: '',
          baseline: 0,
        };
      }

      // Start step counter from beginning of today
      startDateRef.current = startOfDay;
      
      const subscription = startStepCounterUpdate(
        startOfDay,
        (data: StepCountData) => {
          const newStepCount = data.steps;
          
          // If this is the first reading, set baseline
          if (dailyStepsRef.current[today].baseline === 0 && newStepCount > 0) {
            dailyStepsRef.current[today].baseline = newStepCount;
          }
          
          // Calculate today's steps (current count minus baseline)
          const todaySteps = Math.max(0, newStepCount - dailyStepsRef.current[today].baseline);
          
          // Update stored steps if current count is higher
          if (todaySteps > dailyStepsRef.current[today].steps) {
            dailyStepsRef.current[today].steps = todaySteps;
            setSteps(todaySteps);
            saveDailySteps();
          }
          
          lastStepCountRef.current = newStepCount;
        }
      );

      subscriptionRef.current = subscription;

      // Set initial step count from storage
      const initialSteps = getTodaySteps();
      setSteps(initialSteps);
      
      setIsTracking(true);
      setError(null);

      // Set up periodic sync
      syncIntervalRef.current = setInterval(() => {
        syncToBackend();
      }, SYNC_INTERVAL);

      // Sync immediately
      syncToBackend();

      return true;
    } catch (err: any) {
      console.error('Error starting step tracking:', err);
      setError(err.message || 'Failed to start step tracking');
      setIsTracking(false);
      return false;
    }
  }, [isAvailable, permissionStatus, requestPermissions, getTodayDate, getTodaySteps, saveDailySteps, syncToBackend]);

  // Stop tracking steps
  const stopTracking = useCallback(() => {
    if (subscriptionRef.current) {
      stopStepCounterUpdate();
      subscriptionRef.current.remove();
      subscriptionRef.current = null;
    }

    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    }

    setIsTracking(false);
    
    // Final sync before stopping
    if (user) {
      syncToBackend();
    }
  }, [user, syncToBackend]);

  // Handle app state changes (foreground/background)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        isTracking
      ) {
        // App came to foreground, refresh step count
        const today = getTodayDate();
        const todaySteps = getTodaySteps();
        setSteps(todaySteps);
        
        // Sync to backend
        syncToBackend();
      }
      
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription.remove();
    };
  }, [isTracking, getTodayDate, getTodaySteps, syncToBackend]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  // Get historical step data for multiple days
  const getHistoricalSteps = useCallback(async (days: number = 7) => {
    await loadDailySteps();
    const today = new Date();
    const samples = [];

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayData = dailyStepsRef.current[dateStr];

      if (dayData && dayData.steps > 0) {
        samples.push({
          date: dateStr,
          steps: dayData.steps,
        });
      }
    }

    return samples;
  }, [loadDailySteps]);

  // Manual sync function
  const manualSync = useCallback(async () => {
    await syncToBackend();
  }, [syncToBackend]);

  return {
    steps,
    isTracking,
    isAvailable,
    permissionStatus,
    error,
    startTracking,
    stopTracking,
    syncToBackend: manualSync,
    getHistoricalSteps,
    requestPermissions,
  };
}
