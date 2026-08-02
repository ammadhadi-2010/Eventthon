import React, { useEffect, useRef, useState } from 'react';
import WebGLFluid from 'webgl-fluid';

const FLUID_OPTIONS = {
  TRIGGER: 'hover',
  IMMEDIATE: false,
  AUTO: false,
  INTERVAL: 0,
  TRANSPARENT: true,
  COLORFUL: true,
  PAUSED: false,
  SHADING: true,
  BLOOM: true,
  SUNRAYS: false,
  SIM_RESOLUTION: 64,
  DYE_RESOLUTION: 512,
  CAPTURE_RESOLUTION: 256,
  DENSITY_DISSIPATION: 0.85,
  VELOCITY_DISSIPATION: 0.45,
  PRESSURE: 0.75,
  PRESSURE_ITERATIONS: 16,
  CURL: 24,
  SPLAT_RADIUS: 0.22,
  SPLAT_FORCE: 4500,
  COLOR_UPDATE_SPEED: 12,
  BACK_COLOR: { r: 0, g: 0, b: 0 },
};

function canUseFluidEffect() {
  if (typeof window === 'undefined') return false;
  if (!window.WebGLRenderingContext) return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  return true;
}

function syncCanvasSize(canvas, container) {
  const rect = container.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.floor(rect.width * dpr));
  canvas.height = Math.max(1, Math.floor(rect.height * dpr));
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;
}

export default function TeamMemberFluidPortrait({
  imageSrc = '',
  alt = '',
  fallback = null,
  className = '',
}) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const [hovering, setHovering] = useState(false);
  const [fluidReady, setFluidReady] = useState(false);
  const [imageBroken, setImageBroken] = useState(false);
  const enabled = canUseFluidEffect();
  const showImage = Boolean(imageSrc) && !imageBroken;

  // Init once — re-init on every hover left dangling listeners → Ke(undefined).down crash
  useEffect(() => {
    if (!enabled) return undefined;

    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return undefined;

    let cancelled = false;
    syncCanvasSize(canvas, wrap);

    try {
      WebGLFluid(canvas, FLUID_OPTIONS);
      if (!cancelled) setFluidReady(true);
    } catch {
      if (!cancelled) setFluidReady(false);
    }

    const resize = () => {
      try {
        syncCanvasSize(canvas, wrap);
      } catch {
        /* ignore */
      }
    };
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    observer?.observe(wrap);
    window.addEventListener('resize', resize);

    return () => {
      cancelled = true;
      observer?.disconnect();
      window.removeEventListener('resize', resize);
      setFluidReady(false);
    };
  }, [enabled]);

  useEffect(() => {
    setImageBroken(false);
  }, [imageSrc]);

  return (
    <div
      ref={wrapRef}
      className={`team-fluid-portrait ${className}`.trim()}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setHovering(true)}
      onBlur={() => setHovering(false)}
      tabIndex={enabled ? 0 : -1}
      aria-label={alt ? `${alt} interactive portrait` : 'Team member portrait'}
    >
      <div className="team-fluid-portrait__media" aria-hidden={Boolean(alt)}>
        {showImage ? (
          <img
            src={imageSrc}
            alt={alt}
            className="team-fluid-portrait__image"
            draggable={false}
            onError={() => setImageBroken(true)}
          />
        ) : (
          fallback
        )}
      </div>
      {enabled ? (
        <canvas
          ref={canvasRef}
          className={`team-fluid-portrait__canvas${fluidReady && hovering ? ' is-active' : ''}`}
          aria-hidden
        />
      ) : null}
    </div>
  );
}
