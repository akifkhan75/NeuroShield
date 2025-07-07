import { useEffect, useRef, useState, useCallback } from 'react';
import { accelerometer } from 'react-native-sensors';
import { Subscription } from 'rxjs';
import { map, filter, debounceTime, throttleTime } from 'rxjs/operators';
import { PermissionsAndroid, Platform } from 'react-native';

// Physics-based thresholds (adjusted for better mobile shake detection)
const SHAKE_THRESHOLD = 2.5; // in G-force (1G = 9.81 m/s²)
const SHAKE_TIMEOUT = 800; // ms between shake events (prevent rapid triggers)
const DEBOUNCE_TIME = 50; // ms to stabilize sensor readings
const THROTTLE_TIME = 100; // ms to limit maximum event rate

export const useShakeDetector = (
  onShake: () => void, 
  enabled: boolean = true,
  options?: {
    threshold?: number;
    timeout?: number;
  }
) => {
  const lastShakeTimeRef = useRef(0);
  const subscriptionRef = useRef<Subscription | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const threshold = options?.threshold ?? SHAKE_THRESHOLD;
  const timeout = options?.timeout ?? SHAKE_TIMEOUT;

  const checkSensorPermissions = useCallback(async () => {
    if (Platform.OS === 'android' && Platform.Version >= 31) {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.HIGH_SAMPLING_RATE_SENSORS,
          {
            title: 'Motion Sensor Permission',
            message: 'This app needs access to motion sensors for shake detection',
            buttonPositive: 'OK',
          }
        );
        setHasPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Sensor permission error:', err);
        setHasPermission(false);
        return false;
      }
    }
    return true; // Permission not required for iOS or older Android
  }, []);

  const startDetection = useCallback(async () => {
    if (!enabled) return;

    const hasPerms = await checkSensorPermissions();
    if (!hasPerms && Platform.OS === 'android' && Platform.Version >= 31) {
      console.log('Shake detection disabled - missing permissions');
      return;
    }

    setIsActive(true);
    subscriptionRef.current = accelerometer
      .pipe(
        debounceTime(DEBOUNCE_TIME), // Reduce noise
        throttleTime(THROTTLE_TIME), // Limit maximum event rate
        map(({ x, y, z }) => {
          // Convert acceleration vector to G-force
          const magnitude = Math.sqrt(x * x + y * y + z * z);
          return magnitude / 9.81; // Convert m/s² to G
        }),
        filter(gForce => gForce > threshold)
      )
      .subscribe(gForce => {
        const now = Date.now();
        if (now - lastShakeTimeRef.current > timeout) {
          lastShakeTimeRef.current = now;
          console.log(`Shake detected: ${gForce.toFixed(2)}G`);
          onShake();
        }
      });
  }, [enabled, threshold, timeout, onShake, checkSensorPermissions]);

  useEffect(() => {
    if (enabled) {
      startDetection();
    } else {
      subscriptionRef.current?.unsubscribe();
      setIsActive(false);
    }

    return () => {
      subscriptionRef.current?.unsubscribe();
      setIsActive(false);
    };
  }, [enabled, startDetection]);

  // Return state and methods for better control
  return {
    isActive,
    hasPermission,
    checkPermissions: checkSensorPermissions,
    startDetection,
    stopDetection: () => {
      subscriptionRef.current?.unsubscribe();
      setIsActive(false);
    },
  };
};