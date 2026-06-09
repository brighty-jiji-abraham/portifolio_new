import { useState, useEffect } from 'react';
import './IntroSequence.css';
import { useSoundscape } from '../../hooks/useSoundscape';

const IntroSequence = ({ onComplete }) => {
    const [step, setStep] = useState(0);
    const { toggleMute } = useSoundscape();

    useEffect(() => {
        // Step 1: "Welcome to..."
        const t1 = setTimeout(() => setStep(1), 500);
        // Step 2: "Brighty Jiji Abraham"
        const t2 = setTimeout(() => setStep(2), 2000);
        // Step 3: Button appears
        const t3 = setTimeout(() => setStep(3), 3500);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
        };
    }, []);

    const handleEnter = () => {
        setStep(4); // Fading out state
        
        // Unmute the audio so it starts playing immediately!
        toggleMute();

        // Wait for the fade out transition to complete before unmounting
        setTimeout(() => {
            if (onComplete) onComplete();
        }, 2500);
    };

    if (step === 5) return null; // Fully unmounted

    return (
        <div className={`intro-sequence ${step === 4 ? 'is-fading-out' : ''}`}>
            <div className="intro-content">
                <div className={`intro-line ${step >= 1 ? 'is-visible' : ''}`}>
                    Welcome to the journey of
                </div>
                <div className={`intro-name ${step >= 2 ? 'is-visible' : ''}`}>
                    Brighty Jiji Abraham
                </div>
                
                <button 
                    className={`intro-button ${step >= 3 ? 'is-visible' : ''}`}
                    onClick={handleEnter}
                    disabled={step < 3 || step === 4}
                >
                    Enter Experience
                </button>
            </div>
        </div>
    );
};

export default IntroSequence;
