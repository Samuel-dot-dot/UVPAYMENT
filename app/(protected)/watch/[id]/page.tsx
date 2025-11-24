'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  SkipBack,
  SkipForward,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Video = {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  created_at: string;
};

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Video player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Mobile double-tap state
  const [lastTapTime, setLastTapTime] = useState(0);
  const [lastTapSide, setLastTapSide] = useState<'left' | 'right' | null>(null);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const { data, error } = await supabase
          .from('videos')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) throw error;

        if (!data) {
          setError('Video not found');
          return;
        }

        setVideo(data);
      } catch (err) {
        console.error('Error fetching video:', err);
        setError('Failed to load video');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchVideo();
    }
  }, [params.id]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !video) return;

    const handleTimeUpdate = () => setCurrentTime(videoElement.currentTime);
    const handleLoadedMetadata = () => setDuration(videoElement.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
    videoElement.addEventListener('ended', handleEnded);

    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
      videoElement.removeEventListener('ended', handleEnded);
    };
  }, [video]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle keyboard events if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'arrowleft':
        case 'j':
          e.preventDefault();
          skipBackward();
          break;
        case 'arrowright':
        case 'l':
          e.preventDefault();
          skipForward();
          break;
        case 'arrowup':
          e.preventDefault();
          if (videoRef.current) {
            const newVolume = Math.min(volume + 0.1, 1);
            videoRef.current.volume = newVolume;
            setVolume(newVolume);
            setIsMuted(false);
          }
          break;
        case 'arrowdown':
          e.preventDefault();
          if (videoRef.current) {
            const newVolume = Math.max(volume - 0.1, 0);
            videoRef.current.volume = newVolume;
            setVolume(newVolume);
            setIsMuted(newVolume === 0);
          }
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, volume]);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
      if (newMuted) {
        setVolume(0);
      } else {
        videoRef.current.volume = volume || 0.5;
        setVolume(volume || 0.5);
      }
    }
  };

  const skipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(
        videoRef.current.currentTime + 10,
        duration
      );
    }
  };

  const skipBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(
        videoRef.current.currentTime - 10,
        0
      );
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleDoubleTap = (side: 'left' | 'right', e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (side === 'left') {
      skipBackward();
    } else {
      skipForward();
    }
  };

  const handleTap = (side: 'left' | 'right', e: React.MouseEvent | React.TouchEvent) => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapTime;

    // Double tap detection (within 300ms)
    if (timeSinceLastTap < 300 && lastTapSide === side) {
      handleDoubleTap(side, e);
      setLastTapTime(0);
      setLastTapSide(null);
    } else {
      setLastTapTime(now);
      setLastTapSide(side);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 text-electric-violet animate-spin" />
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
          <ArrowLeft className="w-12 h-12 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">{error || 'Video Not Found'}</h1>
        <button
          onClick={() => router.push('/videos')}
          className="px-6 py-3 bg-electric-violet hover:bg-violet-600 text-white rounded-xl transition-colors"
        >
          Back to Videos
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center text-slate-400 hover:text-white transition-colors group"
      >
        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back
      </button>

      {/* Video Player Container */}
      <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl border border-glass-border">
        <div
          className="relative aspect-video bg-black"
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
          onMouseMove={() => setShowControls(true)}
        >
          <video
            ref={videoRef}
            src={video.video_url}
            className="w-full h-full"
          />

          {/* Double-tap zones for mobile/desktop */}
          <div className="absolute inset-0 flex">
            {/* Left zone - Double tap to go back 10s */}
            <div
              className="flex-1 cursor-pointer"
              onClick={(e) => handleTap('left', e)}
              onTouchEnd={(e) => handleTap('left', e)}
            />
            {/* Center zone - Play/Pause */}
            <div
              className="flex-1 cursor-pointer"
              onClick={togglePlayPause}
            />
            {/* Right zone - Double tap to go forward 10s */}
            <div
              className="flex-1 cursor-pointer"
              onClick={(e) => handleTap('right', e)}
              onTouchEnd={(e) => handleTap('right', e)}
            />
          </div>

          {/* Play/Pause Overlay - Show when paused or when hovering during playback */}
          <div
            className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${
              !isPlaying || showControls ? 'opacity-100' : 'opacity-0'
            } ${!isPlaying ? 'bg-black/30' : ''}`}
          >
            <div className="w-24 h-24 bg-electric-violet/90 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-[0_0_40px_rgba(124,58,237,0.6)]">
              {isPlaying ? (
                <Pause className="w-12 h-12 text-white" fill="white" />
              ) : (
                <Play className="w-12 h-12 text-white ml-1" fill="white" />
              )}
            </div>
          </div>

          {/* Video Controls */}
          <div
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 transition-opacity duration-300 ${
              showControls ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Progress Bar */}
            <div className="mb-4">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-slate-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-electric-violet [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer hover:[&::-webkit-slider-thumb]:scale-125 [&::-webkit-slider-thumb]:transition-transform"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Play/Pause */}
                <button
                  onClick={togglePlayPause}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-electric-violet flex items-center justify-center transition-all group"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-white" fill="white" />
                  ) : (
                    <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                  )}
                </button>

                {/* Skip Backward 10s */}
                <button
                  onClick={skipBackward}
                  className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white hover:text-electric-violet transition-all flex items-center"
                  title="Skip backward 10 seconds"
                >
                  <SkipBack className="w-4 h-4" />
                  <span className="text-xs font-semibold ml-1">10s</span>
                </button>

                {/* Skip Forward 10s */}
                <button
                  onClick={skipForward}
                  className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white hover:text-electric-violet transition-all flex items-center"
                  title="Skip forward 10 seconds"
                >
                  <SkipForward className="w-4 h-4" />
                  <span className="text-xs font-semibold ml-1">10s</span>
                </button>

                {/* Volume */}
                <div className="flex items-center space-x-2 group">
                  <button
                    onClick={toggleMute}
                    className="text-white hover:text-electric-violet transition-colors"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-1 bg-slate-700 rounded-full appearance-none cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                </div>
              </div>

              {/* Right Controls */}
              <div className="flex items-center space-x-4">
                {/* Fullscreen */}
                <button
                  onClick={toggleFullscreen}
                  className="text-white hover:text-electric-violet transition-colors"
                >
                  <Maximize className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Info */}
      <div className="bg-white/5 border border-glass-border rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-white mb-4">{video.title}</h1>
        <div className="flex items-center text-slate-400 text-sm mb-6">
          <span>{new Date(video.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</span>
        </div>
        {video.description && (
          <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
            {video.description}
          </div>
        )}
      </div>
    </div>
  );
}
