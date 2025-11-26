/**
 * Hook for step tracking
 * Implements pedometer integration for iOS and Android using expo-sensors
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform, AppState, AppStateStatus } from 'react-native';
import { Pedometer } from 'expo-sensors';
import { syncStepsData } from '../api/edgeFunctions';
import { useAuth } from '../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'rotwalker_daily_steps';
const SYNC_INTERVAL = 60000; // Sync every minute

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
  const startOfDayRef = useRef<Date | null>(null);
  const isInitializedRef = useRef(false);

  // Get today's date string (YYYY-MM-DD)
  const getTodayDate = useCallback(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  // Get start of today
  const getStartOfToday = useCallback(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    return startOfDay;
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

  // Check if pedometer is available
  useEffect(() => {
    const checkAvailability = async () => {
      try {
        const available = await Pedometer.isAvailableAsync();
        setIsAvailable(available);
        
        if (!available) {
          setError('Step tracking is not available on this device');
          setPermissionStatus('denied');
        } else {
          // If available, check if we can get step count (tests permissions)
          try {
            const startOfDay = getStartOfToday();
            await Pedometer.getStepCountAsync(startOfDay, new Date());
            setPermissionStatus('granted');
          } catch (permErr) {
            // Permission not granted yet, but device supports it
            setPermissionStatus('undetermined');
          }
        }
      } catch (err: any) {
        console.error('Error checking pedometer availability:', err);
        setIsAvailable(false);
        setError(err.message || 'Failed to check pedometer availability');
        setPermissionStatus('denied');
      }
    };

    if (!isInitializedRef.current) {
      checkAvailability();
      loadDailySteps();
      isInitializedRef.current = true;
    }
  }, [loadDailySteps, getStartOfToday]);

  // Request permissions (permissions are requested when starting the pedometer)
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      if (isAvailable === false) {
        setError('Step counting is not supported on this device');
        return false;
      }

      // Check availability again
      const available = await Pedometer.isAvailableAsync();
      if (!available) {
        setPermissionStatus('denied');
        setError('Step counting is not available on this device');
        return false;
      }

      // Try to get step count for today to trigger permission request
      try {
        const startOfDay = getStartOfToday();
        const now = new Date();
        const result = await Pedometer.getStepCountAsync(startOfDay, now);
        
        // If we got here, permission is granted
        setPermissionStatus('granted');
        setError(null);
        return true;
      } catch (permError: any) {
        // Permission might be denied
        const errorMsg = permError?.message || '';
        if (errorMsg.includes('permission') || errorMsg.includes('denied') || errorMsg.includes('authorized')) {
          setPermissionStatus('denied');
          setError('Step tracking permission was denied. Please enable it in Settings.');
          return false;
        }
        // Other error - might be a different issue, but try to continue
        console.warn('Permission check error (non-fatal):', permError);
        setPermissionStatus('granted');
        return true;
      }
    } catch (err: any) {
      console.error('Error requesting permissions:', err);
      setPermissionStatus('denied');
      setError(err.message || 'Failed to request permissions');
      return false;
    }
  }, [isAvailable, getStartOfToday]);

  // Sync steps to backend
  const syncToBackend = useCallback(async () => {
    if (!user) {
      console.log('Cannot sync: user not logged in');
      return;
    }

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

        try {
          await syncStepsData(user.id, 'pedometer', samples);
          
          // Update last sync time
          if (dailyStepsRef.current[today]) {
            dailyStepsRef.current[today].lastSync = new Date().toISOString();
            await saveDailySteps();
          }
          
          console.log(`Synced ${todaySteps} steps to backend for ${today}`);
        } catch (syncError: any) {
          // Don't throw - just log the error so tracking continues
          console.error('Error syncing steps to backend:', syncError);
          // Keep the error but don't stop tracking
        }
      }
    } catch (err: any) {
      console.error('Error in syncToBackend:', err);
      // Don't set error state for sync failures - tracking should continue
    }
  }, [user, getTodayDate, saveDailySteps]);

  // Start tracking steps
  const startTracking = useCallback(async () => {
    if (isAvailable === false) {
      setError('Step counting is not available on this device');
      return false;
    }

    // Request permissions if needed
    if (permissionStatus === 'undetermined' || permissionStatus === 'denied') {
      const granted = await requestPermissions();
      if (!granted) {
        return false;
      }
    }

    try {
      const today = getTodayDate();
      const startOfDay = getStartOfToday();
      startOfDayRef.current = startOfDay;

      // Initialize today's entry if it doesn't exist
      if (!dailyStepsRef.current[today]) {
        dailyStepsRef.current[today] = {
          steps: 0,
          lastSync: '',
          baseline: 0,
        };
      }

      // Get initial step count from start of day
      let initialSteps = 0;
      try {
        const stepCountResult = await Pedometer.getStepCountAsync(startOfDay, new Date());
        initialSteps = stepCountResult.steps || 0;
        
        // Set baseline if not already set
        if (dailyStepsRef.current[today].baseline === 0) {
          dailyStepsRef.current[today].baseline = initialSteps;
        }
        
        // Calculate today's steps (current count minus baseline)
        const baseline = dailyStepsRef.current[today].baseline;
        const todaySteps = Math.max(0, initialSteps - baseline);
        
        dailyStepsRef.current[today].steps = todaySteps;
        setSteps(todaySteps);
        lastStepCountRef.current = initialSteps;
        await saveDailySteps();
      } catch (err: any) {
        console.warn('Could not get initial step count:', err);
        // Continue with stored value
        initialSteps = getTodaySteps();
        setSteps(initialSteps);
      }

      // Subscribe to step count updates
      try {
        const subscription = Pedometer.watchStepCount((result) => {
          const newStepCount = result.steps;
          const today = getTodayDate();
          const baseline = dailyStepsRef.current[today]?.baseline || 0;
          
          // Handle step counter reset (new day scenario)
          if (newStepCount < lastStepCountRef.current && lastStepCountRef.current > 0) {
            // Counter was reset, likely new day - reset baseline
            dailyStepsRef.current[today].baseline = newStepCount;
            dailyStepsRef.current[today].steps = 0;
            setSteps(0);
            lastStepCountRef.current = newStepCount;
            saveDailySteps();
          } else if (newStepCount >= 0) {
            // Normal update - calculate today's steps
            const todaySteps = Math.max(0, newStepCount - baseline);
            
            // Only update if there's a meaningful change
            if (Math.abs(todaySteps - dailyStepsRef.current[today].steps) > 0) {
              dailyStepsRef.current[today].steps = todaySteps;
              setSteps(todaySteps);
              saveDailySteps();
            }
            
            lastStepCountRef.current = newStepCount;
          }
        });

        subscriptionRef.current = subscription;
        setIsTracking(true);
        setError(null);

        // Set up periodic sync
        if (syncIntervalRef.current) {
          clearInterval(syncIntervalRef.current);
        }
        syncIntervalRef.current = setInterval(() => {
          syncToBackend();
        }, SYNC_INTERVAL);

        // Sync immediately
        syncToBackend();

        console.log('Step tracking started successfully');
        return true;
      } catch (watchError: any) {
        console.error('Error setting up step watch:', watchError);
        setError(watchError.message || 'Failed to start step tracking');
        setIsTracking(false);
        return false;
      }
    } catch (err: any) {
      console.error('Error starting step tracking:', err);
      setError(err.message || 'Failed to start step tracking');
      setIsTracking(false);
      return false;
    }
  }, [isAvailable, permissionStatus, requestPermissions, getTodayDate, getStartOfToday, getTodaySteps, saveDailySteps, syncToBackend]);

  // Stop tracking steps
  const stopTracking = useCallback(() => {
    if (subscriptionRef.current) {
      try {
        subscriptionRef.current.remove();
      } catch (err) {
        console.warn('Error removing subscription:', err);
      }
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
    
    console.log('Step tracking stopped');
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
        const startOfDay = getStartOfToday();
        
        // Get current step count
        Pedometer.getStepCountAsync(startOfDay, new Date())
          .then((result) => {
            const baseline = dailyStepsRef.current[today]?.baseline || 0;
            const todaySteps = Math.max(0, (result.steps || 0) - baseline);
            dailyStepsRef.current[today].steps = todaySteps;
            setSteps(todaySteps);
            lastStepCountRef.current = result.steps || 0;
            saveDailySteps();
            syncToBackend();
          })
          .catch((err) => {
            console.warn('Could not refresh step count on foreground:', err);
          });
      }
      
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription.remove();
    };
  }, [isTracking, getTodayDate, getStartOfToday, saveDailySteps, syncToBackend]);

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
