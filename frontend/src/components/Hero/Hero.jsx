import React, { useState, useRef, useCallback } from 'react';
import { ArrowUpRight } from 'lucide-react';
import './Hero.css';

export default function Hero({ onEnter }) {
  const rootRef = useRef(null);
  const [exiting, setExiting] = useState(false);

  /* ── Mouse-following gradient ──────────────────────────────────────── */
  const handleMouseMove = useCallback((e) => {
    const el = rootRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty('--mouse-x', `${x}%`);
    el.style.setProperty('--mouse-y', `${y}%`);
  }, []);

  /* ── CTA handler with exit animation ───────────────────────────────── */
  const handleEnter = useCallback(() => {
    setExiting(true);
    setTimeout(() => {
      if (onEnter) onEnter();
    }, 480);
  }, [onEnter]);

  return (
    <div
      ref={rootRef}
      className={`hero-root${exiting ? ' hero-exit' : ''}`}
      onMouseMove={handleMouseMove}
    >
      {/* Background image with dark overlay (Aero-style) */}
      <div className="hero-bg-image" />

      {/* Architectural column grid overlay (Aero-style) */}
      <div className="hero-column-grid">
        <div className="hero-column-grid-cell" />
        <div className="hero-column-grid-cell" />
        <div className="hero-column-grid-cell" />
        <div className="hero-column-grid-cell" />
        <div className="hero-column-grid-cell" />
      </div>

      {/* Subtle technical grid */}
      <div className="hero-grid" />

      {/* Mouse-following gradient */}
      <div className="hero-mouse-gradient" />

      {/* Vignette */}
      <div className="hero-vignette" />

      {/* Floating particles */}
      <div className="hero-particles">
        <div className="hero-particle" />
        <div className="hero-particle" />
        <div className="hero-particle hero-particle--accent" />
        <div className="hero-particle" />
        <div className="hero-particle hero-particle--accent" />
        <div className="hero-particle" />
      </div>

      {/* Corner technical markers */}
      <span className="hero-marker hero-marker--tl">SYS::GEMSTONES_v1.0</span>
      <span className="hero-marker hero-marker--tr">STATUS: OPERATIONAL</span>
      <span className="hero-marker hero-marker--bl">NODE: PROCUREMENT.AI</span>
      <span className="hero-marker hero-marker--br">SIH.2026 // PROTO</span>

      {/* Accent line */}
      <div className="hero-accent-line" />

      {/* Content */}
      <div className="hero-content">
        {/* Eyebrow */}
        <div className="hero-eyebrow">
          <span className="hero-eyebrow-dot" />
          AI-POWERED PROCUREMENT COMPLIANCE
        </div>

        {/* Headline */}
        <h1 className="hero-headline">
          <span className="hero-headline-line">Verify Smarter.</span>
          <span className="hero-headline-line hero-headline-line--accent">
            Procure With Confidence.
          </span>
        </h1>

        {/* Description */}
        <p className="hero-description">
          AI-powered bid compliance verification for GeM procurement — helping
          officers identify document inconsistencies, statutory compliance gaps,
          and high-risk bidders faster.
        </p>

        {/* CTA — Aero-style split pill + circle with double-arrow animation */}
        <button className="hero-cta" onClick={handleEnter}>
          <span className="hero-cta-text">Enter Dashboard</span>
          <span className="hero-cta-icon">
            <ArrowUpRight size={18} className="hero-cta-arrow-out" />
            <ArrowUpRight size={18} className="hero-cta-arrow-in" />
          </span>
        </button>
      </div>

      {/* Bottom tagline */}
      <div className="hero-tagline">
        DOCUMENT AI
        <span className="hero-tagline-separator">•</span>
        MULTI-REGISTRY VERIFICATION
        <span className="hero-tagline-separator">•</span>
        RISK INTELLIGENCE
      </div>
    </div>
  );
}
