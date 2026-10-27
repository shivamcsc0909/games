import React, { useEffect, useState } from 'react';
import { Maximize2, RotateCcw, Smartphone } from 'lucide-react';

export const LandscapeGuard: React.FC = () => {
  const [isPortrait, setIsPortrait] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const checkOrientation = () => {
      // Check window aspect ratio and matchMedia
      const portraitQuery = window.matchMedia('(orientation: portrait)');
      const isWindowPortrait = window.innerHeight > window.innerWidth;
      setIsPortrait(portraitQuery.matches || isWindowPortrait);
    };

    checkOrientation();

    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, []);

  const handleToggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen request blocked or unsupported:', err);
    }
  };

  if (!isPortrait) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-cyber-dark/95 backdrop-blur-xl p-6 text-center select-none overflow-hidden">
      {/* Background glow lines */}
      <div className="absolute inset-0 grid-bg-pattern opacity-40 pointer-events-none" />

      {/* Cyber Frame Decorators */}
      <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-cyber-accent" />
      <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-cyber-accent" />
      <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-cyber-accent" />
      <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-cyber-accent" />

      {/* Animated Gyro-Tilting Device */}
      <div className="relative mb-8 flex items-center justify-center w-36 h-36">
        <div className="absolute inset-0 rounded-full bg-cyber-accent/15 blur-xl animate-pulse" />
        
        {/* Tilting Smartphone */}
        <div className="relative animate-tilt-phone flex items-center justify-center p-3 rounded-2xl border-2 border-cyber-accent/80 bg-cyber-card/90 shadow-[0_0_30px_rgba(0,240,255,0.4)]">
          <Smartphone className="w-16 h-16 text-cyber-accent" strokeWidth={1.5} />
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-1 bg-cyber-accent/50 rounded-full" />
        </div>

        {/* Orbiting rotation indicator */}
        <RotateCcw className="absolute -bottom-2 -right-2 w-8 h-8 text-cyber-gold animate-spin" style={{ animationDuration: '6s' }} />
      </div>

      {/* Title with Glow */}
      <div className="space-y-3 max-w-sm z-10">
        <div className="inline-block px-3 py-1 rounded-full text-xs font-mono tracking-wider uppercase bg-cyber-accent/10 border border-cyber-accent/30 text-cyber-accent mb-2">
          ORIENTATION GUARD ACTIVE
        </div>
        <h2 className="text-xl md:text-2xl font-display font-black tracking-wide text-white uppercase leading-snug">
          Rotate Device to <span className="text-cyber-accent underline decoration-cyber-accent/40">Landscape</span>
        </h2>
        <p className="text-xs md:text-sm text-slate-400 font-sans leading-relaxed">
          Tournament View requires landscape orientation for crisp board scaling, side HUD panels, and zero touch latency.
        </p>
      </div>

      {/* Fullscreen Toggle Action */}
      <button
        onClick={handleToggleFullscreen}
        className="mt-8 z-10 flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-cyber-accent/20 to-cyber-neon/20 hover:from-cyber-accent/30 hover:to-cyber-neon/30 border border-cyber-accent/40 text-cyber-accent text-sm font-semibold tracking-wide transition-all shadow-[0_0_20px_rgba(0,240,255,0.2)] active:scale-95"
      >
        <Maximize2 className="w-4 h-4" />
        {isFullscreen ? 'Exit Fullscreen' : 'Enable Tournament Fullscreen'}
      </button>

      <div className="mt-6 text-[11px] font-mono text-slate-500">
        AUTO-ADAPTS ON HARDWARE GYROSCOPE TILT
      </div>
    </div>
  );
};
