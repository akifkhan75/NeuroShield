import { useState, useCallback } from 'react';
import { Alert } from 'react-native';

export const useAudioRecorder = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioURL, setAudioURL] = useState('');

    const showNotImplemented = () => {
        Alert.alert("Feature Not Implemented", "Audio recording is not available in this version.");
    };

    const startRecording = useCallback(async () => {
        // This is a placeholder. A real implementation would need a native module.
        showNotImplemented();
    }, []);

    const stopRecording = useCallback(() => {
        // This is a placeholder.
        if(isRecording) {
            showNotImplemented();
        }
    }, [isRecording]);

    return { isRecording, audioURL, startRecording, stopRecording };
};
