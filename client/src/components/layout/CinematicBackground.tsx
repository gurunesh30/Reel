import React from 'react';

/**
 * Cinematic Flowing Dark Crimson Background
 * Creates an organic, multi-layered flowing dark crimson gradient with floating ambient light orbs
 */
export function CinematicBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none -z-30 overflow-hidden select-none bg-crimson-flow-canvas"
    >
      {/* 1. Large Top-Left Crimson Flow Orb */}
      <div className="absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full bg-gradient-to-br from-[#9B111E]/55 via-[#C1121F]/30 to-transparent blur-[130px] ambient-flow-crimson-1 pointer-events-none" />

      {/* 2. Massive Bottom-Right Dark Crimson Deep Glow */}
      <div className="absolute -bottom-40 -right-40 w-[700px] h-[700px] rounded-full bg-gradient-to-tl from-[#7D111A]/60 via-[#E63946]/35 to-transparent blur-[150px] ambient-flow-crimson-2 pointer-events-none" />

      {/* 3. Center Mid-screen Floating Crimson Light */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[400px] rounded-full bg-gradient-to-r from-[#5A0C13]/40 via-[#9B111E]/25 to-transparent blur-[120px] ambient-flow-crimson-3 pointer-events-none" />

      {/* 4. Subtle Top-Right Ambient Accent */}
      <div className="absolute top-16 right-10 w-[420px] h-[420px] rounded-full bg-gradient-to-b from-[#C1121F]/25 via-red-950/40 to-transparent blur-[110px] ambient-flow-crimson-1 pointer-events-none" />

      {/* 5. Cinematic Vignette and Mesh Scrim */}
      <div className="absolute inset-0 bg-radial from-transparent via-[#0A0C10]/40 to-[#07080A]/85 pointer-events-none" />

      {/* 6. Subtle Horizontal Atmospheric Wave Lines */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(230, 57, 70, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(230, 57, 70, 0.4) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
    </div>
  );
}
