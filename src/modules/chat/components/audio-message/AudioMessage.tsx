"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "@phosphor-icons/react";
import { Slider } from "antd";

interface AudioMessageProps {
  src: string;
  mine: boolean;
}

function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function AudioMessage({ src, mine }: AudioMessageProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoadedMetadata = () => {
      if (Number.isFinite(audio.duration)) setDuration(audio.duration);
    };
    const onTimeUpdate = () => {
      if (!isSeeking) setCurrentTime(audio.currentTime);
    };
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      audio.currentTime = 0;
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, [isSeeking]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (value: number) => {
    setIsSeeking(true);
    setCurrentTime(value);
  };

  const handleSeekEnd = (value: number) => {
    const audio = audioRef.current;
    if (audio) audio.currentTime = value;
    setCurrentTime(value);
    setIsSeeking(false);
  };

  const trackColor = mine ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.15)";
  const fillColor = mine ? "#CBE71E" : "#011822";
  const handleColor = mine ? "#CBE71E" : "#011822";
  const timeColor = mine ? "rgba(255,255,255,0.7)" : "#6b6b6b";

  return (
    <div className="flex items-center gap-2 min-w-[220px]">
      <audio ref={audioRef} src={src} preload="metadata" />
      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? "Pausar audio" : "Reproducir audio"}
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-80 ${
          mine ? "bg-white/15 text-white" : "bg-[#011822] text-white"
        }`}
      >
        {isPlaying ? <Pause size={14} weight="fill" /> : <Play size={14} weight="fill" />}
      </button>
      <div className="flex-1">
        <Slider
          min={0}
          max={duration || 0}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          onChangeComplete={handleSeekEnd}
          tooltip={{ open: false }}
          styles={{
            track: { background: fillColor },
            rail: { background: trackColor },
            handle: { borderColor: handleColor }
          }}
        />
      </div>
      <span className="text-[11px] tabular-nums shrink-0" style={{ color: timeColor }}>
        {formatDuration(isPlaying || currentTime > 0 ? currentTime : duration)}
      </span>
    </div>
  );
}
