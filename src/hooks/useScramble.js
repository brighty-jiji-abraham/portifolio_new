import { useCallback, useEffect, useRef } from 'react';

const CHARS = '!<>-_\\/[]{}—=+*^?#________';

/**
 * Hover-triggered character scramble.
 * Wire onMouseEnter (or onFocus) to `scramble`.
 * Element must have a stable text content; we mutate textContent.
 */
export const useScramble = (text, { duration = 600 } = {}) => {
    const elRef = useRef(null);
    const rafRef = useRef(0);
    const queueRef = useRef([]);
    const frameRef = useRef(0);
    const runningRef = useRef(false);

    useEffect(() => {
        if (elRef.current) elRef.current.textContent = text;
        return () => cancelAnimationFrame(rafRef.current);
    }, [text]);

    const scramble = useCallback(() => {
        if (runningRef.current) return;
        runningRef.current = true;
        const el = elRef.current;
        if (!el) return;
        const oldText = el.textContent || '';
        const newText = text;
        const length = Math.max(oldText.length, newText.length);
        const totalFrames = Math.max(20, Math.round(duration / 16));
        const queue = [];
        for (let i = 0; i < length; i++) {
            const from = oldText[i] || '';
            const to = newText[i] || '';
            const start = Math.floor(Math.random() * (totalFrames * 0.4));
            const end = start + Math.floor(Math.random() * (totalFrames * 0.6)) + 4;
            queue.push({ from, to, start, end, char: '' });
        }
        queueRef.current = queue;
        frameRef.current = 0;

        const update = () => {
            let output = '';
            let complete = 0;
            const queueArr = queueRef.current;
            for (let i = 0; i < queueArr.length; i++) {
                const q = queueArr[i];
                const f = frameRef.current;
                if (f >= q.end) {
                    complete++;
                    output += q.to;
                } else if (f >= q.start) {
                    if (!q.char || Math.random() < 0.28) {
                        q.char = CHARS[Math.floor(Math.random() * CHARS.length)];
                    }
                    output += q.char;
                } else {
                    output += q.from;
                }
            }
            if (el) el.textContent = output;
            if (complete === queueArr.length) {
                runningRef.current = false;
                return;
            }
            frameRef.current++;
            rafRef.current = requestAnimationFrame(update);
        };
        rafRef.current = requestAnimationFrame(update);
    }, [text, duration]);

    return [elRef, scramble];
};
