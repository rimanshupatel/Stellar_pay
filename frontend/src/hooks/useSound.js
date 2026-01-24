import { useRef, useEffect } from 'react';
import successSound from '../assets/sounds/gulugulu_teacher.mp3';

export const useSound = () => {
    const audioRef = useRef(null);

    useEffect(() => {
        audioRef.current = new Audio(successSound);
    }, []);

    const playSuccess = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(error => {
                console.warn("Audio playback failed:", error);
            });
        }
    };

    return { playSuccess };
};
