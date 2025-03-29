import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: number;
  genre: string[];
}

interface PlayerState {
  currentVideo: Video | null;
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  playbackSpeed: number;
}

const initialState: PlayerState = {
  currentVideo: null,
  isPlaying: false,
  currentTime: 0,
  volume: 1,
  isMuted: false,
  isFullscreen: false,
  playbackSpeed: 1,
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setCurrentVideo: (state, action: PayloadAction<Video | null>) => {
      state.currentVideo = action.payload;
      state.currentTime = 0;
    },
    setIsPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
    },
    setCurrentTime: (state, action: PayloadAction<number>) => {
      state.currentTime = action.payload;
    },
    setVolume: (state, action: PayloadAction<number>) => {
      state.volume = action.payload;
    },
    setIsMuted: (state, action: PayloadAction<boolean>) => {
      state.isMuted = action.payload;
    },
    setIsFullscreen: (state, action: PayloadAction<boolean>) => {
      state.isFullscreen = action.payload;
    },
    setPlaybackSpeed: (state, action: PayloadAction<number>) => {
      state.playbackSpeed = action.payload;
    },
    resetPlayer: (state) => {
      return initialState;
    },
  },
});

export const {
  setCurrentVideo,
  setIsPlaying,
  setCurrentTime,
  setVolume,
  setIsMuted,
  setIsFullscreen,
  setPlaybackSpeed,
  resetPlayer,
} = playerSlice.actions;

export default playerSlice.reducer; 