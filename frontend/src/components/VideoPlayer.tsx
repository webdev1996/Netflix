'use client';

import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import Player from 'video.js/dist/types/player';

interface VideoPlayerProps {
  videoUrl: string;
  posterUrl: string;
}

export default function VideoPlayer({ videoUrl, posterUrl }: VideoPlayerProps) {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);
  const dispatch = useDispatch();
  const { isPlaying, currentTime, volume, isMuted, isFullscreen, playbackSpeed } = useSelector(
    (state: RootState) => state.player
  );

  useEffect(() => {
    if (videoRef.current && !playerRef.current) {
      playerRef.current = videojs(videoRef.current, {
        controls: true,
        fluid: true,
        poster: posterUrl,
        sources: [
          {
            src: videoUrl,
            type: 'application/x-mpegURL',
          },
        ],
      });

      // Set initial state
      playerRef.current.currentTime(currentTime);
      playerRef.current.volume(volume);
      playerRef.current.muted(isMuted);
      playerRef.current.playbackRate(playbackSpeed);

      if (isFullscreen) {
        playerRef.current.requestFullscreen();
      }

      // Event listeners
      playerRef.current.on('play', () => {
        dispatch({ type: 'player/setIsPlaying', payload: true });
      });

      playerRef.current.on('pause', () => {
        dispatch({ type: 'player/setIsPlaying', payload: false });
      });

      playerRef.current.on('timeupdate', () => {
        dispatch({ type: 'player/setCurrentTime', payload: playerRef.current?.currentTime() || 0 });
      });

      playerRef.current.on('volumechange', () => {
        dispatch({ type: 'player/setVolume', payload: playerRef.current?.volume() || 1 });
        dispatch({ type: 'player/setIsMuted', payload: playerRef.current?.muted() || false });
      });

      playerRef.current.on('fullscreenchange', () => {
        dispatch({ type: 'player/setIsFullscreen', payload: playerRef.current?.isFullscreen() || false });
      });

      playerRef.current.on('ratechange', () => {
        dispatch({ type: 'player/setPlaybackSpeed', payload: playerRef.current?.playbackRate() || 1 });
      });
    }

    // Cleanup
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [dispatch, videoUrl, posterUrl]);

  // Update player state when Redux state changes
  useEffect(() => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.play();
      } else {
        playerRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.currentTime(currentTime);
    }
  }, [currentTime]);

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.volume(volume);
    }
  }, [volume]);

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.muted(isMuted);
    }
  }, [isMuted]);

  useEffect(() => {
    if (playerRef.current) {
      if (isFullscreen) {
        playerRef.current.requestFullscreen();
      } else {
        playerRef.current.exitFullscreen();
      }
    }
  }, [isFullscreen]);

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.playbackRate(playbackSpeed);
    }
  }, [playbackSpeed]);

  return (
    <div className="relative w-full h-full">
      <div ref={videoRef} className="video-js vjs-big-play-centered" />
    </div>
  );
} 