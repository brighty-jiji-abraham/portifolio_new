import { useEffect, useRef } from 'react';
import './CustomCursor.css';

const INTERACTIVE_SELECTOR = 'a, button, input, textarea, select, [data-cursor]';

const CustomCursor = () => {
    const dotRef = useRef(null);
    const ringRef = useRef(null);

    useEffect(() => {
        // Skip on touch / pointer-coarse devices
        if (typeof window === 'undefined') return;
        const mql = window.matchMedia('(hover: hover) and (pointer: fine)');
        if (!mql.matches) return;

        const dot = dotRef.current;
        const ring = ringRef.current;
        if (!dot || !ring) return;

        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let ringX = mouseX;
        let ringY = mouseY;
        let rafId = 0;
        let visible = false;

        const showCursor = () => {
            if (visible) return;
            visible = true;
            dot.classList.add('is-visible');
            ring.classList.add('is-visible');
        };

        const hideCursor = () => {
            visible = false;
            dot.classList.remove('is-visible');
            ring.classList.remove('is-visible');
        };

        const onMove = (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
            showCursor();
        };

        const onDown = () => {
            ring.classList.add('is-active');
            dot.classList.add('is-active');
        };

        const onUp = () => {
            ring.classList.remove('is-active');
            dot.classList.remove('is-active');
        };

        const onOver = (e) => {
            if (e.target.closest && e.target.closest(INTERACTIVE_SELECTOR)) {
                ring.classList.add('is-hover');
            }
        };

        const onOut = (e) => {
            if (e.target.closest && e.target.closest(INTERACTIVE_SELECTOR)) {
                ring.classList.remove('is-hover');
            }
        };

        const tick = () => {
            ringX += (mouseX - ringX) * 0.18;
            ringY += (mouseY - ringY) * 0.18;
            ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
            rafId = requestAnimationFrame(tick);
        };
        rafId = requestAnimationFrame(tick);

        window.addEventListener('pointermove', onMove, { passive: true });
        window.addEventListener('pointerdown', onDown);
        window.addEventListener('pointerup', onUp);
        document.addEventListener('mouseover', onOver);
        document.addEventListener('mouseout', onOut);
        document.addEventListener('mouseleave', hideCursor);
        document.addEventListener('mouseenter', showCursor);
        document.body.classList.add('has-custom-cursor');

        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerdown', onDown);
            window.removeEventListener('pointerup', onUp);
            document.removeEventListener('mouseover', onOver);
            document.removeEventListener('mouseout', onOut);
            document.removeEventListener('mouseleave', hideCursor);
            document.removeEventListener('mouseenter', showCursor);
            document.body.classList.remove('has-custom-cursor');
        };
    }, []);

    return (
        <>
            <div ref={dotRef} className="cursor-dot" aria-hidden="true"></div>
            <div ref={ringRef} className="cursor-ring" aria-hidden="true"></div>
        </>
    );
};

export default CustomCursor;
