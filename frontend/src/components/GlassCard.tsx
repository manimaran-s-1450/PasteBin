import React from 'react';

/**
 * GlassCard Component
 * --------------------------------------------------------------------------
 * Purpose:
 * Reusable glassmorphism card container with subtle borders, top ambient line gradient,
 * backdrop blur, and dark theme background.
 * --------------------------------------------------------------------------
 */

export interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  gradientTopLine?: boolean;
}
export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  gradientTopLine = true
}) => {
  return (
    <div className={`relative bg-slate-900/75 backdrop-blur-2xl border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7),0_0_50px_rgba(139,92,246,0.15)] overflow-hidden ${className}`}>
      {gradientTopLine && (
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-600 via-purple-400 to-pink-500" />
      )}
      {children}
    </div>
  );
};

export default GlassCard;
