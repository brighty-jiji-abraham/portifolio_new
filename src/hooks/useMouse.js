import { useEffect, useRef } from 'react';

/**
 * Tracks the pointer with one global listener.
 * Returns a ref of `{ x, y, nx, ny }` (px and -1..1 normalised),
 * AND writes CSS custom properties on the document root:
 *   --mx-px, --my-px      pixel coords
 *   --mx-pct, --my-pct    0..100% across the viewport
 *   --mx-n, --my-n        -1..1 normalised
 *
 * Use the ref for rAF-driven loops (no React re-render).
 * Use the CSS vars for purely-visual effects.
 */
export const useMouse = () => {
    const ref = useRef({ x: 0, y: 0, nx: 0, ny: 0 });

    useEffect(() => {
        const root = document.documentElement;
        const onMove = (e) => {
            const w = window.innerWidth || 1;
            const h = window.innerHeight || 1;
            const x = e.clientX;
            const y = e.clientY;
            const px = (x / w) * 100;
            const py = (y / h) * 100;
            ref.current.x = x;
            ref.current.y = y;
            ref.current.nx = (x / w) * 2 - 1;
            ref.current.ny = (y / h) * 2 - 1;
            root.style.setProperty('--mx-px', `${x}px`);
            root.style.setProperty('--my-px', `${y}px`);
            root.style.setProperty('--mx-pct', `${px}%`);
            root.style.setProperty('--my-pct', `${py}%`);
            root.style.setProperty('--mx-n', String(ref.current.nx));
            root.style.setProperty('--my-n', String(ref.current.ny));
            // Pre-computed degree values for CSS rotateX/rotateY (no @property needed)
            root.style.setProperty('--mx-tilt', `${ref.current.nx * 5}deg`);
            root.style.setProperty('--my-tilt', `${ref.current.ny * -4}deg`);
        };
        window.addEventListener('pointermove', onMove, { passive: true });
        return () => window.removeEventListener('pointermove', onMove);
    }, []);

    return ref;
};
