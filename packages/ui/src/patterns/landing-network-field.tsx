"use client";

import { useEffect, useId, useRef } from "react";

import { cn } from "@allaboard/ui/lib/utils";

import { landingNetworkFrame, type NetworkFrame } from "./landing-network-geometry";

const REST_FRAME = landingNetworkFrame(0);

const STROKE_WIDTH = {
  pod: 2.35,
  link: 2.05,
} as const;

function applyFrame(group: SVGGElement, frame: NetworkFrame) {
  for (const item of frame.drawables) {
    const node = group.querySelector<SVGPathElement>(
      `[data-network-id="${item.id}"]`,
    );
    if (!node) continue;
    node.setAttribute("d", item.d);
  }
  for (const signal of frame.signals) {
    const line = group.querySelector<SVGLineElement>(
      `[data-signal="${signal.id}"]`,
    );
    const head = group.querySelector<SVGCircleElement>(
      `[data-signal-head="${signal.id}"]`,
    );
    const opacity = signal.opacity.toFixed(3);
    if (line) {
      line.setAttribute("x1", String(signal.x1));
      line.setAttribute("y1", String(signal.y1));
      line.setAttribute("x2", String(signal.x2));
      line.setAttribute("y2", String(signal.y2));
      line.setAttribute("opacity", opacity);
    }
    if (head) {
      head.setAttribute("cx", String(signal.cx));
      head.setAttribute("cy", String(signal.cy));
      head.setAttribute("opacity", opacity);
    }
  }
}

/**
 * Animated geometric network for the marketing landing — indigo/fuchsia
 * strokes, pods breathe lightly, brand-colored signals on the spine.
 */
export function LandingNetworkField({ className }: { className?: string }) {
  const rawId = useId().replace(/:/g, "");
  const uid = `network-${rawId}`;
  const groupRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = window.matchMedia("(pointer: coarse)");
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const startedAt = performance.now();
    let frameId = 0;
    let running = true;

    const onMove = (event: PointerEvent) => {
      if (motion.matches || coarse.matches) return;
      pointer.tx = (event.clientX / window.innerWidth - 0.5) * -22;
      pointer.ty = (event.clientY / window.innerHeight - 0.5) * -14;
    };

    const tick = (now: number) => {
      if (!running) return;
      const reduced = motion.matches;
      const frame = reduced
        ? REST_FRAME
        : landingNetworkFrame((now - startedAt) / 1000);
      applyFrame(group, frame);

      if (!reduced && !coarse.matches) {
        pointer.x += (pointer.tx - pointer.x) * 0.055;
        pointer.y += (pointer.ty - pointer.y) * 0.055;
        group.setAttribute(
          "transform",
          `translate(${pointer.x.toFixed(2)} ${pointer.y.toFixed(2)})`,
        );
      } else {
        group.removeAttribute("transform");
      }

      if (!reduced) frameId = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    frameId = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(frameId);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <svg
      data-testid="landing-network-field"
      className={cn("h-full w-full", className)}
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMaxYMid slice"
      fill="none"
      aria-hidden
    >
      <defs>
        <linearGradient
          id={`${uid}-stroke`}
          gradientUnits="userSpaceOnUse"
          x1="620"
          y1="420"
          x2="1580"
          y2="500"
        >
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
          <stop offset="35%" stopColor="#818cf8" stopOpacity="0.78" />
          <stop offset="58%" stopColor="#a78bfa" stopOpacity="0.92" />
          <stop offset="100%" stopColor="#ec4899" stopOpacity="0.95" />
        </linearGradient>
        <filter
          id={`${uid}-glow`}
          filterUnits="userSpaceOnUse"
          primitiveUnits="userSpaceOnUse"
          x="-40"
          y="-40"
          width="1680"
          height="980"
        >
          <feGaussianBlur stdDeviation="3.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g ref={groupRef}>
        {REST_FRAME.drawables.map((item) => (
          <path
            key={item.id}
            data-network-id={item.id}
            data-kind={item.kind}
            d={item.d}
            stroke={`url(#${uid}-stroke)`}
            strokeWidth={STROKE_WIDTH[item.kind]}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            opacity={item.opacity}
          />
        ))}
        {REST_FRAME.signals.map((signal) => (
          <g key={signal.id}>
            <line
              data-signal={signal.id}
              x1={signal.x1}
              y1={signal.y1}
              x2={signal.x2}
              y2={signal.y2}
              stroke={`url(#${uid}-stroke)`}
              strokeWidth="2.75"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              filter={`url(#${uid}-glow)`}
              opacity={signal.opacity}
            />
            <circle
              data-signal-head={signal.id}
              cx={signal.cx}
              cy={signal.cy}
              r="4.2"
              fill="#f9a8d4"
              opacity={signal.opacity}
            />
          </g>
        ))}
      </g>
    </svg>
  );
}
