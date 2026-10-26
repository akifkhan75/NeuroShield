import { useEffect, useState } from 'react';
import { NativeModules } from 'react-native';

// "Lumo" is a coined word, so speech-to-text transcribes it inconsistently
// ("loomo", "luma", "lou mo"). Matching a single literal phrase would silently
// disable hands-free SOS for most users, so we look for any brand variant AND an
// intent word in the same utterance.
//
// UNVALIDATED: this list is a starting point, not a measurement. It must be tuned
// against real on-device transcripts before launch — a wake word that fails to
// fire is a safety defect, and one that over-fires causes alert fatigue.
// High-collision homophones ("limo", "lumen") are deliberately excluded.
const BRAND_VARIANTS = ['lumo', 'loomo', 'luma', 'lou mo', 'loom o'];
const INTENT_WORDS = ['emergency', 'help', 'sos'];

const isWakeUtterance = (transcript: string): boolean => {
    const t = transcript.toLowerCase();
    return BRAND_VARIANTS.some(brand => t.includes(brand)) && INTENT_WORDS.some(intent => t.includes(intent));
};

export const useVoiceActivation = (onActivate: () => void, enabled: boolean) => {
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Voice module is only available in custom dev clients / native builds, not standard Expo Go
        const isVoiceAvailable = !!NativeModules.Voice;
        if (!isVoiceAvailable) {
            if (enabled) {
                console.log('Voice activation is not supported in Expo Go (requires a custom development build).');
            }
            setIsListening(false);
            return;
        }

        let Voice: any;
        try {
            Voice = require('@react-native-voice/voice').default;
        } catch (e: any) {
            if (enabled) {
                setError('Voice recognition module failed to load: ' + e?.message);
            }
            return;
        }

        if (!Voice) return;

        const onSpeechResults = (e: any) => {
            // Check every alternative the recognizer returns, not just the top one:
            // a coined wake word is often ranked second or third.
            if (e.value?.some((alternative: string) => isWakeUtterance(alternative))) {
                onActivate();
            }
        };

        const onSpeechError = (e: any) => {
            setError(e.error?.message || 'An unknown voice error occurred');
            setIsListening(false);
        };
        
        const onSpeechEnd = () => {
            setIsListening(false);
            if (enabled) {
                setTimeout(startListening, 500);
            }
        };

        Voice.onSpeechResults = onSpeechResults;
        Voice.onSpeechError = onSpeechError;
        Voice.onSpeechEnd = onSpeechEnd;
        Voice.onSpeechStart = () => setIsListening(true);

        const startListening = async () => {
            if (!enabled) return;
            try {
                await Voice.start('en-US');
                setIsListening(true);
                setError(null);
            } catch (e: any) {
                setError(e.toString());
            }
        };

        const stopListening = async () => {
            try {
                await Voice.stop();
                await Voice.destroy();
                setIsListening(false);
            } catch (e: any) {
                console.error('Error stopping voice recognition:', e);
            }
        };

        if (enabled) {
            startListening();
        } else {
            stopListening();
        }

        return () => {
            try {
                Voice.destroy().then(Voice.removeAllListeners).catch((e: any) => console.error("Error destroying voice listener", e));
            } catch (e) {
                // ignore
            }
        };
    }, [enabled, onActivate]);

    return { isListening, error };
};

