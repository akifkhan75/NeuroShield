
// NOTE: This hook would require a library like 'react-native-sensors'
// For this conversion, the logic is adapted but the library is not added to package.json
// to keep it simple. If you were to implement this, you would add `react-native-sensors`.

import { useEffect, useRef } from 'react';
import { accelerometer } from 'react-native-sensors';
import { Subscription } from 'rxjs';
import { map, filter } from 'rxjs/operators';


const SHAKE_THRESHOLD = 15; // Adjusted for react-native-sensors sensitivity
const SHAKE_TIMEOUT = 500;

export const useShakeDetector = (onShake: () => void, enabled: boolean = true) => {
  const lastShakeTimeRef = useRef(Date.now());
  const subscriptionRef = useRef<Subscription | null>(null);

  useEffect(() => {
    if (enabled) {
      subscriptionRef.current = accelerometer
        .pipe(
          map(({ x, y, z }) => Math.sqrt(x * x + y * y + z * z)),
          filter(speed => speed > SHAKE_THRESHOLD)
        )
        .subscribe(speed => {
          const now = Date.now();
          if (now - lastShakeTimeRef.current > SHAKE_TIMEOUT) {
            lastShakeTimeRef.current = now;
            console.log('Shake detected with speed:', speed);
            onShake();
          }
        });
    } else {
      subscriptionRef.current?.unsubscribe();
      subscriptionRef.current = null;
    }

    return () => {
      subscriptionRef.current?.unsubscribe();
    };
  }, [enabled, onShake]);
};