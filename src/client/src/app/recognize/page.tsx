"use client";

import React from "react";
import "regenerator-runtime/runtime";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

import Camera, { CameraBrowserHandle } from "../components/CameraBrowser";
import { Slider } from "@/ui/components/Slider";
import Checkbox from "@/ui/components/Checkbox";
import Transcription from "../components/Transcription";
import Visualization from "../components/Visualization";
import socket from "../socket";

export default function RecognizePage() {
  const wordAnimationsToPlay = useRef<any>([]);
  const [currentWord, setCurrentWord] = useState<string>("");
  const { transcript, resetTranscript, listening } = useSpeechRecognition();
  const [signingSpeed, setSigningSpeed] = useState<number>(50);
  const [ASLTranscription, setASLTranscription] = useState("");

  // Feature state
  const cameraRef = useRef<CameraBrowserHandle>(null);
  const [cameraPaused, setCameraPaused] = useState(false);
  const [autocorrect, setAutocorrect] = useState(true);
  const [serverConnected, setServerConnected] = useState(false);
  // mounted is false on the server — guarantees the initial HTML matches
  // what the client renders before any socket events fire (hydration fix).
  const [mounted, setMounted] = useState(false);

  // ── Mount guard (prevents hydration mismatch) ──
  useEffect(() => {
    setMounted(true);
  }, []);

  // ── Socket listeners ──
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server");
      setServerConnected(true);
    });

    socket.on("disconnect", () => {
      setServerConnected(false);
    });

    socket.on("R-TRANSCRIPTION", (data) => {
      setASLTranscription(data);
    });

    socket.on("E-ANIMATION", (animations) => {
      wordAnimationsToPlay.current = [
        ...wordAnimationsToPlay.current,
        ...animations,
      ];
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("R-TRANSCRIPTION");
      socket.off("E-ANIMATION");
    };
  }, []);

  // ── Send autocorrect preference to server whenever it changes ──
  useEffect(() => {
    socket.emit("set-autocorrect", { enabled: autocorrect });
  }, [autocorrect]);

  // ── Speech → ASL animation ──
  useEffect(() => {
    const timeout = setTimeout(() => {
      socket.emit("E-REQUEST-ANIMATION", transcript.toLowerCase());
      resetTranscript();
    }, 2000);

    return () => {
      clearTimeout(timeout);
    };
  }, [transcript]);

  function getNextWord(): string | null {
    if (!wordAnimationsToPlay.current.length) {
      return null;
    }
    let animation = wordAnimationsToPlay.current.shift();
    setCurrentWord(animation[0]);
    return animation[1];
  }

  function clear() {
    socket.emit("R-CLEAR-TRANSCRIPTION");
    setASLTranscription("");
  }

  // ── Pause / Resume webcam ──
  function toggleCamera() {
    if (cameraRef.current?.isPaused()) {
      cameraRef.current.resume();
      setCameraPaused(false);
    } else {
      cameraRef.current?.pause();
      setCameraPaused(true);
    }
  }

  // ── Stop / Start listening ──
  function toggleListening() {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      SpeechRecognition.startListening({ continuous: true });
    }
  }

  return (
    <div className="w-screen h-screen flex flex-col bg-black">
      {/* ── Top Nav Bar ── */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-black/60 backdrop-blur-sm">
        <Link
          href="/"
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors duration-200"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="text-sm">Back to Home</span>
        </Link>

        <div className="flex items-center gap-3">
          <h1 className="text-white font-semibold text-lg tracking-wide">
            Sign Translation Studio
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span
            suppressHydrationWarning
            className={`inline-block w-2 h-2 rounded-full ${
              !mounted
                ? "bg-yellow-400 animate-pulse"
                : serverConnected
                ? "bg-green-400 animate-pulse"
                : "bg-red-400"
            }`}
          />
          <span suppressHydrationWarning className="text-sm text-white/60">
            {!mounted
              ? "Connecting…"
              : serverConnected
              ? "Server Connected"
              : "Server Disconnected"}
          </span>
        </div>
      </div>

      {/* ── Main Panels ── */}
      <div className="flex flex-row gap-4 p-4 flex-1 overflow-hidden">
        {/* ════ LEFT PANEL: ASL Fingerspell → English ════ */}
        <div className="flex flex-col gap-3 items-center flex-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <h2 className="text-xl text-white font-medium">
              Fingerspell → English
            </h2>
          </div>
          <div className="border border-white/20 w-full h-full flex-col flex rounded-xl overflow-hidden">
            <Camera ref={cameraRef} />
            <Transcription content={ASLTranscription} />
            <div className="py-3 px-4 flex items-center justify-end gap-4 bg-white/5">
              <Checkbox
                label="Autocorrect"
                checked={autocorrect}
                onChange={setAutocorrect}
              />
              <div
                onClick={toggleCamera}
                className={`px-4 py-1.5 border-opacity-20 border rounded-lg transition duration-200 cursor-pointer select-none ${
                  cameraPaused
                    ? "bg-green-600/80 border-green-400 hover:bg-green-500"
                    : "bg-red-600/80 border-red-400 hover:bg-red-500"
                }`}
              >
                <p className="text-white text-sm font-medium">
                  {cameraPaused ? "Resume Camera" : "Pause Camera"}
                </p>
              </div>
              <div
                onClick={clear}
                className="px-4 py-1.5 border-white/20 border rounded-lg hover:bg-white/10 transition duration-200 cursor-pointer select-none"
              >
                <p className="text-white text-sm font-medium">Clear</p>
              </div>
            </div>
          </div>
        </div>

        {/* ════ RIGHT PANEL: English → ASL Avatar ════ */}
        <div className="flex flex-col gap-3 items-center flex-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <h2 className="text-xl text-white font-medium">
              English → Sign Language Avatar
            </h2>
          </div>
          <div className="border border-white/20 w-full h-full flex-col flex rounded-xl overflow-hidden">
            <Visualization
              signingSpeed={signingSpeed}
              getNextWord={getNextWord}
              currentWord={currentWord}
            />
            <Transcription content={transcript} />
            <div className="py-3 px-4 flex flex-col items-start gap-2 bg-white/5">
              <div className="flex items-center justify-between w-full">
                <p className="text-base text-white font-medium">
                  Signing Speed
                </p>
                <div className="flex items-center gap-3">
                  <div
                    onClick={toggleListening}
                    className={`px-4 py-1.5 border-opacity-20 border rounded-lg transition duration-200 cursor-pointer select-none ${
                      listening
                        ? "bg-red-600/80 border-red-400 hover:bg-red-500"
                        : "bg-green-600/80 border-green-400 hover:bg-green-500"
                    }`}
                  >
                    <p className="text-white text-sm font-medium">
                      {listening ? "Stop Listening" : "Start Listening"}
                    </p>
                  </div>
                  <Checkbox label="Sign Gloss" />
                </div>
              </div>

              <Slider
                defaultValue={[signingSpeed]}
                value={[signingSpeed]}
                onValueChange={(value) => setSigningSpeed(value[0])}
                min={20}
                max={100}
                step={1}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
