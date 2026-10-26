import { useEffect, useState } from 'react';
import { NativeModules } from 'react-native';

const WAKE_PHRASES = ["hey guardian emergency", "hey guardian help", "help me guardian"];

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
            if (e.value) {
                const transcript = e.value[0].toLowerCase();
                if (WAKE_PHRASES.some((phrase: string) => transcript.includes(phrase))) {
                    onActivate();
                }
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

