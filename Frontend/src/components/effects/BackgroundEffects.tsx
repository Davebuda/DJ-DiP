import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useReducedMotion, useIsTouch } from '../../hooks/useReducedMotion';

export const BackgroundEffects = () => {
  const reduced = useReducedMotion();
  const isTouch = useIsTouch();

  // Cursor tracking
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);
  const smoothX = useSpring(mouseX, { damping: 25, stiffness: 150 });
  const smoothY = useSpring(mouseY, { damping: 25, stiffness: 150 });

  // Secondary glow — trails behind with heavier damping
  const trailX = useSpring(mouseX, { damping: 50, stiffness: 60 });
  const trailY = useSpring(mouseY, { damping: 50, stiffness: 60 });

  const rafId = useRef(0);

  useEffect(() => {
    if (isTouch || reduced) return;

    const handleMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      cancelAnimationFrame(rafId.current);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isTouch, reduced, mouseX, mouseY]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Animated gradient orbs */}
      <div
        className="absolute -top-[200px] -left-[100px] h-[600px] w-[600px] rounded-full opacity-[0.09]"
        style={{
          background: 'radial-gradient(circle, rgba(255,107,53,0.6) 0%, transparent 70%)',
          filter: 'blur(80px)',
          animation: reduced ? 'none' : 'orb-drift-1 55s ease-in-out infinite',
        }}
      />
      <div
        className="absolute -bottom-[150px] -right-[100px] h-[500px] w-[500px] rounded-full opacity-[0.07]"
        style={{
          background: 'radial-gradient(circle, rgba(93,23,37,0.7) 0%, transparent 70%)',
          filter: 'blur(80px)',
          animation: reduced ? 'none' : 'orb-drift-2 42s ease-in-out infinite',
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full opacity-[0.025]"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 70%)',
          filter: 'blur(80px)',
          animation: reduced ? 'none' : 'orb-drift-3 50s ease-in-out infinite',
        }}
      />

      {/* Club light glow — cursor-following, large soft area with color cycling */}
      {!isTouch && !reduced && (
        <>
          {/* Primary glow — follows cursor */}
          <motion.div
            style={{
              x: smoothX,
              y: smoothY,
              translateX: '-50%',
              translateY: '-50%',
            }}
            className="fixed z-10"
          >
            <div
              style={{
                width: 1000,
                height: 1000,
                borderRadius: '50%',
                background:
                  'radial-gradient(circle, rgba(255,107,53,0.10) 0%, rgba(255,107,53,0.05) 30%, rgba(255,80,40,0.02) 55%, transparent 75%)',
                filter: 'blur(20px)',
                mixBlendMode: 'screen',
                animation: 'light-hue-cycle 12s ease-in-out infinite',
              }}
            />
          </motion.div>

          {/* Secondary glow — trails behind, different color tone */}
          <motion.div
            style={{
              x: trailX,
              y: trailY,
              translateX: '-50%',
              translateY: '-50%',
            }}
            className="fixed z-10"
          >
            <div
              style={{
                width: 800,
                height: 800,
                borderRadius: '50%',
                background:
                  'radial-gradient(circle, rgba(180,50,70,0.07) 0%, rgba(140,40,60,0.035) 30%, rgba(93,23,37,0.012) 55%, transparent 75%)',
                filter: 'blur(20px)',
                mixBlendMode: 'screen',
                animation: 'light-hue-cycle-alt 15s ease-in-out infinite',
              }}
            />
          </motion.div>
        </>
      )}
    </div>
  );
};
