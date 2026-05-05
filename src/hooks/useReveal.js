import { useEffect, useRef, useState } from 'react';

/**
 * IntersectionObserver-based scroll trigger.
 * Returns a ref + boolean. Add `is-visible` class via the boolean.
 * Defaults stagger gracefully across the page.
 */
export const useReveal = ({ threshold = 0.18, once = true } = {}) => {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (typeof IntersectionObserver === 'undefined') {
            const id = setTimeout(() => setVisible(true), 0);
            return () => clearTimeout(id);
        }
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setVisible(true);
                        if (once) io.unobserve(entry.target);
                    } else if (!once) {
                        setVisible(false);
                    }
                });
            },
            { threshold, rootMargin: '0px 0px -10% 0px' },
        );
        io.observe(el);
        return () => io.disconnect();
    }, [threshold, once]);

    return [ref, visible];
};

/**
 * Tracks which section id is currently in view. Pass an array of ids.
 * Returns the currently active id (or the first if none active).
 */
export const useActiveSection = (ids) => {
    const [active, setActive] = useState(ids[0]);

    useEffect(() => {
        if (typeof IntersectionObserver === 'undefined') return;
        const observers = [];
        const visibility = new Map();

        ids.forEach((id) => {
            const el = document.getElementById(id);
            if (!el) return;
            const io = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        visibility.set(id, entry.intersectionRatio);
                    });
                    let bestId = ids[0];
                    let bestVal = 0;
                    visibility.forEach((val, key) => {
                        if (val > bestVal) {
                            bestVal = val;
                            bestId = key;
                        }
                    });
                    setActive(bestId);
                },
                { threshold: [0, 0.25, 0.5, 0.75, 1] },
            );
            io.observe(el);
            observers.push(io);
        });
        return () => observers.forEach((o) => o.disconnect());
    }, [ids]);

    return active;
};
