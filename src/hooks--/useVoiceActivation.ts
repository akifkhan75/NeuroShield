
// NOTE: This hook requires a library like '@react-native-voice/voice'.
// It has not been added to package.json to keep this simple.

import { useEffect, useState } from 'react';
import Voice, { SpeechResultsEvent, SpeechErrorEvent } from '@react-native-voice/voice';

const WAKE_PHRASES = ["hey guardian emergency", "hey guardian help", "help me guardian"];

export const useVoiceActivation = (onActivate: () => void, enabled: boolean) => {
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const onSpeechResults = (e: SpeechResultsEvent) => {
            if (e.value) {
                const transcript = e.value[0].toLowerCase();
                 if (WAKE_PHRASES.some(phrase => transcript.includes(phrase))) {
                    onActivate();
                }
            }
        };

        const onSpeechError = (e: SpeechErrorEvent) => {
            setError(e.error?.message || 'An unknown voice error occurred');
        };
        
        const onSpeechEnd = () => {
            setIsListening(false);
            if (enabled) {
                // Restart listening after a short delay
                setTimeout(startListening, 500);
            }
        };

        Voice.onSpeechResults = onSpeechResults;
        Voice.onSpeechError = onSpeechError;
        Voice.onSpeechEnd = onSpeechEnd;

        const startListening = async () => {
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
                 setIsListening(false);
            } catch (e: any) {
                setError(e.toString());
            }
        };

        if (enabled) {
            startListening();
        } else {
            stopListening();
        }

        return () => {
            Voice.destroy().then(Voice.removeAllListeners);
        };
    }, [enabled, onActivate]);

    return { isListening, error };
};