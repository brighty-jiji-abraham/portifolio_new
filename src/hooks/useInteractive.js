/* Lightweight pointer-driven micro-interactions — no library deps. */

import { useCallback } from 'react';

/**
 * Cursor-following spotlight. Updates --mx / --my on the element.
 * Pair with a CSS radial-gradient on ::after using those vars.
 */
export const useSpotlight = () => {
    const onMouseMove = useCallback((e) => {
        const el = e.currentTarget;
        const rect = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
        el.style.setProperty('--my', `${e.clientY - rect.top}px`);
    }, []);
    return { onMouseMove };
};

/**
 * 3D tilt that follows the cursor inside the element.
 * Updates --rx (rotateX) and --ry (rotateY).
 */
export const useTilt = (strength = 8) => {
    const onMouseMove = useCallback(
        (e) => {
            const el = e.currentTarget;
            const rect = el.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            el.style.setProperty('--rx', `${y * -strength}deg`);
            el.style.setProperty('--ry', `${x * strength}deg`);
        },
        [strength],
    );
    const onMouseLeave = useCallback((e) => {
        e.currentTarget.style.setProperty('--rx', '0deg');
        e.currentTarget.style.setProperty('--ry', '0deg');
    }, []);
    return { onMouseMove, onMouseLeave };
};

/**
 * Magnetic pull toward the cursor inside the element.
 * Updates --tx and --ty translate offsets.
 */
export const useMagnetic = (factor = 0.25) => {
    const onMouseMove = useCallback(
        (e) => {
            const el = e.currentTarget;
            const rect = el.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) * factor;
            const y = (e.clientY - rect.top - rect.height / 2) * factor;
            el.style.setProperty('--tx', `${x}px`);
            el.style.setProperty('--ty', `${y}px`);
        },
        [factor],
    );
    const onMouseLeave = useCallback((e) => {
        e.currentTarget.style.setProperty('--tx', '0px');
        e.currentTarget.style.setProperty('--ty', '0px');
    }, []);
    return { onMouseMove, onMouseLeave };
};
