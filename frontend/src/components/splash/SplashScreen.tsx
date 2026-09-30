"use client";

import React, { useEffect, useState } from "react";
import { NexusLogo } from "@/components/ui/CoreComponents";

const LOADING_MESSAGES = [
  "Connecting to GenLayer",
  "Reading contract state",
  "Verifying network",
  "Loading SLA cases",
  "Synchronizing court records",
];

/**
 * Branded splash/loading screen for NexusSLA.
 * Shows animated Nexus Mark with orbital nodes and rotating status messages.
 */
export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const msgTimer = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 1200);

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          clearInterval(msgTimer);
          setTimeout(onComplete, 400);
          return 100;
        }
        return prev + 2;
      });
    }, 60);

    return () => {
      clearInterval(msgTimer);
      clearInterval(progressTimer);
    };
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center"
      style={{
        background: "radial-gradient(ellipse at center, #0A0A1A 0%, #050507 70%)",
      }}
    >
      {/* Background gradient orbs */}
      <div
        className="absolute w-96 h-96 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)",
          top: "20%",
          left: "30%",
          filter: "blur(60px)",
        }}
      />
      <div
        className="absolute w-64 h-64 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)",
          bottom: "20%",
          right: "25%",
          filter: "blur(40px)",
        }}
      />

      {/* Logo with orbiting nodes */}
      <div className="relative mb-10">
        <div className="relative w-32 h-32 flex items-center justify-center">
          {/* Orbital ring 1 */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border: "1px solid rgba(139, 92, 246, 0.15)",
              animation: "borderGlow 3s ease-in-out infinite",
            }}
          />
          {/* Orbital ring 2 */}
          <div
            className="absolute rounded-full"
            style={{
              inset: "-16px",
              border: "1px dashed rgba(139, 92, 246, 0.08)",
            }}
          />

          {/* Orbiting node 1 */}
          <div className="absolute animate-orbit" style={{ width: 0, height: 0, top: "50%", left: "50%" }}>
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{
                background: "#A78BFA",
                boxShadow: "0 0 10px rgba(167, 139, 250, 0.6)",
                transform: "translate(-50%, -50%)",
              }}
            />
          </div>

          {/* Orbiting node 2 */}
          <div className="absolute animate-orbit-reverse" style={{ width: 0, height: 0, top: "50%", left: "50%" }}>
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background: "#8B5CF6",
                boxShadow: "0 0 8px rgba(139, 92, 246, 0.6)",
                transform: "translate(-50%, -50%)",
              }}
            />
          </div>

          {/* Center logo */}
          <div className="animate-float">
            <NexusLogo size={56} />
          </div>
        </div>
      </div>

      {/* Product name */}
      <h1
        className="text-3xl font-bold tracking-tight mb-2 text-glow"
        style={{ color: "var(--text-primary)", letterSpacing: "-0.03em" }}
      >
        NexusSLA
      </h1>

      {/* Tagline */}
      <p
        className="text-sm font-medium mb-8"
        style={{ color: "var(--text-muted)", letterSpacing: "0.05em" }}
      >
        Autonomous SLA Dispute Court
      </p>

      {/* Progress bar */}
      <div
        className="w-48 h-0.5 rounded-full overflow-hidden mb-5"
        style={{ background: "rgba(255,255,255,0.06)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${progress}%`,
            background: "linear-gradient(90deg, #7C3AED, #A78BFA)",
            boxShadow: "0 0 12px rgba(139, 92, 246, 0.5)",
          }}
        />
      </div>

      {/* Loading message */}
      <p
        className="text-xs animate-fade-in"
        key={msgIndex}
        style={{ color: "var(--text-muted)" }}
      >
        {LOADING_MESSAGES[msgIndex]}...
      </p>

      {/* Subtle label */}
      <div
        className="absolute bottom-8 flex items-center gap-2"
        style={{ color: "var(--text-muted)", fontSize: "11px", letterSpacing: "0.08em" }}
      >
        <span style={{ opacity: 0.4 }}>POWERED BY</span>
        <span style={{ color: "var(--accent-secondary)", fontWeight: 600 }}>GENLAYER</span>
      </div>
    </div>
  );
}
