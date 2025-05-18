export interface AudioTrack {
  id: string;
  name: string;
  file?: File;
  url: string;
  lyricsText?: string;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface StoredState {
  trackIndex: number;
  currentTime: number;
  playbackRate: number;
  lyricsText: string;
}

export interface LyricsLine {
  timestamp: string;
  text: string;
  time: number; // in seconds
}

export interface MatchResults {
  success: number;
  failed: number;
} 
