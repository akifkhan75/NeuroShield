import { useEffect, useState } from 'react';
import Voice, { SpeechResultsEvent, SpeechErrorEvent } from '@react-native-voice/voice';

const WAKE_PHRASES = ["hey guardian emergency", "hey guardian help", "help me guardian"];

export const useVoiceActivation = (onActivate: () => void, enabled: boolean) => {
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // useEffect(() => {
    //     const onSpeechResults = (e: SpeechResultsEvent) => {
    //         if (e.value) {
    //             const transcript = e.value[0].toLowerCase();
    //              if (WAKE_PHRASES.some(phrase => transcript.includes(phrase))) {
    //                 onActivate();
    //             }
    //         }
    //     };

    //     const onSpeechError = (e: SpeechErrorEvent) => {
    //         setError(e.error?.message || 'An unknown voice error occurred');
    //         setIsListening(false);
    //     };
        
    //     const onSpeechEnd = () => {
    //         setIsListening(false);
    //         if (enabled) {
    //             setTimeout(startListening, 500);
    //         }
    //     };

    //     Voice.onSpeechResults = onSpeechResults;
    //     Voice.onSpeechError = onSpeechError;
    //     Voice.onSpeechEnd = onSpeechEnd;
    //     Voice.onSpeechStart = () => setIsListening(true);


    //     const startListening = async () => {
    //         if(!enabled) return;
    //         try {
    //             await Voice.start('en-US');
    //             setIsListening(true);
    //             setError(null);
    //         } catch (e: any) {
    //             setError(e.toString());
    //         }
    //     };

    //     const stopListening = async () => {
    //         try {
    //             await Voice.stop();
    //             await Voice.destroy();
    //             setIsListening(false);
    //         } catch (e: any) {
    //              // It's possible to get an error if stop is called when not listening
    //             console.error('Error stopping voice recognition:', e);
    //         }
    //     };

    //     if (enabled) {
    //         startListening();
    //     } else {
    //         stopListening();
    //     }

    //     return () => {
    //         Voice.destroy().then(Voice.removeAllListeners).catch(e => console.error("Error destroying voice listener", e));
    //     };
    // }, [enabled, onActivate]);

    return { isListening, error };
};
