import { useEffect, useRef } from 'react';
import { accelerometer } from 'react-native-sensors';
import { Subscription } from 'rxjs';
import { map, filter } from 'rxjs/operators';

const ACCIDENT_THRESHOLD = 60; // High G-force for crash detection
const ACCIDENT_TIMEOUT = 1000; // ms to prevent multiple triggers

export const useAccidentDetector = (onDetect: () => void, enabled: boolean = true) => {
  const lastDetectionTimeRef = useRef(0);
  const subscriptionRef = useRef<Subscription | null>(null);

  useEffect(() => {
    if (enabled) {
       subscriptionRef.current = accelerometer
        .pipe(
          map(({ x, y, z }) => Math.sqrt(x * x + y * y + z * z)),
          filter(force => force > ACCIDENT_THRESHOLD)
        )
        .subscribe(force => {
          const now = Date.now();
          if (now - lastDetectionTimeRef.current > ACCIDENT_TIMEOUT) {
            lastDetectionTimeRef.current = now;
            console.log('Accident detected with force:', force);
            onDetect();
          }
        });
    } else {
      subscriptionRef.current?.unsubscribe();
      subscriptionRef.current = null;
    }

    return () => {
      subscriptionRef.current?.unsubscribe();
    };
  }, [enabled, onDetect]);
};
