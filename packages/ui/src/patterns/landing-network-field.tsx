"use client";

import { useEffect, useRef } from "react";

import { cn } from "@allaboard/ui/lib/utils";

import {
  createGlowRoutes,
  glowSamples,
  NETWORK_HEIGHT,
  NETWORK_LINKS_PATH,
  NETWORK_NODES_PATH,
  NETWORK_REST_TIME,
  NETWORK_WIDTH,
  type GlowRoute,
} from "./landing-network-geometry";

const SPRITE_SIZE = 64;
const GLOW_RADIUS = 7;
const MAX_PIXEL_RATIO = 2;
/** Same limits as the `.landing-network-field` mask: glows stop where the mesh has faded. */
const FADE_END_RATIO = 0.8;
const FADE_END_MAX = 2350;
const REACH_MARGIN = 120;

function createGlowSprite() {
  const sprite = document.createElement("canvas");
  sprite.width = SPRITE_SIZE;
  sprite.height = SPRITE_SIZE;
  const context = sprite.getContext("2d");
  if (!context) return null;
  const center = SPRITE_SIZE / 2;
  const gradient = context.createRadialGradient(center, center, 0, center, center, center);
  gradient.addColorStop(0, "rgb(240 255 248 / 1)");
  gradient.addColorStop(0.18, "rgb(110 231 183 / 0.85)");
  gradient.addColorStop(0.5, "rgb(52 211 153 / 0.2)");
  gradient.addColorStop(1, "rgb(52 211 153 / 0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
  return sprite;
}

/**
 * Motion background for the marketing landing: a hexagon mesh drawn at a fixed
 * scale from the left edge, with small glows flowing through it.
 */
export function LandingNetworkField({ className }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const meshRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const mesh = meshRef.current;
    const canvas = canvasRef.current;
    if (!root || !mesh || !canvas || typeof ResizeObserver === "undefined") return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let context: CanvasRenderingContext2D | null = null;
    let sprite: HTMLCanvasElement | null = null;
    let routes: readonly GlowRoute[] = [];
    let scale = 1;
    let width = 0;
    let height = 0;
    let frameId = 0;
    let startedAt = 0;

    const draw = (time: number) => {
      if (!context || !sprite) return;
      context.clearRect(0, 0, width, height);
      for (const route of routes) {
        const radius = GLOW_RADIUS * route.size;
        for (const sample of glowSamples(route, time)) {
          context.globalAlpha = sample.strength;
          context.drawImage(
            sprite,
            sample.x * scale - radius,
            sample.y * scale - radius,
            radius * 2,
            radius * 2,
          );
        }
      }
    };

    const measure = () => {
      const box = root.getBoundingClientRect();
      const meshWidth = mesh.getBoundingClientRect().width;
      if (box.width === 0 || meshWidth === 0) return false;

      width = box.width;
      height = box.height;
      scale = meshWidth / NETWORK_WIDTH;

      const ratio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);

      context ??= canvas.getContext("2d");
      sprite ??= createGlowSprite();
      if (!context) return false;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.globalCompositeOperation = "lighter";

      const fadeEnd = Math.min(width * FADE_END_RATIO, FADE_END_MAX);
      routes = createGlowRoutes(fadeEnd / scale + REACH_MARGIN, height / scale);
      return true;
    };

    const tick = (now: number) => {
      draw((now - startedAt) / 1000);
      frameId = requestAnimationFrame(tick);
    };

    const sync = () => {
      cancelAnimationFrame(frameId);
      if (motion.matches) {
        draw(NETWORK_REST_TIME);
        return;
      }
      startedAt = performance.now();
      frameId = requestAnimationFrame(tick);
    };

    const observer = new ResizeObserver(() => {
      if (measure() && motion.matches) draw(NETWORK_REST_TIME);
    });

    measure();
    sync();
    observer.observe(root);
    motion.addEventListener("change", sync);

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      motion.removeEventListener("change", sync);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      data-testid="landing-network-field"
      className={cn("landing-network-field", className)}
    >
      <svg
        ref={meshRef}
        className="landing-network-mesh"
        viewBox={`0 0 ${NETWORK_WIDTH} ${NETWORK_HEIGHT}`}
        fill="none"
        aria-hidden
      >
        <path
          data-kind="links"
          d={NETWORK_LINKS_PATH}
          stroke="rgb(148 163 184 / 0.3)"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
        <path
          data-kind="nodes"
          d={NETWORK_NODES_PATH}
          stroke="rgb(213 218 227 / 0.38)"
          strokeWidth={1.25}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <canvas ref={canvasRef} data-testid="landing-network-glows" className="absolute inset-0 size-full" />
    </div>
  );
}
