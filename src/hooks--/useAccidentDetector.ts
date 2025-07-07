import { useEffect, useRef, useState } from 'react';
import { accelerometer } from 'react-native-sensors';
import { Subscription } from 'rxjs';
import { map, filter, debounceTime } from 'rxjs/operators';
import { PermissionsAndroid, Platform } from 'react-native';

const ACCIDENT_THRESHOLD = 2.5; // More realistic G-force threshold (2.5G-3G is typical for crashes)
const ACCIDENT_TIMEOUT = 2000; // Increased to 2 seconds for better debouncing
const DEBOUNCE_TIME = 100; // ms to stabilize sensor readings

export const useAccidentDetector = (onDetect: () => void, enabled: boolean = true) => {
  const lastDetectionTimeRef = useRef(0);
  const subscriptionRef = useRef<Subscription | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  const checkSensorPermissions = async () => {
    if (Platform.OS === 'android' && Platform.Version >= 31) {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.HIGH_SAMPLING_RATE_SENSORS,
          {
            title: 'High Frequency Sensor Permission',
            message: 'This app needs access to high frequency sensors for accident detection',
            buttonPositive: 'OK',
          }
        );
        setHasPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
      } catch (err) {
        console.warn('Sensor permission error:', err);
        setHasPermission(false);
      }
    } else {
      setHasPermission(true); // Permission not required for older Android versions
    }
  };

  useEffect(() => {
    if (enabled) {
      checkSensorPermissions().then(() => {
        if (hasPermission || Platform.OS !== 'android' || Platform.Version < 31) {
          subscriptionRef.current = accelerometer
            .pipe(
              debounceTime(DEBOUNCE_TIME), // Stabilize readings
              map(({ x, y, z }) => {
                // Calculate magnitude and convert to G-force (assuming m/s²)
                return Math.sqrt(x * x + y * y + z * z) / 9.81;
              }),
              filter(gForce => gForce > ACCIDENT_THRESHOLD)
            )
            .subscribe(gForce => {
              const now = Date.now();
              if (now - lastDetectionTimeRef.current > ACCIDENT_TIMEOUT) {
                lastDetectionTimeRef.current = now;
                console.log(`Accident detected: ${gForce.toFixed(2)}G`);
                onDetect();
              }
            });
        }
      });
    } else {
      subscriptionRef.current?.unsubscribe();
      subscriptionRef.current = null;
    }

    return () => {
      subscriptionRef.current?.unsubscribe();
    };
  }, [enabled, onDetect, hasPermission]);

  // Optional: Return permission status for UI feedback
  return { hasPermission };
};