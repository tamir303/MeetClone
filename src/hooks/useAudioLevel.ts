import { useEffect, useRef, useCallback } from 'react';
import { socketService } from '@/services/socket';

export const useAudioLevel = (stream: MediaStream | null, enabled = true) => {
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const intervalRef = useRef<number | null>(null);

    const cleanup = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (audioContextRef.current?.state !== 'closed') {
            audioContextRef.current?.close();
        }
        audioContextRef.current = null;
        analyserRef.current = null;
    }, []);

    useEffect(() => {
        if (!stream || !enabled) {
            cleanup();
            return;
        }

        const audioTrack = stream.getAudioTracks()[0];
        if (!audioTrack) {
            cleanup();
            return;
        }

        try {
            audioContextRef.current = new AudioContext();
            analyserRef.current = audioContextRef.current.createAnalyser();

            const source = audioContextRef.current.createMediaStreamSource(stream);
            source.connect(analyserRef.current);

            analyserRef.current.fftSize = 256;
            const bufferLength = analyserRef.current.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            intervalRef.current = window.setInterval(() => {
                if (!analyserRef.current) return;

                analyserRef.current.getByteFrequencyData(dataArray);

                const sum = dataArray.reduce((acc, value) => acc + value, 0);
                const average = sum / bufferLength;
                const normalizedLevel = average / 255;

                socketService.emit('audio-level', { level: normalizedLevel });
            }, 100);

        } catch (error) {
            console.error('Error setting up audio level monitoring:', error);
            cleanup();
        }

        return cleanup;
    }, [stream, enabled, cleanup]);

    useEffect(() => {
        return cleanup;
    }, [cleanup]);

    return { cleanup };
};