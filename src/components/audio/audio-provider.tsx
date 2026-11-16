"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { WEDDING_PLAYLIST, type WeddingTrack } from "@/data/wedding-playlist";

export interface AudioContextType {
  playlist: WeddingTrack[];
  currentTrackIndex: number;
  currentTrack: WeddingTrack;
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  progress: number;
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string | null;
  trackTitle: string;
  hasAudioSource: boolean;
  showComingSoonNotice: boolean;
  togglePlay: () => void;
  playTrack: (index: number) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  seek: (seconds: number) => void;
  toggleMute: () => void;
  setVolume: (level: number) => void;
  dismissNotice: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

interface AudioProviderProps {
  children: React.ReactNode;
}

export function AudioProvider({ children }: AudioProviderProps) {
  // Autoplay strictly disabled on initial visit
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolumeState] = useState<number>(0.75);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentTrackIndexRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const volumeRef = useRef<number>(0.75);
  const isMutedRef = useRef<boolean>(false);
  const currentTrack = WEDDING_PLAYLIST[currentTrackIndex] || WEDDING_PLAYLIST[0];

  useEffect(() => {
    currentTrackIndexRef.current = currentTrackIndex;
  }, [currentTrackIndex]);

  useEffect(() => {
    volumeRef.current = volume;
    isMutedRef.current = isMuted;
  }, [volume, isMuted]);

  const switchTrack = useCallback(
    (index: number, startPlaying: boolean) => {
      const audio = audioRef.current;
      if (!audio) return;
      const track = WEDDING_PLAYLIST[index];
      if (!track) return;

      setCurrentTrackIndex(index);
      setCurrentTime(0);
      setProgress(0);
      setHasError(false);
      setErrorMessage(null);

      audio.src = track.src;
      audio.currentTime = 0;

      if (startPlaying) {
        setIsLoading(true);
        audio
          .play()
          .then(() => {
            setIsPlaying(true);
            setIsLoading(false);
          })
          .catch((err) => {
            console.warn("Audio play prevented:", err);
            setIsPlaying(false);
            setIsLoading(false);
          });
      } else {
        audio.pause();
        setIsPlaying(false);
      }
    },
    []
  );

  const switchTrackRef = useRef(switchTrack);
  useEffect(() => {
    switchTrackRef.current = switchTrack;
  }, [switchTrack]);

  // Initialize single persistent Audio instance lazily or deferred until idle
  const initAudio = () => {
    if (audioRef.current || typeof window === "undefined") return audioRef.current;

    const audio = new Audio();
    audio.preload = "none";
    audio.volume = volumeRef.current;
    audio.muted = isMutedRef.current;
    const initialTrack = WEDDING_PLAYLIST[currentTrackIndexRef.current] || WEDDING_PLAYLIST[0];
    audio.src = initialTrack.src;
    audioRef.current = audio;

    let lastTimeUpdate = 0;
    const handleTimeUpdate = () => {
      if (!audio) return;
      const now = performance.now();
      // Throttle timeupdate state updates to at most once every 500ms to eliminate high-frequency main-thread re-renders
      if (now - lastTimeUpdate < 500) return;
      lastTimeUpdate = now;

      const cur = audio.currentTime;
      const dur = audio.duration || 0;
      setCurrentTime(cur);
      if (dur > 0) {
        setProgress((cur / dur) * 100);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setIsLoading(false);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setIsLoading(false);
      setHasError(false);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    const handleEnded = () => {
      const nextIdx = (currentTrackIndexRef.current + 1) % WEDDING_PLAYLIST.length;
      switchTrackRef.current(nextIdx, true);
    };

    const handleError = () => {
      setIsPlaying(false);
      setIsLoading(false);
      setHasError(true);
      setErrorMessage("Could not load audio track. Please select another melody.");
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return audio;
  };

  const initAudioRef = useRef(initAudio);
  useEffect(() => {
    initAudioRef.current = initAudio;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    type IdleHandle = number | ReturnType<typeof setTimeout>;
    let idleId: IdleHandle | null = null;
    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(() => initAudioRef.current(), { timeout: 6000 });
    } else {
      idleId = setTimeout(() => initAudioRef.current(), 5000);
    }

    return () => {
      if (idleId !== null) {
        if ("cancelIdleCallback" in window && typeof idleId === "number") {
          window.cancelIdleCallback(idleId);
        } else {
          clearTimeout(idleId as ReturnType<typeof setTimeout>);
        }
      }
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.src = "";
        audioRef.current = null;
      }
    };
  }, []);

  // Sync volume & mute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) {
      initAudioRef.current();
    }
    const audio = audioRef.current;
    if (!audio) return;

    const track = WEDDING_PLAYLIST[currentTrackIndex];
    if (!audio.src || !audio.src.includes(track.src)) {
      audio.src = track.src;
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      setHasError(false);
      setErrorMessage(null);
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch((err) => {
          console.warn("Audio play prevented:", err);
          setIsPlaying(false);
          setIsLoading(false);
          setHasError(true);
          setErrorMessage("Playback was interrupted. Click to play again.");
        });
    }
  }, [currentTrackIndex, isPlaying]);

  const playTrack = useCallback(
    (index: number) => {
      if (index < 0 || index >= WEDDING_PLAYLIST.length) return;
      if (index === currentTrackIndex) {
        togglePlay();
        return;
      }
      switchTrack(index, true);
    },
    [currentTrackIndex, togglePlay, switchTrack]
  );

  const nextTrack = useCallback(() => {
    const nextIdx = (currentTrackIndex + 1) % WEDDING_PLAYLIST.length;
    switchTrack(nextIdx, isPlaying);
  }, [currentTrackIndex, isPlaying, switchTrack]);

  const previousTrack = useCallback(() => {
    const prevIdx =
      (currentTrackIndex - 1 + WEDDING_PLAYLIST.length) % WEDDING_PLAYLIST.length;
    switchTrack(prevIdx, isPlaying);
  }, [currentTrackIndex, isPlaying, switchTrack]);

  const seek = useCallback((seconds: number) => {
    if (!audioRef.current) {
      initAudioRef.current();
    }
    const audio = audioRef.current;
    if (!audio) return;
    const clamped = Math.max(0, Math.min(audio.duration || 0, seconds));
    audio.currentTime = clamped;
    setCurrentTime(clamped);
    if (audio.duration > 0) {
      setProgress((clamped / audio.duration) * 100);
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const setVolume = useCallback((level: number) => {
    const clamped = Math.max(0, Math.min(1, level));
    setVolumeState(clamped);
  }, []);

  const dismissNotice = useCallback(() => {
    setHasError(false);
    setErrorMessage(null);
  }, []);

  const contextValue = useMemo<AudioContextType>(
    () => ({
      playlist: WEDDING_PLAYLIST,
      currentTrackIndex,
      currentTrack,
      isPlaying,
      isMuted,
      volume,
      currentTime,
      duration,
      progress,
      isLoading,
      hasError,
      errorMessage,
      trackTitle: currentTrack.title,
      hasAudioSource: true,
      showComingSoonNotice: hasError,
      togglePlay,
      playTrack,
      nextTrack,
      previousTrack,
      seek,
      toggleMute,
      setVolume,
      dismissNotice,
    }),
    [
      currentTrackIndex,
      currentTrack,
      isPlaying,
      isMuted,
      volume,
      currentTime,
      duration,
      progress,
      isLoading,
      hasError,
      errorMessage,
      togglePlay,
      playTrack,
      nextTrack,
      previousTrack,
      seek,
      toggleMute,
      setVolume,
      dismissNotice,
    ]
  );

  return (
    <AudioContext.Provider value={contextValue}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio(): AudioContextType {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
}
