import { useState, useRef, useCallback } from 'react';

export const useAudioRecorder = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioURL, setAudioURL] = useState('');
    const mediaRecorderRef = useRef<any>(null);
    const audioChunksRef = useRef<any[]>([]);

    const startRecording = useCallback(async () => {
        try {
            const nav = typeof navigator !== 'undefined' ? (navigator as any) : null;
            if (!nav?.mediaDevices?.getUserMedia) return;
            const stream = await nav.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new (window as any).MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            
            mediaRecorder.ondataavailable = (event: any) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' } as any);
                const audioUrl = URL.createObjectURL(audioBlob);
                setAudioURL(audioUrl);
                audioChunksRef.current = [];
                // Stop all tracks to release the microphone
                stream.getTracks().forEach((track: any) => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setAudioURL('');
        } catch (err) {
            console.error('Failed to start recording:', err);
        }
    }, []);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    }, []);

    return { isRecording, audioURL, startRecording, stopRecording };
};
