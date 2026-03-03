"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useServerStatus } from "@/lib/useServerStatus";
import styles from "./landing.module.css";

/* ─────────────────────────────────────────────────────────────
   Floating letter helper — purely decorative background layer
───────────────────────────────────────────────────────────── */
const ASL_LETTERS = "ABCDEFGHIKLMNOPQRSTUVWXY".split("");

interface FloatingLetter {
  id: number;
  letter: string;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

function useFloatingLetters(count = 20): FloatingLetter[] {
  const [letters, setLetters] = useState<FloatingLetter[]>([]);
  useEffect(() => {
    setLetters(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        letter: ASL_LETTERS[i % ASL_LETTERS.length],
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 24 + Math.random() * 40,
        duration: 18 + Math.random() * 20,
        delay: Math.random() * 12,
        opacity: 0.04 + Math.random() * 0.07,
      }))
    );
  }, [count]);
  return letters;
}

/* ─────────────────────────────────────────────────────────────
   Server status badge
───────────────────────────────────────────────────────────── */
function ServerBadge() {
  const status = useServerStatus();
  // mounted guard — prevents the badge text from differing between
  // server render and first client render (hydration mismatch fix).
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const config = {
    connecting: {
      dot: "bg-yellow-400 animate-pulse",
      text: "text-yellow-300",
      label: "Connecting to server…",
    },
    connected: {
      dot: "bg-green-400 animate-pulse",
      text: "text-green-300",
      label: "Server ready",
    },
    disconnected: {
      dot: "bg-red-400",
      text: "text-red-300",
      label: "Server offline — run start.ps1 first",
    },
  }[mounted ? status : "connecting"];

  return (
    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-sky-500/20 backdrop-blur-sm">
      <span suppressHydrationWarning className={`w-2 h-2 rounded-full ${config.dot}`} />
      <span suppressHydrationWarning className={`text-sm font-medium ${config.text}`}>{config.label}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Feature card
───────────────────────────────────────────────────────────── */
interface FeatureCardProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  accentFrom: string;
  accentTo: string;
  tag?: string;
}

function FeatureCard({
  href,
  icon,
  title,
  subtitle,
  description,
  accentFrom,
  accentTo,
  tag,
}: FeatureCardProps) {
  return (
    <Link href={href} className="group relative block">
      <div
        className={`absolute -inset-0.5 rounded-2xl bg-gradient-to-br ${accentFrom} ${accentTo} opacity-0 group-hover:opacity-40 blur-md transition-all duration-500`}
      />
      <div className="relative flex flex-col gap-4 p-7 rounded-2xl bg-white/[0.05] border border-white/[0.09] backdrop-blur-sm hover:bg-white/[0.09] hover:border-white/[0.16] transition-all duration-300 cursor-pointer h-full">
        {tag && (
          <span className="self-start px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-white/60 border border-white/10">
            {tag}
          </span>
        )}
        <div
          className={`w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br ${accentFrom} ${accentTo} shadow-lg`}
        >
          {icon}
        </div>
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
          <p className="text-sm font-medium text-white/50 mb-3">{subtitle}</p>
          <p className="text-sm text-white/60 leading-relaxed">{description}</p>
        </div>
        <div className="mt-auto pt-2">
          <span className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r ${accentFrom} ${accentTo} text-white shadow-lg opacity-80 group-hover:opacity-100 group-hover:scale-[1.03] transition-all duration-300`}>
            Open
            <svg
              className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ─────────────────────────────────────────────────────────────
   Stat pill
───────────────────────────────────────────────────────────── */
function Stat({ value, label, color = "text-white" }: { value: string; label: string; color?: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className={`text-3xl font-bold ${color}`}>{value}</span>
      <span className="text-xs text-white/40 uppercase tracking-widest">{label}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Main landing page
───────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const floatingLetters = useFloatingLetters(20);

  return (
    <div className="relative w-screen min-h-screen bg-[#06091a] overflow-x-hidden">

      {/* Ambient gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className={`${styles.orb} ${styles.orb1}`} />
        <div className={`${styles.orb} ${styles.orb2}`} />
        <div className={`${styles.orb} ${styles.orb3}`} />
        <div className={`${styles.orb} ${styles.orb4}`} />
      </div>

      {/* Subtle grid */}
      <div className={`pointer-events-none absolute inset-0 ${styles.grid}`} aria-hidden="true" />

      {/* Floating letters */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {floatingLetters.map((l) => (
          <span
            key={l.id}
            className={styles.floatLetter}
            style={
              {
                "--fl-x": `${l.x}%`,
                "--fl-y": `${l.y}%`,
                "--fl-size": `${l.size}px`,
                "--fl-opacity": l.opacity,
                "--fl-dur": `${l.duration}s`,
                "--fl-delay": `${l.delay}s`,
              } as React.CSSProperties
            }
          >
            {l.letter}
          </span>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center px-6 pt-20 pb-24">

        {/* Brand pill */}
        <div className={`${styles.heroIn} mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-400/25 text-sky-300 text-sm font-medium`}>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 14a6 6 0 110-12 6 6 0 010 12z" />
          </svg>
          Real-time Sign Language Translation System
        </div>

        {/* Title */}
        <h1 className={`${styles.heroIn1} ${styles.heroTitle} text-center font-extrabold tracking-tight text-white`}>
          Sign Language
          <br />
          <span className={styles.gradientText}>Translation Studio</span>
        </h1>

        {/* Subtitle */}
        <p className={`${styles.heroIn2} mt-6 max-w-2xl text-center text-lg text-white/50 leading-relaxed`}>
          Bridging communication through AI — recognize sign language fingerspelling in real-time with your webcam, or watch a 3D avatar sign your words back.
        </p>

        {/* Server status */}
        <div className={`${styles.heroIn3} mt-8`}><ServerBadge /></div>

        {/* Stats */}
        <div className={`${styles.heroIn4} mt-14 flex flex-wrap justify-center items-center gap-8 sm:gap-12`}>
          <Stat value="26" label="Letters" color="text-sky-300" />
          <div className={styles.statDivider} />
          <Stat value="21" label="Hand Landmarks" color="text-violet-300" />
          <div className={styles.statDivider} />
          <Stat value="3D" label="Avatar Renderer" color="text-emerald-300" />
          <div className={styles.statDivider} />
          <Stat value="AI" label="LLM Powered" color="text-fuchsia-300" />
        </div>

        {/* Feature cards */}
        <div className={`${styles.heroIn5} mt-16 w-full max-w-3xl ${styles.cardGrid}`}>

          <FeatureCard
            href="/recognize"
            tag="Recommended"
            accentFrom="from-sky-500"
            accentTo="to-blue-600"
            icon={
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 10l4.553-2.069A1 1 0 0121 8.882V15.12a1 1 0 01-1.447.89L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
              </svg>
            }
            title="Fingerspell & Avatar"
            subtitle="Camera recognition + 3D signing"
            description="Full side-by-side experience: your webcam reads sign language fingerspelling while a 3D avatar signs your speech back in real-time."
          />

          <FeatureCard
            href="/express"
            accentFrom="from-violet-500"
            accentTo="to-fuchsia-600"
            icon={
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
            title="Express Mode"
            subtitle="Text → Sign Language 3D avatar"
            description="Type any English text and watch the 3D avatar translate it into signs with adjustable speed. LLM-powered Sign Gloss grammar conversion."
          />
        </div>

        {/* How it works */}
        <div className="mt-20 w-full max-w-5xl">
          <h2 className="text-center text-white/30 uppercase tracking-widest text-xs font-semibold mb-8">How it works</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { step:"01", color:"text-sky-400",     title:"Launch",  body:'Run server program ,the backend loads ML models automatically while Next.js starts on port.' },
              { step:"02", color:"text-violet-400",  title:"Connect", body:"The frontend connects to the Flask-SocketIO server on another port via WebSocket in real-time." },
              { step:"03", color:"text-emerald-400", title:"Sign",    body:"Hold your hand up to the camera to spell words, or speak to animate the 3D signing avatar." },
            ].map(({ step, color, title, body }) => (
              <div key={step} className={`flex flex-col gap-3 p-6 ${styles.stepCard}`}>
                <span className={`text-sm font-bold font-mono ${color}`}>{step}</span>
                <h3 className="text-base font-semibold text-white">{title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-20 flex flex-col items-center gap-2 text-sm">
          <p className={styles.footerText}>Sign Language Translation System ·</p>
          <p className={styles.footerText}>Next.js 14 · Flask-SocketIO · TensorFlow · Three.js · MediaPipe</p>
        </footer>
      </div>
    </div>
  );
}
